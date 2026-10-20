
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserSession } from "@/app/lib/user-auth";

export const runtime = "nodejs";

const MAX_PROOF_SIZE = 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function GET() {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: "Login required." },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Never return the full payment screenshot in the customer
    // order-list response.
    const safeOrders = orders.map(
      ({ paymentProofData, ...order }) => ({
        ...order,
        hasPaymentProof: Boolean(paymentProofData),
      })
    );

    return NextResponse.json({ orders: safeOrders });
  } catch (error) {
    console.error("Get orders failed:", error);

    return NextResponse.json(
      { error: "Could not load orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: "Login required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const shippingName = String(
      formData.get("shippingName") ?? ""
    ).trim();

    const phone = String(
      formData.get("phone") ?? ""
    ).trim();

    const address = String(
      formData.get("address") ?? ""
    ).trim();

    const paymentReference = String(
      formData.get("paymentReference") ?? ""
    ).trim();

    const proof = formData.get("paymentProof");

    if (
      !shippingName ||
      !phone ||
      !address
    ) {
      return NextResponse.json(
        { error: "Name, phone and address are required." },
        { status: 400 }
      );
    }

    if (
      shippingName.length > 120 ||
      phone.length > 20 ||
      address.length > 2000
    ) {
      return NextResponse.json(
        { error: "Please check the length of your delivery details." },
        { status: 400 }
      );
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
        { status: 400 }
      );
    }

    if (
      paymentReference.length < 4 ||
      paymentReference.length > 100
    ) {
      return NextResponse.json(
        { error: "Enter a valid UPI transaction reference." },
        { status: 400 }
      );
    }

    if (
      typeof proof === "string" ||
      !proof ||
      proof.size === 0
    ) {
      return NextResponse.json(
        { error: "Please upload your payment screenshot." },
        { status: 400 }
      );
    }

    if (proof.size > MAX_PROOF_SIZE) {
      return NextResponse.json(
        { error: "Screenshot must be 1 MB or smaller." },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(proof.type)) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, or WebP screenshot." },
        { status: 400 }
      );
    }

    const imageBytes = Buffer.from(await proof.arrayBuffer());

    // Basic file-signature validation. MIME type alone is not trusted.
    const isJpeg =
      imageBytes.length >= 3 &&
      imageBytes[0] === 0xff &&
      imageBytes[1] === 0xd8 &&
      imageBytes[2] === 0xff;

    const isPng =
      imageBytes.length >= 8 &&
      imageBytes.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      );

    const isWebp =
      imageBytes.length >= 12 &&
      imageBytes.toString("ascii", 0, 4) === "RIFF" &&
      imageBytes.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: "The uploaded file is not a supported image." },
        { status: 400 }
      );
    }

    const imageMime = isJpeg
      ? "image/jpeg"
      : isPng
        ? "image/png"
        : "image/webp";

    const paymentProofData =
      `data:${imageMime};base64,${imageBytes.toString("base64")}`;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: { seller: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Keep separate orders for each seller's store.
    const groups = new Map<
      string,
      typeof cart.items
    >();

    for (const item of cart.items) {
      if (!item.product.sellerId || !item.product.seller) {
        return NextResponse.json(
          {
            error:
              `${item.product.name} does not have a valid seller store.`,
          },
          { status: 400 }
        );
      }

      const group =
        groups.get(item.product.sellerId) ?? [];

      group.push(item);
      groups.set(item.product.sellerId, group);
    }

    const orders = await prisma.$transaction(async (tx) => {
      const createdOrders = [];

      // Validate all items before reducing any stock.
      for (const item of cart.items) {
        const fresh = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!fresh || fresh.status !== "ACTIVE") {
          throw new Error(
            `${item.product.name} is no longer available.`
          );
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          fresh.stock < item.quantity
        ) {
          throw new Error(
            `${item.product.name} is out of stock or has insufficient stock.`
          );
        }
      }

      for (const [storeId, items] of groups) {
        let total = 0;

        for (const item of items) {
          total += Number(item.product.price) * item.quantity;
        }

        for (const item of items) {
          const fresh = await tx.product.findUniqueOrThrow({
            where: { id: item.productId },
          });

          const updatedStock = fresh.stock - item.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              status:
                updatedStock > 0
                  ? "ACTIVE"
                  : "OUT_OF_STOCK",
            },
          });
        }

        const order = await tx.order.create({
          data: {
            customerId: session.userId,
            storeId,
            totalAmount: total,
            shippingName,
            phone,
            address,
            paymentMethod: "UPI",
            paymentReference,
            paymentProofData,
            paymentStatus: "PENDING_REVIEW",
            status: "PENDING",
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                quantity: item.quantity,
                unitPrice: item.product.price,
              })),
            },
          },
          include: {
            items: true,
            store: true,
          },
        });

        createdOrders.push(order);
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrders;
    });

    const safeOrders = orders.map(
      ({ paymentProofData: _proof, ...order }) => order
    );

    return NextResponse.json(
      {
        success: true,
        orders: safeOrders,
        message:
          "Order submitted. Payment is awaiting admin verification.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Place UPI order failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to place your order.",
      },
      { status: 400 }
    );
  }
}
