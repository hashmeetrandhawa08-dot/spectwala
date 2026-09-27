import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await prisma.store.findFirst({ where: { id, status: "ACTIVE" }, include: { owner: { select: { name: true } }, products: { where: { status: "ACTIVE", visibility: "CUSTOMER" }, include: { images: true, category: true }, orderBy: { createdAt: "desc" } } } });
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });
  return NextResponse.json({ store });
}
