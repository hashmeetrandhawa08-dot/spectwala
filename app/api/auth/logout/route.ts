import { NextResponse } from "next/server";
import { clearUserSession } from "@/app/lib/user-auth";
export async function POST(){await clearUserSession();return NextResponse.json({success:true});}
export async function GET(request:Request){await clearUserSession();return NextResponse.redirect(new URL("/",request.url));}
