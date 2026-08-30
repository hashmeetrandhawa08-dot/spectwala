import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, rejectionReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required." },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.update({
      where: {
        id,
      },
      data: {
        status,
        rejectionReason:
          status === "REJECTED"
            ? rejectionReason || "Registration rejected by admin."
            : null,
        reviewedAt:
          status === "PENDING"
            ? null
            : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Registration ${status.toLowerCase()} successfully.`,
      registration,
    });
  } catch (error) {
    console.error("Registration update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update registration.",
      },
      { status: 500 }
    );
  }
}