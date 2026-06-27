import type { Metadata } from "next";
import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { getApartmentVideoSummariesMap } from "@/lib/data/getApartmentVideos";
import { getPublishedPropertyAmenitiesWithImages } from "@/lib/data/propertyAmenities";
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

export default async function BookLandingPage() {
  const [initialImageSets, initialVideoSummaries, propertyAmenities] =
    await Promise.all([
      getAllApartmentImageSetsMap(),
      getApartmentVideoSummariesMap(),
      getPublishedPropertyAmenitiesWithImages(),
    ]);

  return (
    <BookLandingClient
      initialImageSets={initialImageSets}
      initialVideoSummaries={initialVideoSummaries}
      propertyAmenities={propertyAmenities}
    />
  );
}
