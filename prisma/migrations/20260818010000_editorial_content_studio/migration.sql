-- CreateEnum
CREATE TYPE "EditorialPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "editorial_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "layoutId" TEXT NOT NULL,
    "status" "EditorialPostStatus" NOT NULL DEFAULT 'DRAFT',
    "document" JSONB NOT NULL,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'lxh-editorial',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editorial_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "editorial_posts_status_updatedAt_idx" ON "editorial_posts"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "editorial_posts_category_idx" ON "editorial_posts"("category");

-- CreateIndex
CREATE INDEX "editorial_assets_category_approved_idx" ON "editorial_assets"("category", "approved");

-- CreateIndex
CREATE INDEX "editorial_assets_favorite_idx" ON "editorial_assets"("favorite");
