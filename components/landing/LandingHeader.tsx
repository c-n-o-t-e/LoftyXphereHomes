"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getWhatsAppChatUrl } from "@/lib/constants";
import { trackWhatsAppClick, trackPhoneCallClick } from "@/lib/analytics/conversions";

const LANDING_WHATSAPP_MESSAGE =
  "Hello, I saw your ad and would like help booking a suite.";

export function LandingHeader() {
  const raw =
    process.env.WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = raw
    ? getWhatsAppChatUrl(raw, LANDING_WHATSAPP_MESSAGE)
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10 overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 overflow-visible">
          <Link
            href="/"
            className="flex items-center shrink-0 group -my-2 sm:-my-3 md:-my-4 lg:-my-5"
            aria-label="LoftyXphereHomes — visit main site"
          >
            <Image
              src="/lofty-logo-black.png"
              alt="LoftyXphereHomes Logo"
              width={600}
              height={200}
              className="h-20 sm:h-24 md:h-32 lg:h-36 xl:h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
              quality={100}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, 320px"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm text-black/60 mr-1">
              Need help?
            </span>
            <a
              href="tel:+2348161122328"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-black/10 text-black hover:bg-black/5 transition-colors"
              aria-label="Call us"
              onClick={() => {
                trackPhoneCallClick({
                  label: "Ads Landing Header",
                  category: "engagement",
                });
              }}
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors min-h-[40px]"
                onClick={() => {
                  trackWhatsAppClick({
                    label: "Ads Landing Header",
                    category: "engagement",
                  });
                }}
              >
                <FaWhatsapp className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden xs:inline sm:inline">WhatsApp</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
