-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payoutPaidAt" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "wholesalePrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "upiId" TEXT;

-- AlterTable
ALTER TABLE "WholesaleOrder" ADD COLUMN     "payoutPaidAt" TIMESTAMP(3),
ADD COLUMN     "payoutStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Order_payoutStatus_idx" ON "Order"("payoutStatus");

-- CreateIndex
CREATE INDEX "WholesaleOrder_payoutStatus_idx" ON "WholesaleOrder"("payoutStatus");
