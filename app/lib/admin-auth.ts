import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "spectwala_admin_session";

type AdminSession = {
  email: string;
  role: "ADMIN";
  expiresAt: number;
};

function verifySignature(payload: string, signature: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [payload, signature] = parts;

    if (!verifySignature(payload, signature)) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;

    if (
      session.role !== "ADMIN" ||
      !session.email ||
      !session.expiresAt ||
      session.expiresAt < Date.now()
    ) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Admin session verification error:", error);
    return null;
  }
}