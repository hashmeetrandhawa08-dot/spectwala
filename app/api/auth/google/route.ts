import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return NextResponse.json(
        {
          error: "Google OAuth environment variables are missing.",
        },
        { status: 500 }
      );
    }

    const requestUrl = new URL(request.url);

    /*
     * Automatically create the callback URL from the current website.
     *
     * Local:
     * http://localhost:3000/api/auth/google/callback
     *
     * Production:
     * https://spectwala.vercel.app/api/auth/google/callback
     */
    const redirectUri = new URL(
      "/api/auth/google/callback",
      requestUrl.origin
    ).toString();

    const nextParam = requestUrl.searchParams.get("next");

    const next =
      nextParam && nextParam.startsWith("/")
        ? nextParam
        : "/shop";

    const role =
      requestUrl.searchParams.get("role") || "customer";

    const state = crypto.randomBytes(24).toString("hex");

    const cookieStore = await cookies();

    cookieStore.set(
      "spectwala_google_state",
      state,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600,
      }
    );

    cookieStore.set(
      "spectwala_google_next",
      next,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600,
      }
    );

    cookieStore.set(
      "spectwala_google_role",
      role,
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 600,
      }
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
      state,
    });

    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  } catch (error) {
    console.error("Google OAuth start error:", error);

    return NextResponse.json(
      {
        error: "Unable to start Google login.",
      },
      { status: 500 }
    );
  }
}