-- CreateEnum
CREATE TYPE "PostTemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "post_templates" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "presetKey" TEXT,
    "status" "PostTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "document" JSONB NOT NULL,
    "createdByEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_templates_status_updatedAt_idx" ON "post_templates"("status", "updatedAt");
