import { NextResponse } from "next/server";
import { getApartmentVideoSummariesMap } from "@/lib/data/getApartmentVideos";

export async function GET() {
    try {
        const videos = await getApartmentVideoSummariesMap();
        return NextResponse.json(
            { ok: true, videos },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            },
        );
    } catch (err) {
        console.error("Failed to load apartment videos:", err);
        return NextResponse.json(
            { error: "Failed to load apartment videos" },
            { status: 500 },
        );
    }
}
