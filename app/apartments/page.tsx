"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { apartments } from "@/lib/data/apartments";
import ApartmentCard from "@/components/ApartmentCard";
import { filterApartments, SearchFilters, calculateNights } from "@/lib/utils/search";
import { Info } from "lucide-react";

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

  // Filter apartments based on search criteria
  const filteredApartments = useMemo(() => {
    return filterApartments(apartments, filters);
  }, [filters]);

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
            {isSearchActive
              ? `Found ${filteredApartments.length} apartment${filteredApartments.length !== 1 ? "s" : ""} matching your search`
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
        {filteredApartments.length > 0 ? (
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
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">No apartments found</h2>
            <p className="text-sm sm:text-base text-black/70 mb-6 max-w-md mx-auto">
              {isSearchActive
                ? "Try adjusting your search filters to find more options."
                : "Please check back later or contact us for assistance."}
            </p>
            {isSearchActive && (
              <a
                href="/apartments"
                className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-[#FA5C5C] text-white rounded-full hover:bg-[#E84A4A] transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center mx-auto"
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

