ALTER TABLE "Order"
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paymentProofData" TEXT,
ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'NOT_REQUIRED';

CREATE INDEX "Order_paymentStatus_idx"
ON "Order"("paymentStatus");