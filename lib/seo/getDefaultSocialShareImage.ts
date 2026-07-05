import { getSiteSocialShareImage } from "@/lib/data/propertyAmenities";
import { OG_IMAGE_PATH, absoluteUrl } from "@/lib/seo/constants";

export type SocialShareImage = {
  url: string;
  alt: string;
  /** True when the image comes from a live property gallery photo (not the static fallback). */
  fromPropertyPhoto: boolean;
};

/** Photo for homepage and site-wide social previews. Falls back to static OG asset. */
export async function getDefaultSocialShareImage(): Promise<SocialShareImage> {
  const image = await getSiteSocialShareImage();
  const url = image?.large || image?.medium || image?.thumbnail;

  if (url) {
    return {
      url,
      alt:
        image.altText?.trim() ||
        "Outdoor and common areas at Lofty Xphere Homes",
      fromPropertyPhoto: true,
    };
  }

  return {
    url: absoluteUrl(OG_IMAGE_PATH),
    alt: "Lofty Xphere Homes — Luxury Serviced Apartments",
    fromPropertyPhoto: false,
  };
}
