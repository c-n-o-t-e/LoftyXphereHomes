import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";

export { SITE_NAME as SITE_BRAND_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_OG_DESCRIPTION, SITE_URL };

export const SITE_KEYWORDS = [
  "serviced apartments",
  "luxury serviced apartments",
  "shortlet apartments",
  "premium apartments",
  "executive apartments",
  "business accommodation",
  "vacation rentals",
  "luxury stays",
  "Nigeria",
  "Abuja",
  "Wuye",
] as const;

export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const SITE_LOGO_PATH = "/lofty-logo-black.png";
export const SITE_FAVICON_PATH = "/favicon.png";

export const SITE_CONTACT = {
  phone: "+2348161122328",
  email: "hello@loftyxpherehomes.com",
  address: {
    streetAddress: "430 Magnus Abe Street",
    addressLocality: "Wuye",
    addressRegion: "Abuja",
    addressCountry: "NG",
  },
} as const;

/** Verified public social profiles (omit placeholder links). */
export const SITE_SOCIAL_PROFILES = [
  "https://www.instagram.com/loftyxpherehomes",
] as const;

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
