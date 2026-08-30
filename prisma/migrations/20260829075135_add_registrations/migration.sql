-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('OPTOMETRIST', 'OPTICIAN', 'MANUFACTURER', 'EYE_HOSPITAL', 'OPHTHALMOLOGIST', 'EYE_CAMP');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "type" "RegistrationType" NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "formData" JSONB NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationDocument" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Registration_type_idx" ON "Registration"("type");

-- CreateIndex
CREATE INDEX "Registration_status_idx" ON "Registration"("status");

-- CreateIndex
CREATE INDEX "Registration_createdAt_idx" ON "Registration"("createdAt");

-- AddForeignKey
ALTER TABLE "RegistrationDocument" ADD CONSTRAINT "RegistrationDocument_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
