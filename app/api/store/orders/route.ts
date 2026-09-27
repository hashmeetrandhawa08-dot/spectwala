import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.userId } });
  if (!store) return NextResponse.json({ orders: [] });
  const orders = await prisma.order.findMany({ where: { storeId: store.id }, include: { customer: { select: { name: true, email: true } }, items: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}

export async function PATCH(request: NextRequest) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.userId } });
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  const { orderId, status } = await request.json();
  const allowed = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  const order = await prisma.order.updateMany({ where: { id: orderId, storeId: store.id }, data: { status } });
  if (!order.count) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
