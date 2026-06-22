import { NextResponse } from "next/server";
import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";

export async function GET() {
    try {
        const images = await getAllApartmentImageSetsMap();
        return NextResponse.json(
            { ok: true, images },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            },
        );
    } catch (err) {
        console.error("Failed to load apartment images:", err);
        return NextResponse.json(
            { error: "Failed to load apartment images" },
            { status: 500 },
        );
    }
}
