import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PublicSiteChrome } from "@/components/PublicSiteChrome";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import {
  CookieConsentProvider,
} from "@/components/analytics/CookieConsentContext";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import {
  ANALYTICS_CONSENT_COOKIE,
  CONSENT_REQUIRED_COOKIE,
  parseAnalyticsConsent,
} from "@/lib/analytics/consent";
import {
  INTERNAL_TRAFFIC_COOKIE,
  isInternalTrafficOptedOut,
} from "@/lib/analytics/internal";
import { StructuredData } from "@/components/seo/StructuredData";
import { getDefaultSocialShareImage } from "@/lib/seo/getDefaultSocialShareImage";
import { buildRootMetadata } from "@/lib/seo/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata() {
  const socialShareImage = await getDefaultSocialShareImage();
  return buildRootMetadata({ socialShareImage });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const consentRequired =
    cookieStore.get(CONSENT_REQUIRED_COOKIE)?.value === "1";
  const initialConsent = parseAnalyticsConsent(
    cookieStore.get(ANALYTICS_CONSENT_COOKIE)?.value,
  );
  const internalTrafficOptedOut = isInternalTrafficOptedOut(
    cookieStore.get(INTERNAL_TRAFFIC_COOKIE)?.value,
  );

  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}
      >
        <StructuredData />
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black focus:shadow-lg"
        >
          Skip to main content
        </Link>
        <CookieConsentProvider
          consentRequired={consentRequired}
          initialConsent={initialConsent}
        >
          <QueryProvider>
            <AuthProvider>
              <PublicSiteChrome>{children}</PublicSiteChrome>
              <Toaster richColors position="top-center" />
            </AuthProvider>
          </QueryProvider>
          <CookieConsentBanner />
          <GoogleAnalytics internalTrafficOptedOut={internalTrafficOptedOut} />
          <MetaPixel internalTrafficOptedOut={internalTrafficOptedOut} />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
