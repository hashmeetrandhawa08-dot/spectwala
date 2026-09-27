import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

async function getCart(userId: string) {
  return prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { images: true, seller: true } } } } } });
}

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  return NextResponse.json({ cart: await getCart(session.userId) });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
    const { productId, quantity } = await request.json();
    const qty = Math.max(1, Math.floor(Number(quantity || 1)));
    const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE", visibility: "CUSTOMER" } });
    if (!product) return NextResponse.json({ error: "Product is unavailable." }, { status: 404 });
    if (product.stock < qty) return NextResponse.json({ error: "Not enough stock." }, { status: 400 });
    const cart = await prisma.cart.upsert({ where: { userId: session.userId }, create: { userId: session.userId }, update: {} });
    await prisma.cartItem.upsert({ where: { cartId_productId: { cartId: cart.id, productId } }, create: { cartId: cart.id, productId, quantity: qty }, update: { quantity: { increment: qty } } });
    return NextResponse.json({ success: true, cart: await getCart(session.userId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update cart." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const { productId, quantity } = await request.json();
  const cart = await prisma.cart.findUnique({ where: { userId: session.userId } });
  if (!cart) return NextResponse.json({ error: "Cart not found." }, { status: 404 });
  const qty = Math.floor(Number(quantity));
  if (qty <= 0) await prisma.cartItem.delete({ where: { cartId_productId: { cartId: cart.id, productId } } });
  else await prisma.cartItem.update({ where: { cartId_productId: { cartId: cart.id, productId } }, data: { quantity: qty } });
  return NextResponse.json({ success: true, cart: await getCart(session.userId) });
}
