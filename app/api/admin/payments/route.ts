
import { NextResponse } from "next/server";
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
    const orders = await prisma.order.findMany({
      where: { paymentMethod: "UPI" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        store: {
          select: {
            id: true,
            storeName: true,
            ownerId: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        totalAmount: order.totalAmount.toString(),
        paymentProofData: order.paymentProofData,
        paymentReference: order.paymentReference,
        paymentStatus: order.paymentStatus,
      })),
    });
  } catch (error) {
    console.error("Admin payment list failed:", error);

    return NextResponse.json(
      { error: "Could not load payment records." },
      { status: 500 }
    );
  }
}
