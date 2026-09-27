import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.userId }, include: { products: { include: { images: true, category: true }, orderBy: { createdAt: "desc" } } } });
  return NextResponse.json({ store });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["SELLER", "MANUFACTURER", "CONSULTANT"].includes(session.role)) return NextResponse.json({ error: "Only professional accounts can create a store." }, { status: 403 });

    const body = await request.json();
    const storeName = String(body.storeName || "").trim();
    if (!storeName) return NextResponse.json({ error: "Store name is required." }, { status: 400 });

    const store = await prisma.store.upsert({
      where: { ownerId: session.userId },
      create: {
        ownerId: session.userId,
        storeName,
        logoUrl: body.logoUrl || null,
        description: body.description || null,
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        address: body.address || null,
        state: body.state || null,
        district: body.district || null,
        city: body.city || null,
        taluka: body.taluka || null,
        pincode: body.pincode || null,
        status: "ACTIVE",
        verification: "APPROVED",
      },
      update: {
        storeName,
        logoUrl: body.logoUrl || null,
        description: body.description || null,
        gstNumber: body.gstNumber || null,
        panNumber: body.panNumber || null,
        address: body.address || null,
        state: body.state || null,
        district: body.district || null,
        city: body.city || null,
        taluka: body.taluka || null,
        pincode: body.pincode || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("Store setup error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save store." }, { status: 500 });
  }
}
