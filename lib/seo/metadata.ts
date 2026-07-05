import type { Metadata } from "next";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_FAVICON_PATH,
  SITE_KEYWORDS,
  SITE_OG_DESCRIPTION,
  SITE_TITLE,
} from "@/lib/seo/constants";
import type { SocialShareImage } from "@/lib/seo/getDefaultSocialShareImage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

type BuildRootMetadataOptions = {
  socialShareImage?: SocialShareImage;
};

export function buildRootMetadata(options: BuildRootMetadataOptions = {}): Metadata {
  const ogImageUrl =
    options.socialShareImage?.url ??
    `${SITE_URL.replace(/\/$/, "")}/og-image.png`;
  const ogImageAlt =
    options.socialShareImage?.alt ?? `${SITE_NAME} — Luxury Serviced Apartments`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    keywords: [...SITE_KEYWORDS],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    icons: {
      icon: [{ url: SITE_FAVICON_PATH, type: "image/png" }],
      shortcut: SITE_FAVICON_PATH,
      apple: SITE_FAVICON_PATH,
    },
    openGraph: {
      type: "website",
      locale: "en_NG",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_OG_DESCRIPTION,
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_OG_DESCRIPTION,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "facebook-domain-verification": "yy2ha6g9oowjl43f3cmtgdnz6lsin7",
    },
  };
}
