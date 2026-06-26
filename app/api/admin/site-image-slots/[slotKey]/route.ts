import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    SITE_IMAGE_SLOT_KEYS,
    type SiteImageSlotKey,
    updateSiteImageSlot,
} from "@/lib/admin/siteImageSlots";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ slotKey: string }>;
};

function isSiteImageSlotKey(value: string): value is SiteImageSlotKey {
    return (SITE_IMAGE_SLOT_KEYS as readonly string[]).includes(value);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const { slotKey } = await context.params;
    if (!isSiteImageSlotKey(slotKey)) {
        return NextResponse.json({ error: "Site image slot not found" }, { status: 404 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const amenitySlug =
        typeof (body as { amenitySlug?: unknown }).amenitySlug === "string"
            ? (body as { amenitySlug: string }).amenitySlug
            : "";
    const photoNumberRaw = (body as { photoNumber?: unknown }).photoNumber;

    if (typeof photoNumberRaw !== "number" || !Number.isInteger(photoNumberRaw)) {
        return NextResponse.json(
            { error: "Photo number must be a whole number" },
            { status: 400 },
        );
    }

    if (photoNumberRaw < 1) {
        return NextResponse.json(
            { error: "Photo number must be at least 1" },
            { status: 400 },
        );
    }

    try {
        const slot = await updateSiteImageSlot({
            key: slotKey,
            amenitySlug,
            imageIndex: photoNumberRaw - 1,
        });
        return NextResponse.json({ ok: true, slot });
    } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
        const message =
            err instanceof Error ? err.message : "Failed to update site image slot";
        if (statusCode >= 500) {
            console.error("Failed to update site image slot:", err);
        }
        return NextResponse.json({ error: message }, { status: statusCode });
    }
}
