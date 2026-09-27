import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const registrations =
      await prisma.registration.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          documents: true,
        },
      });

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error(
      "GET /api/registrations error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load registrations.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,
      name,
      email,
      phone,
      formData,
      documents,
    } = body;

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration type is required.",
        },
        { status: 400 }
      );
    }

    const registration =
      await prisma.registration.create({
        data: {
          type,
          name: name || null,
          email: email || null,
          phone: phone || null,
          formData: formData || {},

          documents: {
            create: Array.isArray(documents)
              ? documents.map(
                  (document: {
                    documentType: string;
                    url: string;
                    fileName?: string;
                  }) => ({
                    documentType:
                      document.documentType,
                    url: document.url,
                    fileName:
                      document.fileName || null,
                  })
                )
              : [],
          },
        },

        include: {
          documents: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        registration,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/registrations error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create registration.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      id,
      status,
      rejectionReason,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid registration status.",
        },
        { status: 400 }
      );
    }

    if (
      status === "REJECTED" &&
      !rejectionReason?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please provide a rejection reason.",
        },
        { status: 400 }
      );
    }

    const existingRegistration =
      await prisma.registration.findUnique({
        where: {
          id,
        },
      });

    if (!existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration not found.",
        },
        { status: 404 }
      );
    }

    const updatedRegistration =
      await prisma.registration.update({
        where: {
          id,
        },

        data: {
          status,
          reviewedAt: new Date(),

          rejectionReason:
            status === "REJECTED"
              ? rejectionReason.trim()
              : null,

          reviewedBy:
            typeof admin === "string"
              ? admin
              : null,
        },

        include: {
          documents: true,
        },
      });

    return NextResponse.json({
      success: true,

      message:
        status === "APPROVED"
          ? "Registration approved successfully."
          : "Registration rejected successfully.",

      registration: updatedRegistration,
    });
  } catch (error) {
    console.error(
      "PATCH /api/registrations error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update registration.",
      },
      { status: 500 }
    );
  }
}