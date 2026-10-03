import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export async function GET() {
  const session = await getUserSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const store = await prisma.store.findUnique({
    where: { ownerId: session.userId },
  });

  if (!store) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { sellerId: store.id },
    include: {
      images: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: session.userId },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Create your store first." },
        { status: 400 }
      );
    }

    // Products can be created only for a properly active store.
    if (
      store.status !== "ACTIVE" ||
      store.verification !== "APPROVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Your store must be approved and active before you can publish products.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock || 0);
    const categoryName = String(
      body.category || "Other"
    ).trim();

    const imageUrls: string[] = [];

    if (Array.isArray(body.images)) {
      for (const value of body.images) {
        const url = String(value || "").trim();
        if (url) imageUrls.push(url);
      }
    }

    // Also accept imageUrl for compatibility with the older product form.
    const imageUrl = String(body.imageUrl || "").trim();
    if (imageUrl && !imageUrls.includes(imageUrl)) {
      imageUrls.push(imageUrl);
    }

    if (
      !name ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Product name and valid price are required.",
        },
        { status: 400 }
      );
    }

    const safeStock = Number.isFinite(stock)
      ? Math.max(0, Math.floor(stock))
      : 0;

    const category = await prisma.category.upsert({
      where: { name: categoryName },
      create: { name: categoryName },
      update: {},
    });

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        stock: safeStock,
        sellerId: store.id,
        categoryId: category.id,
        status:
          safeStock > 0
            ? "ACTIVE"
            : "OUT_OF_STOCK",
        visibility: "CUSTOMER",
        images: {
          create: imageUrls.map((url) => ({
            url,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create product.",
      },
      { status: 500 }
    );
  }
}
