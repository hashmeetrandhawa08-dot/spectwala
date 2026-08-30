import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "spectwala_admin_session";

function verifySessionToken(token: string) {
  try {
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

    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    if (!decodedPayload.email) {
      return false;
    }

    if (decodedPayload.role !== "ADMIN") {
      return false;
    }

    if (!decodedPayload.expiresAt) {
      return false;
    }

    if (Date.now() > decodedPayload.expiresAt) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Session verification error:", error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Only protect the admin dashboard.
   *
   * /admin/login remains public.
   */
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

    if (!sessionToken || !verifySessionToken(sessionToken)) {
      const loginUrl = new URL("/admin/login", request.url);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};