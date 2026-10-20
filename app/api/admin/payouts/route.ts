
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 }
    );
  }

  try {
    const [orders, wholesaleOrders] = await Promise.all([
      prisma.order.findMany({
        include: {
          customer: {
            select: { name: true, email: true, phone: true },
          },
          store: {
            select: {
              storeName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  upiId: true,
                },
              },
            },
          },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      prisma.wholesaleOrder.findMany({
        include: {
          wholesaleStore: {
            select: {
              storeName: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  upiId: true,
                },
              },
            },
          },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      customerOrders: orders.map((order) => ({
        ...order,
        type: "CUSTOMER_ORDER",
        totalAmount: String(order.totalAmount),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: String(item.unitPrice),
        })),
      })),

      wholesaleOrders: wholesaleOrders.map((order) => ({
        ...order,
        type: "WHOLESALE_ORDER",
        totalAmount: String(order.totalAmount),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: String(item.unitPrice),
        })),
      })),
    });
  } catch (error) {
    console.error("Admin payout list failed:", error);

    return NextResponse.json(
      {
        error: "Could not load payouts.",
        details:
          process.env.NODE_ENV !== "production"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, type, payoutStatus } = body;

    if (
      typeof id !== "string" ||
      !id ||
      !["CUSTOMER_ORDER", "WHOLESALE_ORDER"].includes(type) ||
      !["PENDING", "PAID"].includes(payoutStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid payout update." },
        { status: 400 }
      );
    }

    const data = {
      payoutStatus,
      payoutPaidAt: payoutStatus === "PAID" ? new Date() : null,
    };

    if (type === "CUSTOMER_ORDER") {
      const result = await prisma.order.updateMany({
        where: { id },
        data,
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Customer order not found." },
          { status: 404 }
        );
      }
    } else {
      const result = await prisma.wholesaleOrder.updateMany({
        where: { id },
        data,
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Wholesale order not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true, payoutStatus });
  } catch (error) {
    console.error("Admin payout update failed:", error);

    return NextResponse.json(
      {
        error: "Could not update payout.",
        details:
          process.env.NODE_ENV !== "production"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
