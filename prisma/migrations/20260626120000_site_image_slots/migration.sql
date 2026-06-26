-- CreateTable
CREATE TABLE "SiteImageSlot" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "sectionLabel" TEXT NOT NULL,
    "amenitySlug" TEXT NOT NULL,
    "imageIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteImageSlot_pkey" PRIMARY KEY ("key")
);

-- Seed default slots (Outdoor & common areas photos #8 and #9 on About; #9 on Experience)
INSERT INTO "SiteImageSlot" ("key", "label", "pagePath", "sectionLabel", "amenitySlug", "imageIndex", "createdAt", "updatedAt")
VALUES
  (
    'experience-hero',
    'Experience page hero',
    '/experience',
    'Wide banner at top',
    'outdoor-lounge',
    8,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'about-story',
    'About page — Our Story',
    '/about',
    'First large photo (Our Story section)',
    'outdoor-lounge',
    7,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'about-why-choose-us',
    'About page — Why Choose Us',
    '/about',
    'Second large photo (Why Choose Us section)',
    'outdoor-lounge',
    8,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("key") DO NOTHING;
