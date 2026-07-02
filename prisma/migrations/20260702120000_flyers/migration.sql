-- CreateEnum
CREATE TYPE "FlyerStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Flyer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "pageSize" TEXT NOT NULL DEFAULT 'a5-portrait',
    "status" "FlyerStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB NOT NULL,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flyer_status_updatedAt_idx" ON "Flyer"("status", "updatedAt");
