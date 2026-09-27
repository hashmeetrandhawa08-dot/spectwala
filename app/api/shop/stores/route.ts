import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({ where: { status: "ACTIVE" }, include: { _count: { select: { products: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ stores });
}
