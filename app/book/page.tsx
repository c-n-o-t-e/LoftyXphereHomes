import type { Metadata } from "next";
import { getAvailableApartmentIds } from "@/lib/availability/availableApartments";
import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { getApartmentVideoSummariesMap } from "@/lib/data/getApartmentVideos";
import { getPublishedPropertyAmenitiesWithImages } from "@/lib/data/propertyAmenities";
import { parseLandingDatesFromParams } from "@/lib/utils/landingDates";
import { BookLandingClient } from "./BookLandingClient";

export const metadata: Metadata = {
  title: "Book Your Stay",
  description:
    "Book a premium shortlet suite at LoftyXphereHomes in Wuye, Abuja. See real-time availability and secure your stay online.",
  robots: {
    index: false,
    follow: false,
  },
};

type BookPageSearchParams = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
};

export default async function BookLandingPage({
  searchParams,
}: {
  searchParams: Promise<BookPageSearchParams>;
}) {
  const params = await searchParams;
  const urlCheckIn = params.checkIn ?? null;
  const urlCheckOut = params.checkOut ?? null;
  const guests = params.guests
    ? Math.max(1, parseInt(params.guests, 10) || 1)
    : 1;

  const { checkIn, checkOut } = parseLandingDatesFromParams(
    urlCheckIn,
    urlCheckOut,
  );

  const [
    initialImageSets,
    initialVideoSummaries,
    propertyAmenities,
    initialAvailableIds,
  ] = await Promise.all([
    getAllApartmentImageSetsMap(),
    getApartmentVideoSummariesMap(),
    getPublishedPropertyAmenitiesWithImages(),
    getAvailableApartmentIds(checkIn, checkOut, guests).catch((error) => {
      console.error("Book landing: failed to prefetch availability:", error);
      return null;
    }),
  ]);

  return (
    <BookLandingClient
      initialImageSets={initialImageSets}
      initialVideoSummaries={initialVideoSummaries}
      propertyAmenities={propertyAmenities}
      initialAvailability={{
        checkIn,
        checkOut,
        guests,
        availableIds: initialAvailableIds,
      }}
    />
  );
}
