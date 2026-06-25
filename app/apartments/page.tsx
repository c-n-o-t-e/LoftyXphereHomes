import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { getApartmentVideoSummariesMap } from "@/lib/data/getApartmentVideos";
import { ApartmentsPageClient } from "./ApartmentsPageClient";

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
