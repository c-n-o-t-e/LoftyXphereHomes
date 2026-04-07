"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apartments } from "@/lib/data/apartments";
import ApartmentCard from "@/components/ApartmentCard";
import { filterApartments, SearchFilters, calculateNights } from "@/lib/utils/search";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ApartmentsContent() {
  const searchParams = useSearchParams();

  // Extract search filters from URL params
  const filters: SearchFilters = useMemo(() => {
    return {
      location: searchParams.get("location") || undefined,
      checkIn: searchParams.get("checkIn") || undefined,
      checkOut: searchParams.get("checkOut") || undefined,
      guests: searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : undefined,
    };
  }, [searchParams]);

  const guestsCount = filters.guests || 1;
  const availabilityEnabled = !!(filters.checkIn && filters.checkOut);

  const {
    data: availabilityIds,
    isPending,
    isError,
    error: availabilityError,
    refetch,
  } = useQuery({
    queryKey: [
      "apartments-available",
      filters.checkIn,
      filters.checkOut,
      guestsCount,
    ],
    queryFn: async (): Promise<string[] | null> => {
      const params = new URLSearchParams();
      params.set("checkIn", filters.checkIn!);
      params.set("checkOut", filters.checkOut!);
      params.set("guests", guestsCount.toString());
      const res = await fetch(`/api/apartments/available?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Availability is temporarily unavailable.";
        throw new Error(message);
      }
      return data.availableApartmentIds ?? [];
    },
    enabled: availabilityEnabled,
    staleTime: 60_000,
  });

  const isLoadingAvailability = availabilityEnabled && isPending;
  const availableForFilter =
    !availabilityEnabled
      ? null
      : isLoadingAvailability
        ? null
        : isError || availabilityIds === null
          ? []
          : availabilityIds ?? [];

  // Filter apartments based on search criteria AND availability
  const filteredApartments = useMemo(() => {
    let filtered = filterApartments(apartments, filters);

    if (availableForFilter !== null) {
      const availableSet = new Set(availableForFilter);
      filtered = filtered.filter((apt) => availableSet.has(apt.id));
    }

    return filtered;
  }, [filters, availableForFilter]);

  // Check if search is active
  const isSearchActive = !!(filters.location || filters.checkIn || filters.checkOut || filters.guests);

  // Calculate nights if dates are provided
  const nights = filters.checkIn && filters.checkOut 
    ? calculateNights(filters.checkIn, filters.checkOut)
    : 0;

  return (
    <div className="pt-20 pb-12 sm:pb-16 md:pb-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 pt-8 sm:pt-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 px-2">
            {isSearchActive ? "Search Results" : "Our Apartments"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
            {isLoadingAvailability
              ? "Checking availability..."
              : isSearchActive
              ? filters.checkIn && filters.checkOut
                ? `Found ${filteredApartments.length} available apartment${filteredApartments.length !== 1 ? "s" : ""} for your dates`
                : `Found ${filteredApartments.length} apartment${filteredApartments.length !== 1 ? "s" : ""} matching your search`
              : "Discover our complete collection of premium shortlet apartments in Wuye, Abuja"}
          </p>
        </div>

        {/* Search Filters Summary */}
        {isSearchActive && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-black/10">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-black/80">
              {filters.location && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2 text-black">Location:</span>
                  <span>{filters.location}</span>
                </div>
              )}
              {filters.checkIn && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2 text-black">Check-in:</span>
                  <span>{new Date(filters.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {filters.checkOut && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2 text-black">Check-out:</span>
                  <span>{new Date(filters.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  {nights > 0 && (
                    <span className="ml-2 text-black/60">({nights} {nights === 1 ? "night" : "nights"})</span>
                  )}
                </div>
              )}
              {filters.guests && (
                <div className="flex items-center">
                  <span className="font-semibold mr-2 text-black">Guests:</span>
                  <span>{filters.guests}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {availabilityEnabled && isError ? (
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
                : "We couldn’t confirm availability right now. Please retry before booking."}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                type="button"
                className="min-h-[44px]"
                onClick={() => {
                  void refetch();
                }}
              >
                Retry
              </Button>
              <Link
                href={`/contact?category=booking&message=${encodeURIComponent(
                  `Availability check failed for dates: ${filters.checkIn ?? ""} → ${
                    filters.checkOut ?? ""
                  }, guests: ${guestsCount}. Please assist.`
                )}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-[#FA5C5C] text-white rounded-full hover:bg-[#E84A4A] transition-colors text-sm sm:text-base min-h-[44px]"
              >
                Contact us
              </Link>
              <a
                href="/apartments"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black rounded-full border border-black/15 hover:bg-black/5 transition-colors text-sm sm:text-base min-h-[44px]"
              >
                Clear dates
              </a>
            </div>
          </div>
        ) : isLoadingAvailability ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-black/10 px-4">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#FA5C5C] mx-auto mb-4 animate-spin" />
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Checking availability...</h2>
            <p className="text-sm sm:text-base text-black/70 max-w-md mx-auto">
              Finding apartments available for your selected dates.
            </p>
          </div>
        ) : filteredApartments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredApartments.map((apartment, index) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-black/10 px-4">
            <Info className="h-10 w-10 sm:h-12 sm:w-12 text-black/40 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">No apartments available</h2>
            <p className="text-sm sm:text-base text-black/70 mb-6 max-w-md mx-auto">
              {isSearchActive && filters.checkIn && filters.checkOut
                ? "All apartments are booked for your selected dates. Try different dates or check back later."
                : isSearchActive
                ? "Try adjusting your search filters to find more options."
                : "Please check back later or contact us for assistance."}
            </p>
            {isSearchActive && (
              <a
                href="/apartments"
                className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-[#FA5C5C] text-white rounded-full hover:bg-[#E84A4A] transition-colors text-sm sm:text-base min-h-[44px]"
              >
                View All Apartments
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApartmentsPage() {
  return (
    <Suspense fallback={
      <div className="pt-20 pb-20 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 pt-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Apartments
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading apartments...
            </p>
          </div>
        </div>
      </div>
    }>
      <ApartmentsContent />
    </Suspense>
  );
}

