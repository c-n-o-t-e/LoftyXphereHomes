import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { ApartmentsPageClient } from "./ApartmentsPageClient";

export default async function ApartmentsPage() {
    const initialImageSets = await getAllApartmentImageSetsMap();

    return <ApartmentsPageClient initialImageSets={initialImageSets} />;
}
