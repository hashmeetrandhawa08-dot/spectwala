import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  UserRole,
  AccountStatus,
  VerificationStatus,
  ProductStatus,
  ProductVisibility,
} from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
async function main() {
  console.log("🌱 Seeding Spectwala database...");

  // Categories
  const eyeglasses = await prisma.category.upsert({
    where: { name: "Eyeglasses" },
    update: {},
    create: {
      name: "Eyeglasses",
      description: "Prescription and everyday eyeglasses",
    },
  });

  const sunglasses = await prisma.category.upsert({
    where: { name: "Sunglasses" },
    update: {},
    create: {
      name: "Sunglasses",
      description: "Sunglasses for men and women",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { name: "Accessories" },
    update: {},
    create: {
      name: "Accessories",
      description: "Optical accessories and care products",
    },
  });

  // Manufacturer
  const manufacturer = await prisma.user.upsert({
    where: { email: "manufacturer@spectwala.test" },
    update: {},
    create: {
      email: "manufacturer@spectwala.test",
      name: "Spectwala Optics Manufacturing",
      phone: "9000000001",
      role: UserRole.MANUFACTURER,
      status: AccountStatus.ACTIVE,
    },
  });

  // Seller
  const seller = await prisma.user.upsert({
    where: { email: "seller@spectwala.test" },
    update: {},
    create: {
      email: "seller@spectwala.test",
      name: "Rahul Sharma",
      phone: "9000000002",
      role: UserRole.SELLER,
      status: AccountStatus.ACTIVE,
    },
  });

  const store = await prisma.store.upsert({
    where: { ownerId: seller.id },
    update: {},
    create: {
      ownerId: seller.id,
      storeName: "Vision Point Opticals",
      gstNumber: "27ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
      address: "Main Market",
      state: "Maharashtra",
      district: "Aurangabad",
      city: "Chhatrapati Sambhajinagar",
      taluka: "Aurangabad",
      pincode: "431001",
      verification: VerificationStatus.APPROVED,
      status: AccountStatus.ACTIVE,
    },
  });

  // Products
  const product1 = await prisma.product.create({
    data: {
      name: "Classic Black Frame",
      description: "Lightweight everyday optical frame.",
      price: 1499,
      wholesalePrice: 850,
      stock: 25,
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.CUSTOMER,
      sellerId: store.id,
      manufacturerId: manufacturer.id,
      categoryId: eyeglasses.id,
      images: {
        create: {
          url: "https://placehold.co/600x400?text=Classic+Black+Frame",
          altText: "Classic black optical frame",
        },
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Modern Transparent Frame",
      description: "Modern transparent frame for everyday use.",
      price: 1899,
      wholesalePrice: 1050,
      stock: 18,
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.CUSTOMER,
      sellerId: store.id,
      manufacturerId: manufacturer.id,
      categoryId: eyeglasses.id,
      images: {
        create: {
          url: "https://placehold.co/600x400?text=Transparent+Frame",
          altText: "Transparent optical frame",
        },
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Premium UV Sunglasses",
      description: "UV-protected sunglasses with a premium finish.",
      price: 2499,
      wholesalePrice: 1400,
      stock: 12,
      status: ProductStatus.ACTIVE,
      visibility: ProductVisibility.CUSTOMER,
      sellerId: store.id,
      manufacturerId: manufacturer.id,
      categoryId: sunglasses.id,
      images: {
        create: {
          url: "https://placehold.co/600x400?text=UV+Sunglasses",
          altText: "Premium UV sunglasses",
        },
      },
    },
  });

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@spectwala.test" },
    update: {},
    create: {
      email: "customer@spectwala.test",
      name: "Test Customer",
      phone: "9000000003",
      role: UserRole.CUSTOMER,
      status: AccountStatus.ACTIVE,
    },
  });

  // Review
  await prisma.review.upsert({
    where: {
      userId_productId: {
        userId: customer.id,
        productId: product1.id,
      },
    },
    update: {},
    create: {
      userId: customer.id,
      productId: product1.id,
      rating: 5,
      comment: "Good quality frame and comfortable to wear.",
    },
  });

  console.log("✅ Spectwala database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });