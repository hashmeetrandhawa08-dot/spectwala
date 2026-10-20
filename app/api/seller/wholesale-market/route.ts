
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SELLER") {
    return NextResponse.json(
      { error: "Seller access only." },
      { status: 403 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        wholesaleStoreId: { not: null },
        status: "ACTIVE",
        stock: { gt: 0 },
        visibility: "WHOLESALE",
        wholesaleStore: {
          is: {
            status: "ACTIVE",
            verification: "APPROVED",
          },
        },
      },
      include: {
        images: true,
        category: true,
        wholesaleStore: {
          select: {
            storeName: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Seller wholesale market GET error:", error);
    return NextResponse.json(
      { error: "Could not load wholesale products." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "SELLER") {
    return NextResponse.json(
      { error: "Seller access only." },
      { status: 403 }
    );
  }

  let body: { productId?: string; quantity?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const productId = String(body.productId || "").trim();
  const quantity = Number(body.quantity);

  if (
    !productId ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > 100000
  ) {
    return NextResponse.json(
      { error: "Enter a valid product and quantity." },
      { status: 400 }
    );
  }

  try {
    const buyer = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, phone: true },
    });

    if (!buyer) {
      return NextResponse.json(
        { error: "Seller account was not found." },
        { status: 404 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        wholesaleStoreId: { not: null },
        status: "ACTIVE",
        visibility: "WHOLESALE",
        wholesaleStore: {
          is: {
            status: "ACTIVE",
            verification: "APPROVED",
          },
        },
      },
      include: {
        wholesaleStore: true,
      },
    });

    if (!product || !product.wholesaleStore) {
      return NextResponse.json(
        { error: "This wholesale product is no longer available." },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} units are available.` },
        { status: 400 }
      );
    }

    const unitPrice = Number(product.wholesalePrice ?? product.price);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return NextResponse.json(
        { error: "This product has an invalid wholesale price." },
        { status: 400 }
      );
    }

    const totalAmount = unitPrice * quantity;

    // Use a transaction so stock cannot be oversold by simultaneous requests.
    const order = await prisma.$transaction(async (tx) => {
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: product.id,
          wholesaleStoreId: product.wholesaleStoreId,
          status: "ACTIVE",
          visibility: "WHOLESALE",
          stock: { gte: quantity },
        },
        data: {
          stock: { decrement: quantity },
        },
      });

      if (stockUpdate.count !== 1) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      return tx.wholesaleOrder.create({
        data: {
          // This schema uses wholesalerId for the buyer's user ID.
          wholesalerId: session.userId,
          wholesaleStoreId: product.wholesaleStoreId!,
          totalAmount,
          buyerName: buyer.name || "Seller",
          buyerPhone: buyer.phone || "",
          buyerAddress: "To be confirmed by seller and wholesaler",
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              unitPrice,
              quantity,
            },
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json(
      { success: true, order },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        { error: "Stock changed while ordering. Refresh and try again." },
        { status: 409 }
      );
    }

    console.error("Seller wholesale order POST error:", error);

    return NextResponse.json(
      { error: "Could not place the wholesale order." },
      { status: 500 }
    );
  }
}
