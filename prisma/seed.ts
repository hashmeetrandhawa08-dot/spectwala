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

  // No demo seller/store/products are created here.
  // Real sellers create their store through the application after approval.

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