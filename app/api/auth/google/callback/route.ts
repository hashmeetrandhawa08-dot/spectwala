import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { setUserSession } from "@/app/lib/user-auth";

function roleFromRegistration(type: string) {
  if (type === "MANUFACTURER") {
    return "MANUFACTURER" as const;
  }

  if (type === "OPTICIAN") {
    return "SELLER" as const;
  }

  if (
    [
      "OPTOMETRIST",
      "OPHTHALMOLOGIST",
      "EYE_HOSPITAL",
      "EYE_CAMP",
    ].includes(type)
  ) {
    return "CONSULTANT" as const;
  }

  return "CUSTOMER" as const;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    const cookieStore = await cookies();

    const savedState =
      cookieStore.get("spectwala_google_state")?.value;

    const next =
      cookieStore.get("spectwala_google_next")?.value || "/shop";

    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=google_cancelled", request.url)
      );
    }

    if (
      !code ||
      !state ||
      !savedState ||
      state !== savedState
    ) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_state", request.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_config", request.url)
      );
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=token_exchange", request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    const profileResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=profile", request.url)
      );
    }

    const profile = (await profileResponse.json()) as {
      email?: string;
      name?: string;
      email_verified?: boolean;
    };

    if (
      !profile.email ||
      profile.email_verified !== true
    ) {
      return NextResponse.redirect(
        new URL(
          "/login?error=email_not_verified",
          request.url
        )
      );
    }

    const email = profile.email.toLowerCase().trim();

    const approvedRegistration =
      await prisma.registration.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
          status: "APPROVED",
        },
        orderBy: {
          reviewedAt: "desc",
        },
      });

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (
      existing?.status === "SUSPENDED" &&
      !approvedRegistration
    ) {
      return NextResponse.redirect(
        new URL("/login?error=suspended", request.url)
      );
    }

    const role = approvedRegistration
      ? roleFromRegistration(
          approvedRegistration.type
        )
      : existing?.role ?? "CUSTOMER";

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      create: {
        email,
        name: profile.name || null,
        role,
        status: "ACTIVE",
      },
      update: {
        name: profile.name || undefined,
        role,
        status: "ACTIVE",
      },
    });

    await setUserSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    cookieStore.set(
      "spectwala_google_state",
      "",
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      }
    );

    cookieStore.set(
      "spectwala_google_next",
      "",
      {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      }
    );

    if (
      ["SELLER", "MANUFACTURER", "CONSULTANT"].includes(
        user.role
      )
    ) {
      return NextResponse.redirect(
        new URL("/store-setup", request.url)
      );
    }

    return NextResponse.redirect(
      new URL(
        next.startsWith("/") ? next : "/shop",
        request.url
      )
    );
  } catch (error) {
    console.error(
      "Google callback error:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=google_login",
        request.url
      )
    );
  }
}