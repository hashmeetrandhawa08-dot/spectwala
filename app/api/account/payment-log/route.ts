import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getUserSession();

  if (!session || !["SELLER", "MANUFACTURER", "WHOLESALER"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { upiId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (session.role === "SELLER") {
      const store = await prisma.store.findUnique({
        where: { ownerId: session.userId },
        select: { id: true, storeName: true },
      });

      if (!store) {
        return NextResponse.json({
          upiId: user.upiId || "",
          orders: [],
          wholesaleOrders: [],
        });
      }

      const orders = await prisma.order.findMany({
        where: { storeId: store.id },
        include: {
          customer: { select: { name: true, email: true, phone: true } },
          store: { select: { storeName: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        upiId: user.upiId || "",
        store,
        orders: orders.map((o) => ({
          ...o,
          totalAmount: o.totalAmount.toString(),
          items: o.items.map((i) => ({
            ...i,
            unitPrice: i.unitPrice.toString(),
          })),
        })),
        wholesaleOrders: [],
      });
    }

    const wholesaleStore = await prisma.wholesaleStore.findUnique({
      where: { ownerId: session.userId },
      select: { id: true, storeName: true },
    });

    if (!wholesaleStore) {
      return NextResponse.json({
        upiId: user.upiId || "",
        orders: [],
        wholesaleOrders: [],
      });
    }

    const wholesaleOrders = await prisma.wholesaleOrder.findMany({
      where: { wholesaleStoreId: wholesaleStore.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      upiId: user.upiId || "",
      store: wholesaleStore,
      orders: [],
      wholesaleOrders: wholesaleOrders.map((o) => ({
        ...o,
        totalAmount: o.totalAmount.toString(),
        items: o.items.map((i) => ({
          ...i,
          unitPrice: i.unitPrice.toString(),
        })),
      })),
    });
  } catch (error) {
    console.error("Payment log load failed:", error);
    return NextResponse.json({ error: "Could not load payment log." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();

  if (!session || !["SELLER", "MANUFACTURER", "WHOLESALER"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const upiId = String(body.upiId || "").trim();

    if (upiId.length > 100 || (upiId && !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId))) {
      return NextResponse.json(
        { error: "Enter a valid UPI ID, such as name@bank." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { upiId: upiId || null },
    });

    return NextResponse.json({ success: true, upiId });
  } catch (error) {
    console.error("UPI update failed:", error);
    return NextResponse.json({ error: "Could not save UPI ID." }, { status: 500 });
  }
}