import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "spectwala_user_session";
const MAX_AGE = 60 * 60 * 24 * 30;

type Session = {
  userId: string;
  email: string;
  role: "CUSTOMER" | "SELLER" | "MANUFACTURER" | "CONSULTANT" | "ADMIN";
  expiresAt: number;
};

function sign(payload: string) {
  const secret = process.env.USER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("USER_SESSION_SECRET is missing.");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createUserToken(session: Omit<Session, "expiresAt">) {
  const full: Session = { ...session, expiresAt: Date.now() + MAX_AGE * 1000 };
  const payload = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function setUserSession(session: Omit<Session, "expiresAt">) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createUserToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getUserSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const expected = sign(payload);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
    if (!session.userId || !session.email || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}
