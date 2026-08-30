import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";

const COOKIE_NAME = "spectwala_admin_session";

function verifyAdminSession(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((cookie) => {
        const [key, ...value] = cookie.trim().split("=");
        return [key, value.join("=")];
      })
    );

    const token = cookies[COOKIE_NAME];

    if (!token) {
      return false;
    }

    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    if (decoded.role !== "ADMIN") {
      return false;
    }

    if (!decoded.expiresAt || Date.now() > decoded.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/* =========================================================
   PUBLIC REGISTRATION
   ========================================================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      type,
      name,
      email,
      phone,
      formData,
      documents = [],
    } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Registration type is required." },
        { status: 400 }
      );
    }

    if (!formData) {
      return NextResponse.json(
        { success: false, error: "Form data is required." },
        { status: 400 }
      );
    }

    const registration = await prisma.registration.create({
      data: {
        type,
        name: name || null,
        email: email || null,
        phone: phone || null,
        formData,

        documents: {
          create: Array.isArray(documents)
            ? documents.map(
                (document: {
                  documentType: string;
                  url: string;
                  fileName?: string;
                }) => ({
                  documentType: document.documentType,
                  url: document.url,
                  fileName: document.fileName || null,
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
        message: "Registration submitted successfully.",
        registrationId: registration.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit registration.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADMIN — GET REGISTRATIONS
   ========================================================= */

export async function GET(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  try {
    const registrations = await prisma.registration.findMany({
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
    console.error("Registration fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch registrations.",
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   ADMIN — APPROVE / REJECT
   ========================================================= */

export async function PATCH(request: Request) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  try {
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

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Status must be APPROVED or REJECTED.",
        },
        { status: 400 }
      );
    }

    if (
      status === "REJECTED" &&
      (!rejectionReason || !String(rejectionReason).trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Rejection reason is required.",
        },
        { status: 400 }
      );
    }

    const registration =
      await prisma.registration.update({
        where: {
          id,
        },

        data: {
          status,

          rejectionReason:
            status === "REJECTED"
              ? String(rejectionReason).trim()
              : null,

          reviewedAt: new Date(),
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