import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { customerId: session.userId }, include: { items: { include: { product: { include: { images: true } } } }, store: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
    const body = await request.json();
    const shippingName = String(body.shippingName || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    if (!shippingName || !phone || !address) return NextResponse.json({ error: "Name, phone and address are required." }, { status: 400 });

    const cart = await prisma.cart.findUnique({ where: { userId: session.userId }, include: { items: { include: { product: { include: { seller: true } } } } } });
    if (!cart || cart.items.length === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

    const groups = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      if (!item.product.sellerId || !item.product.seller) continue;
      const current = groups.get(item.product.sellerId) || [];
      current.push(item);
      groups.set(item.product.sellerId, current);
    }

    const orders = [];
    for (const [storeId, items] of groups) {
      let total = 0;
      for (const item of items) total += Number(item.product.price) * item.quantity;
      const order = await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const fresh = await tx.product.findUnique({ where: { id: item.productId } });
          if (!fresh || fresh.stock < item.quantity) throw new Error(`${item.product.name} is out of stock.`);
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, status: fresh.stock - item.quantity > 0 ? "ACTIVE" : "OUT_OF_STOCK" } });
        }
        return tx.order.create({ data: { customerId: session.userId, storeId, totalAmount: total, shippingName, phone, address, paymentMethod: "COD", status: "PENDING", items: { create: items.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.product.price, productName: item.product.name })) } }, include: { items: true, store: true } });
      });
      orders.push(order);
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return NextResponse.json({ success: true, orders }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to place order." }, { status: 500 });
  }
}
