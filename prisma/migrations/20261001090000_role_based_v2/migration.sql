-- Spectwala V2 role-based marketplace
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'WHOLESALER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EYE_CAMP';
ALTER TYPE "ProductVisibility" ADD VALUE IF NOT EXISTS 'WHOLESALE';

CREATE TABLE "WholesaleStore" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "storeName" TEXT NOT NULL,
  "logoUrl" TEXT,
  "description" TEXT,
  "gstNumber" TEXT,
  "panNumber" TEXT,
  "address" TEXT,
  "state" TEXT,
  "district" TEXT,
  "city" TEXT,
  "taluka" TEXT,
  "pincode" TEXT,
  "verification" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WholesaleStore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WholesaleStore_ownerId_key" ON "WholesaleStore"("ownerId");
CREATE UNIQUE INDEX "WholesaleStore_gstNumber_key" ON "WholesaleStore"("gstNumber");

CREATE TABLE "EyeCamp" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logoUrl" TEXT,
  "bio" TEXT,
  "organizationType" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "state" TEXT,
  "district" TEXT,
  "city" TEXT,
  "address" TEXT,
  "verification" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EyeCamp_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EyeCamp_ownerId_key" ON "EyeCamp"("ownerId");

CREATE TABLE "EyeCampPost" (
  "id" TEXT NOT NULL,
  "eyeCampId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "eventDate" TIMESTAMP(3),
  "timeText" TEXT,
  "venue" TEXT,
  "contact" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EyeCampPost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EyeCampPost_eyeCampId_idx" ON "EyeCampPost"("eyeCampId");
CREATE INDEX "EyeCampPost_createdAt_idx" ON "EyeCampPost"("createdAt");

CREATE TABLE "WholesaleOrder" (
  "id" TEXT NOT NULL,
  "wholesalerId" TEXT NOT NULL,
  "wholesaleStoreId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "buyerName" TEXT NOT NULL,
  "buyerPhone" TEXT NOT NULL,
  "buyerAddress" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WholesaleOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WholesaleOrder_wholesalerId_idx" ON "WholesaleOrder"("wholesalerId");
CREATE INDEX "WholesaleOrder_wholesaleStoreId_idx" ON "WholesaleOrder"("wholesaleStoreId");

CREATE TABLE "WholesaleOrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WholesaleOrderItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Product" ADD COLUMN "wholesaleStoreId" TEXT;
CREATE INDEX "Product_wholesaleStoreId_idx" ON "Product"("wholesaleStoreId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_wholesaleStoreId_fkey" FOREIGN KEY ("wholesaleStoreId") REFERENCES "WholesaleStore"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WholesaleStore" ADD CONSTRAINT "WholesaleStore_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EyeCamp" ADD CONSTRAINT "EyeCamp_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EyeCampPost" ADD CONSTRAINT "EyeCampPost_eyeCampId_fkey" FOREIGN KEY ("eyeCampId") REFERENCES "EyeCamp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WholesaleOrder" ADD CONSTRAINT "WholesaleOrder_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WholesaleOrder" ADD CONSTRAINT "WholesaleOrder_wholesaleStoreId_fkey" FOREIGN KEY ("wholesaleStoreId") REFERENCES "WholesaleStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WholesaleOrderItem" ADD CONSTRAINT "WholesaleOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WholesaleOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WholesaleOrderItem" ADD CONSTRAINT "WholesaleOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
