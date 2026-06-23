-- CreateTable
CREATE TABLE "HeroVideo" (
    "id" TEXT NOT NULL,
    "mobileMp4Url" TEXT NOT NULL,
    "desktopMp4Url" TEXT NOT NULL,
    "posterUrl" TEXT NOT NULL,
    "storageKeyBase" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroVideo_isActive_idx" ON "HeroVideo"("isActive");
