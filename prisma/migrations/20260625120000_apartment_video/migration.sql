-- CreateTable
CREATE TABLE "ApartmentVideo" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "mobileMp4Url" TEXT NOT NULL,
    "desktopMp4Url" TEXT NOT NULL,
    "posterUrl" TEXT NOT NULL,
    "storageKeyBase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentVideo_apartmentId_key" ON "ApartmentVideo"("apartmentId");

-- CreateIndex
CREATE INDEX "ApartmentVideo_apartmentId_idx" ON "ApartmentVideo"("apartmentId");
