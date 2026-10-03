import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const stores = await prisma.store.findMany({
    where: {
      status: "ACTIVE",
      verification: "APPROVED",
    },
    include: {
      _count: {
        select: {
          products: {
            where: {
              status: "ACTIVE",
              visibility: "CUSTOMER",
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ stores });
}
