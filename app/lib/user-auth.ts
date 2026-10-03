import { cookies } from "next/headers";
import crypto from "crypto";

export const COOKIE_NAME = "spectwala_user_session";
const MAX_AGE = 60 * 60 * 24 * 30;
export type AppRole = "CUSTOMER" | "SELLER" | "MANUFACTURER" | "CONSULTANT" | "ADMIN" | "WHOLESALER" | "EYE_CAMP";
type Session = { userId: string; email: string; role: AppRole; expiresAt: number };
function sign(payload:string){const secret=process.env.USER_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET;if(!secret)throw new Error("USER_SESSION_SECRET is missing.");return crypto.createHmac("sha256",secret).update(payload).digest("base64url");}
export function createUserToken(session:Omit<Session,"expiresAt">){const full={...session,expiresAt:Date.now()+MAX_AGE*1000};const payload=Buffer.from(JSON.stringify(full)).toString("base64url");return `${payload}.${sign(payload)}`;}
export async function setUserSession(session:Omit<Session,"expiresAt">){const c=await cookies();c.set(COOKIE_NAME,createUserToken(session),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:MAX_AGE});}
export async function getUserSession():Promise<Session|null>{try{const c=await cookies();const token=c.get(COOKIE_NAME)?.value;if(!token)return null;const [payload,signature]=token.split(".");if(!payload||!signature)return null;const expected=sign(payload);const a=Buffer.from(signature),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;const s=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as Session;if(!s.userId||!s.email||s.expiresAt<Date.now())return null;return s;}catch{return null;}}
export async function clearUserSession(){const c=await cookies();c.set(COOKIE_NAME,"",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:0});}
export function roleHome(role:AppRole){if(role==="CUSTOMER")return "/shop";if(role==="SELLER")return "/seller";if(role==="WHOLESALER"||role==="MANUFACTURER")return "/wholesale";if(role==="EYE_CAMP")return "/eye-camp";return "/";}
