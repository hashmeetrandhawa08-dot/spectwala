import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.trim() || "";
    const category = url.searchParams.get("category")?.trim() || "";
    const storeId = url.searchParams.get("storeId")?.trim() || "";

    const products = await prisma.product.findMany({
      where: {
        // Product must actually be published
        status: "ACTIVE",

        // Product must be visible to customers
        visibility: "CUSTOMER",

        // IMPORTANT:
        // Product MUST belong to a real active store.
        seller: {
          status: "ACTIVE",
          verification: "APPROVED",

          ...(storeId
            ? {
                id: storeId,
              }
            : {}),
        },

        ...(category && category !== "All"
          ? {
              category: {
                name: category,
              },
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  category: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  seller: {
                    storeName: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        category: true,
        images: true,

        seller: {
          select: {
            id: true,
            storeName: true,
            logoUrl: true,
            description: true,
            city: true,
            district: true,
            state: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load products.",
      },
      {
        status: 500,
      }
    );
  }
}