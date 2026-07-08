import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import { SITE_SOCIAL_LINKS } from "@/lib/content/seoCopy";

export { SITE_NAME as SITE_BRAND_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_OG_DESCRIPTION, SITE_URL };

export const SITE_KEYWORDS = [
  "serviced apartments Abuja",
  "luxury serviced apartments",
  "shortlet apartments Abuja",
  "premium apartments Wuye",
  "executive apartments Abuja",
  "business accommodation Abuja",
  "furnished apartments Abuja",
  "vacation rentals Nigeria",
  "luxury stays Abuja",
  "short stay apartments Nigeria",
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
  SITE_SOCIAL_LINKS.instagram,
  SITE_SOCIAL_LINKS.facebook,
  SITE_SOCIAL_LINKS.x,
] as const;

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
