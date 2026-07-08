import type { Metadata } from "next";
import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { getApartmentVideoSummariesMap } from "@/lib/data/getApartmentVideos";
import { ApartmentsPageClient } from "./ApartmentsPageClient";
import { SITE_NAME } from "@/lib/constants";
import { LOCATION_SEO } from "@/lib/content/seoCopy";

export const metadata: Metadata = {
  title: "Apartments",
  description: `Browse luxury serviced apartments and premium shortlet suites at ${SITE_NAME} in ${LOCATION_SEO}. Meridian, Lumen, Horizon, Skyline, and more.`,
};

export default async function ApartmentsPage() {
    const [initialImageSets, initialVideoSummaries] = await Promise.all([
        getAllApartmentImageSetsMap(),
        getApartmentVideoSummariesMap(),
    ]);

    return (
        <ApartmentsPageClient
            initialImageSets={initialImageSets}
            initialVideoSummaries={initialVideoSummaries}
        />
    );
}
