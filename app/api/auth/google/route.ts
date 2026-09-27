import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Google OAuth environment variables are missing.",
      },
      { status: 500 }
    );
  }

  const url = new URL(request.url);

  const next =
    url.searchParams.get("next") &&
    url.searchParams.get("next")!.startsWith("/")
      ? url.searchParams.get("next")!
      : "/shop";

  const state = crypto.randomBytes(24).toString("hex");

  const cookieStore = await cookies();

  cookieStore.set("spectwala_google_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  cookieStore.set("spectwala_google_next", next, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

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
}