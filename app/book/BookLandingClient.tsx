"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Info, Loader2, Shield, Sparkles, Satellite } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import ApartmentCard from "@/components/ApartmentCard";
import HeroSearchBar from "@/components/HeroSearchBar";
import { LandingDateSearchHint } from "@/components/landing/LandingDateSearchHint";
import { Button } from "@/components/ui/button";
import { LandingPageTracker } from "@/components/analytics/LandingPageTracker";
import { useAvailableApartments } from "@/hooks/useAvailableApartments";
import { getActiveApartments } from "@/lib/data/apartments";
import { getWhatsAppChatUrl } from "@/lib/constants";
import { trackWhatsAppClick } from "@/lib/analytics/conversions";
import {
  appendUtmParams,
  buildBookingSearchParams,
  extractUtmParams,
  parseLandingDatesFromParams,
} from "@/lib/utils/landingDates";
import { areDatesValid, calculateNights, filterApartments } from "@/lib/utils/search";
import type { ApartmentImageSet } from "@/lib/images/types";
import type { ApartmentVideoSummary } from "@/lib/videos/types";

type BookLandingClientProps = {
  initialImageSets: Record<string, ApartmentImageSet[]>;
  initialVideoSummaries: Record<string, ApartmentVideoSummary>;
};

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const compactTrustItems = [
  { icon: Shield, label: "24/7 security & power" },
  { icon: Sparkles, label: "Premium clean" },
  { icon: Satellite, label: "Starlink Wi-Fi" },
];

function BookLandingContent({
  initialImageSets,
  initialVideoSummaries,
}: BookLandingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const syncedDefaultsRef = useRef(false);

  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const urlGuests = searchParams.get("guests");
  const guests = urlGuests ? Math.max(1, parseInt(urlGuests, 10) || 1) : 1;

  const { checkIn, checkOut, usedDefaults } = parseLandingDatesFromParams(
    urlCheckIn,
    urlCheckOut,
  );

  const utm = useMemo(() => extractUtmParams(searchParams), [searchParams]);

  useEffect(() => {
    const needsSync =
      !urlCheckIn ||
      !urlCheckOut ||
      !areDatesValid(urlCheckIn, urlCheckOut);

    if (!needsSync || syncedDefaultsRef.current) return;
    syncedDefaultsRef.current = true;

    const params = new URLSearchParams();
    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    appendUtmParams(params, searchParams);
    router.replace(`/book?${params.toString()}`);
  }, [urlCheckIn, urlCheckOut, checkIn, checkOut, guests, router, searchParams]);

  const datesReady =
    !!urlCheckIn &&
    !!urlCheckOut &&
    areDatesValid(urlCheckIn, urlCheckOut);

  const activeCheckIn = datesReady ? urlCheckIn! : checkIn;
  const activeCheckOut = datesReady ? urlCheckOut! : checkOut;

  const { data: imageSetsByApartment } = useQuery({
    queryKey: ["apartment-images"],
    queryFn: async (): Promise<Record<string, ApartmentImageSet[]>> => {
      const res = await fetch("/api/apartments/images");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return initialImageSets;
      return data.images ?? initialImageSets;
    },
    initialData: initialImageSets,
    staleTime: 300_000,
  });

  const { data: videoSummariesByApartment } = useQuery({
    queryKey: ["apartment-videos"],
    queryFn: async (): Promise<Record<string, ApartmentVideoSummary>> => {
      const res = await fetch("/api/apartments/videos");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return initialVideoSummaries;
      return data.videos ?? initialVideoSummaries;
    },
    initialData: initialVideoSummaries,
    staleTime: 300_000,
  });

  const {
    availableIds,
    isLoading: isLoadingAvailability,
    isError,
    error: availabilityError,
    refetch,
  } = useAvailableApartments({
    checkIn: activeCheckIn,
    checkOut: activeCheckOut,
    guests,
    enabled: datesReady,
  });

  const activeApartments = useMemo(() => getActiveApartments(), []);

  const filteredApartments = useMemo(() => {
    let filtered = filterApartments(activeApartments, { guests });

    if (availableIds !== null) {
      const availableSet = new Set(availableIds);
      filtered = filtered.filter((apt) => availableSet.has(apt.id));
    }

    return filtered;
  }, [activeApartments, guests, availableIds]);

  const nights = calculateNights(activeCheckIn, activeCheckOut);
  const detailSearchParams = buildBookingSearchParams({
    checkIn: activeCheckIn,
    checkOut: activeCheckOut,
    guests,
  });

  const whatsappRaw =
    process.env.WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const whatsappHref = whatsappRaw
    ? getWhatsAppChatUrl(
        whatsappRaw,
        `Hello, I'm looking for a suite from ${formatDisplayDate(activeCheckIn)} to ${formatDisplayDate(activeCheckOut)} for ${guests} guest${guests !== 1 ? "s" : ""}. Can you help?`,
      )
    : null;

  const trackingReady = datesReady && !isLoadingAvailability && availableIds !== null;

  return (
    <>
      <LandingPageTracker
        checkIn={activeCheckIn}
        checkOut={activeCheckOut}
        availableCount={filteredApartments.length}
        usedDefaultDates={usedDefaults}
        utmSource={utm.utm_source}
        utmMedium={utm.utm_medium}
        utmCampaign={utm.utm_campaign}
        utmTerm={utm.utm_term}
        utmContent={utm.utm_content}
        ready={trackingReady}
      />

      <div className="pt-20 pb-12 sm:pb-16 bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="text-center mb-8 sm:mb-10 pt-6 sm:pt-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-4 px-2">
              Book a premium shortlet in Wuye, Abuja
            </h1>
            <p className="text-base sm:text-lg text-black/70 max-w-2xl mx-auto mb-2 px-4">
              Instant online booking · Secure Paystack payment · Pool, gym & breakfast included
            </p>
            {datesReady && !isLoadingAvailability ? (
              <p className="text-sm text-black/60 px-4">
                Showing suites free for{" "}
                <span className="font-medium text-black">
                  {formatDisplayDate(activeCheckIn)} – {formatDisplayDate(activeCheckOut)}
                </span>
                {nights > 0 ? ` (${nights} ${nights === 1 ? "night" : "nights"})` : null}
              </p>
            ) : (
              <p className="text-sm text-black/60 px-4">Checking availability…</p>
            )}
          </section>

          {/* Search */}
          <section className="mb-10 sm:mb-12" aria-label="Change your dates">
            <LandingDateSearchHint />
            <HeroSearchBar
              variant="landing"
              basePath="/book"
              navigationMode="replace"
              preserveUtm
              initialCheckIn={activeCheckIn}
              initialCheckOut={activeCheckOut}
              initialGuests={guests}
            />
          </section>

          {/* Results */}
          <section aria-label="Available suites">
            {isError ? (
              <div
                className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-black/10 px-4"
                role="alert"
                aria-live="polite"
              >
                <Info className="h-10 w-10 sm:h-12 sm:w-12 text-black/40 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
                  Availability temporarily unavailable
                </h2>
                <p className="text-sm sm:text-base text-black/70 mb-6 max-w-md mx-auto">
                  {availabilityError instanceof Error
                    ? availabilityError.message
                    : "We couldn’t confirm availability right now. Please retry."}
                </p>
                <Button type="button" className="min-h-[44px]" onClick={() => void refetch()}>
                  Retry
                </Button>
              </div>
            ) : isLoadingAvailability || !datesReady ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-black/10 px-4">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#FA5C5C] mx-auto mb-4 animate-spin" />
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
                  Finding available suites…
                </h2>
                <p className="text-sm sm:text-base text-black/70 max-w-md mx-auto">
                  Only showing apartments you can book for your dates.
                </p>
              </div>
            ) : filteredApartments.length > 0 ? (
              <>
                <p className="text-center text-sm text-black/70 mb-6 sm:mb-8">
                  {filteredApartments.length} suite
                  {filteredApartments.length !== 1 ? "s" : ""} available — select one to book
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                  {filteredApartments.map((apartment, index) => (
                    <ApartmentCard
                      key={apartment.id}
                      apartment={apartment}
                      index={index}
                      imageSets={imageSetsByApartment[apartment.id]}
                      hasVideoTour={Boolean(videoSummariesByApartment[apartment.id])}
                      detailSearchParams={detailSearchParams}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-black/10 px-4">
                <Info className="h-10 w-10 sm:h-12 sm:w-12 text-black/40 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
                  No suites available for these dates
                </h2>
                <p className="text-sm sm:text-base text-black/70 mb-6 max-w-md mx-auto">
                  All suites are booked for{" "}
                  {formatDisplayDate(activeCheckIn)} – {formatDisplayDate(activeCheckOut)}.
                  Try different dates above or message us — we may have flexibility.
                </p>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] transition-colors text-sm sm:text-base min-h-[44px] font-semibold"
                    onClick={() => {
                      trackWhatsAppClick({
                        label: "Ads Landing Empty State",
                        category: "engagement",
                      });
                    }}
                  >
                    <FaWhatsapp className="h-5 w-5" aria-hidden />
                    Message us on WhatsApp
                  </a>
                ) : null}
              </div>
            )}
          </section>

          {/* Compact trust strip */}
          <section
            className="mt-12 sm:mt-16 py-8 border-t border-black/10"
            aria-label="Why book with us"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {compactTrustItems.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-black/70">
                  <Icon className="h-5 w-5 text-[#FA5C5C] shrink-0" aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export function BookLandingClient(props: BookLandingClientProps) {
  return (
    <Suspense
      fallback={
        <div className="pt-20 pb-20 bg-white min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-[#FA5C5C] animate-spin" aria-label="Loading" />
        </div>
      }
    >
      <BookLandingContent {...props} />
    </Suspense>
  );
}
