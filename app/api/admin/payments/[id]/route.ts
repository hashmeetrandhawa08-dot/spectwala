
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("paymentStatus" in body)
    ) {
      return NextResponse.json(
        { error: "Payment status is required." },
        { status: 400 }
      );
    }

    const paymentStatus = body.paymentStatus;

    if (
      paymentStatus !== "VERIFIED" &&
      paymentStatus !== "REJECTED"
    ) {
      return NextResponse.json(
        { error: "Status must be VERIFIED or REJECTED." },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        paymentMethod: true,
      },
    });

    if (!existing || existing.paymentMethod !== "UPI") {
      return NextResponse.json(
        { error: "UPI order not found." },
        { status: 404 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
      select: {
        id: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Admin payment update failed:", error);

    return NextResponse.json(
      { error: "Could not update payment status." },
      { status: 500 }
    );
  }
}
