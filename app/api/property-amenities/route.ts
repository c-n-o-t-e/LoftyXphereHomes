import { NextResponse } from "next/server";
import { getPublishedPropertyAmenities } from "@/lib/data/propertyAmenities";

export async function GET() {
    try {
        const amenities = await getPublishedPropertyAmenities();
        return NextResponse.json(
            { amenities },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            },
        );
    } catch (err) {
        console.error("Failed to load property amenities:", err);
        return NextResponse.json(
            { error: "Failed to load property amenities" },
            { status: 500 },
        );
    }
}
