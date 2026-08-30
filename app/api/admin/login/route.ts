import { NextResponse } from "next/server";
import crypto from "crypto";

function createSessionToken(email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  const payload = Buffer.from(
    JSON.stringify({
      email,
      role: "ADMIN",
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials are not configured.");
      
      return NextResponse.json(
        {
          error: "Admin login is not configured on the server.",
        },
        { status: 500 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        {
          error: "Invalid admin email or password.",
        },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken(email);

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });

    response.cookies.set({
      name: "spectwala_admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Unable to process admin login.",
      },
      { status: 500 }
    );
  }
}