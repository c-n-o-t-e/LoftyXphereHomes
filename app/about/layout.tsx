import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";
import { LOCATION_SEO } from "@/lib/content/seoCopy";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME} — luxury serviced apartments and premium shortlet rentals in ${LOCATION_SEO}. Meet our team, explore our suites, and discover our hospitality standards.`,
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
