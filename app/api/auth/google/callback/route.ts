import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import {
  setUserSession,
  roleHome,
} from "@/app/lib/user-auth";

function roleFromRegistration(type: string) {
  if (type === "OPTICIAN") {
    return "SELLER" as const;
  }

  if (type === "MANUFACTURER") {
    return "WHOLESALER" as const;
  }

  if (type === "EYE_CAMP") {
    return "EYE_CAMP" as const;
  }

  if (
    ["OPTOMETRIST", "OPHTHALMOLOGIST", "EYE_HOSPITAL"].includes(type)
  ) {
    return "CONSULTANT" as const;
  }

  return "CUSTOMER" as const;
}

function professional(role: string) {
  return ["seller", "wholesaler", "eye_camp"].includes(role);
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    const cookieStore = await cookies();

    const savedState =
      cookieStore.get("spectwala_google_state")?.value;

    const next =
      cookieStore.get("spectwala_google_next")?.value || "/shop";

    const requestedRole =
      cookieStore.get("spectwala_google_role")?.value || "customer";

    /*
     * IMPORTANT:
     * Generate the redirect URI from the current website.
     *
     * Local:
     * http://localhost:3000/api/auth/google/callback
     *
     * Production:
     * https://spectwala.vercel.app/api/auth/google/callback
     */
    const redirectUri = new URL(
      "/api/auth/google/callback",
      url.origin
    ).toString();

    if (oauthError) {
      return NextResponse.redirect(
        new URL(
          "/login?error=google_cancelled",
          request.url
        )
      );
    }

    if (
      !code ||
      !state ||
      !savedState ||
      state !== savedState
    ) {
      return NextResponse.redirect(
        new URL(
          "/login?error=oauth_state",
          request.url
        )
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL(
          "/login?error=oauth_config",
          request.url
        )
      );
    }

    /*
     * Exchange Google authorization code
     * for an access token.
     */
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
      const tokenError = await tokenResponse.text();

      console.error(
        "Google token exchange failed:",
        tokenError
      );

      return NextResponse.redirect(
        new URL(
          "/login?error=token_exchange",
          request.url
        )
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        new URL(
          "/login?error=token_exchange",
          request.url
        )
      );
    }

    /*
     * Get Google profile.
     */
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
        new URL(
          "/login?error=profile",
          request.url
        )
      );
    }

    const profile =
      (await profileResponse.json()) as {
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

    const email = profile.email
      .toLowerCase()
      .trim();

    /*
     * Check approved professional registration.
     */
    const approved =
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

    /*
     * Check existing user.
     */
    const existing =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * Suspended accounts cannot login
     * unless they have a newly approved registration.
     */
    if (
      existing?.status === "SUSPENDED" &&
      !approved
    ) {
      return NextResponse.redirect(
        new URL(
          "/login?error=suspended",
          request.url
        )
      );
    }

    /*
     * Determine role.
     */
    let role = approved
      ? roleFromRegistration(approved.type)
      : existing?.role || "CUSTOMER";

    /*
     * Professional accounts require approval.
     */
    if (
      professional(requestedRole) &&
      !approved &&
      !(
        existing &&
        ["SELLER", "WHOLESALER", "EYE_CAMP"].includes(
          existing.role
        )
      )
    ) {
      return NextResponse.redirect(
        new URL(
          `/login?error=approval_required&role=${encodeURIComponent(
            requestedRole
          )}`,
          request.url
        )
      );
    }

    /*
     * Create/update user.
     */
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

    /*
     * Create Spectwala login session.
     */
    await setUserSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    /*
     * Remove OAuth cookies.
     */
    for (const key of [
      "spectwala_google_state",
      "spectwala_google_next",
      "spectwala_google_role",
    ]) {
      cookieStore.set(
        key,
        "",
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 0,
        }
      );
    }

    /*
     * Send user to the correct interface.
     */
    return NextResponse.redirect(
      new URL(
        roleHome(user.role),
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