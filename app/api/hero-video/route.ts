import { NextResponse } from "next/server";
import { getPublicHeroVideo } from "@/lib/admin/heroVideo";

export async function GET() {
    try {
        const heroVideo = await getPublicHeroVideo();
        return NextResponse.json(
            { heroVideo },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            },
        );
    } catch (err) {
        console.error("Failed to load hero video:", err);
        return NextResponse.json(
            { error: "Failed to load hero video" },
            { status: 500 },
        );
    }
}
