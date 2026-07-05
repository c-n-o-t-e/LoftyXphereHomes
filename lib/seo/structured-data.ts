import {
  SITE_BRAND_NAME,
  SITE_CONTACT,
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_OG_DESCRIPTION,
  SITE_SOCIAL_PROFILES,
  SITE_TITLE,
  absoluteUrl,
} from "@/lib/seo/constants";
import { SITE_URL } from "@/lib/constants";

export type StructuredDataGraph = {
  "@context": "https://schema.org";
  "@graph": Record<string, unknown>[];
};

export function buildStructuredDataGraph(options: { heroImageUrl?: string } = {}): StructuredDataGraph {
  const logoUrl = absoluteUrl(SITE_LOGO_PATH);
  const websiteUrl = SITE_URL.replace(/\/$/, "");
  const heroImageUrl = options.heroImageUrl ?? absoluteUrl("/og-image.png");

  const organization = {
    "@type": "Organization",
    "@id": `${websiteUrl}/#organization`,
    name: SITE_BRAND_NAME,
    url: websiteUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
    email: SITE_CONTACT.email,
    telephone: SITE_CONTACT.phone,
    sameAs: [...SITE_SOCIAL_PROFILES],
  };

  const lodgingBusiness = {
    "@type": "LodgingBusiness",
    "@id": `${websiteUrl}/#lodging`,
    name: SITE_BRAND_NAME,
    description: SITE_DESCRIPTION,
    url: websiteUrl,
    image: heroImageUrl,
    logo: logoUrl,
    telephone: SITE_CONTACT.phone,
    email: SITE_CONTACT.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONTACT.address.streetAddress,
      addressLocality: SITE_CONTACT.address.addressLocality,
      addressRegion: SITE_CONTACT.address.addressRegion,
      addressCountry: SITE_CONTACT.address.addressCountry,
    },
    priceRange: "$$$",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
      { "@type": "LocationFeatureSpecification", name: "Kitchen", value: true },
    ],
    parentOrganization: { "@id": `${websiteUrl}/#organization` },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${websiteUrl}/#website`,
    name: SITE_BRAND_NAME,
    url: websiteUrl,
    description: SITE_OG_DESCRIPTION,
    publisher: { "@id": `${websiteUrl}/#organization` },
    inLanguage: "en-NG",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${websiteUrl}/apartments?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${websiteUrl}/#webpage`,
    url: websiteUrl,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    isPartOf: { "@id": `${websiteUrl}/#website` },
    about: { "@id": `${websiteUrl}/#lodging` },
    inLanguage: "en-NG",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, lodgingBusiness, website, webPage],
  };
}
