import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const demoNames = [
    "Classic Black Frame",
    "Modern Transparent Frame",
    "Premium UV Sunglasses",
  ];

  const deleted = await prisma.product.deleteMany({
    where: {
      name: { in: demoNames },
      seller: {
        storeName: "Vision Point Opticals",
      },
    },
  });

  console.log(`Removed ${deleted.count} old demo products.`);
}

main()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
