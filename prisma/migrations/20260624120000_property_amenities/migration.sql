-- CreateTable
CREATE TABLE "PropertyAmenity" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyAmenityImage" (
    "id" TEXT NOT NULL,
    "amenityId" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "mediumUrl" TEXT NOT NULL,
    "largeUrl" TEXT NOT NULL,
    "blurDataUrl" TEXT,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyAmenityImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAmenity_slug_key" ON "PropertyAmenity"("slug");

-- CreateIndex
CREATE INDEX "PropertyAmenity_isPublished_displayOrder_idx" ON "PropertyAmenity"("isPublished", "displayOrder");

-- CreateIndex
CREATE INDEX "PropertyAmenityImage_amenityId_displayOrder_idx" ON "PropertyAmenityImage"("amenityId", "displayOrder");

-- AddForeignKey
ALTER TABLE "PropertyAmenityImage" ADD CONSTRAINT "PropertyAmenityImage_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "PropertyAmenity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default amenities
INSERT INTO "PropertyAmenity" ("id", "slug", "name", "shortDescription", "description", "displayOrder", "isPublished", "createdAt", "updatedAt")
VALUES
  ('prop-amenity-pool', 'pool', 'Pool', 'A refreshing shared pool for guests to unwind.', 'Take a dip in our shared pool — the perfect way to cool off after a day in Abuja.', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prop-amenity-gym', 'gym', 'Gym', 'Stay on track with our on-site fitness space.', 'A well-equipped gym so you can keep your routine while you travel.', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prop-amenity-bar', 'bar', 'Bar', 'Unwind with drinks in a relaxed setting.', 'Our bar lounge is ideal for evening drinks and casual conversation.', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('prop-amenity-outdoor', 'outdoor-lounge', 'Outdoor & common areas', 'Open-air lounges and landscaped common spaces.', 'Stroll through outdoor lounges and intersection spaces designed for calm and connection.', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
