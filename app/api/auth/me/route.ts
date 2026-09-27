import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json({
        loggedIn: false,
        user: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        loggedIn: false,
        user: null,
      });
    }

    return NextResponse.json({
      loggedIn: true,
      user,
    });
  } catch {
    return NextResponse.json(
      {
        loggedIn: false,
        user: null,
      },
      { status: 500 }
    );
  }
}