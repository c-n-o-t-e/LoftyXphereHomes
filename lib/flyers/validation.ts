import { z } from "zod";
import type { FlyerPayload } from "@/lib/flyers/types";
import {
    DEFAULT_FLYER_DISCOVERY_LINE,
    FLYER_AMENITY_OPTIONS,
    FLYER_BACK_GRID_IMAGE_COUNT,
    FLYER_GRID_IMAGE_SLOT_KEYS,
    FLYER_IMAGE_SLOT_DEFINITIONS,
    FLYER_PAGE_SIZE_OPTIONS,
    FLYER_TEMPLATE_OPTIONS,
    createEmptyFlyerImages,
    getDefaultGridImageOrder,
} from "@/lib/flyers/constants";
import { getDefaultFlyerAmenityKeys, normalizeFlyerAmenityKeys } from "@/lib/amenities/suiteAmenities";
import { getApartmentById } from "@/lib/data/apartments";
import { formatFlyerBedroomLabel } from "@/lib/flyers/bedroomLabel";

const templateKeys = FLYER_TEMPLATE_OPTIONS.map((item) => item.key) as [
    string,
    ...string[],
];
const pageSizeKeys = FLYER_PAGE_SIZE_OPTIONS.map((item) => item.key) as [
    string,
    ...string[],
];
const imageSlotKeys = FLYER_IMAGE_SLOT_DEFINITIONS.map((item) => item.key) as [
    string,
    ...string[],
];
const gridImageSlotKeys = FLYER_GRID_IMAGE_SLOT_KEYS as [string, ...string[]];
const amenityKeys = FLYER_AMENITY_OPTIONS.map((item) => item.key);

const flyerImageSlotSchema = z
    .object({
        url: z.string().nullable(),
        alt: z.string().optional(),
        label: z.string().optional(),
    })
    .strict();

export const flyerPayloadSchema = z
    .object({
        apartmentId: z.string().nullable(),
        apartmentName: z.string(),
        bedroomLabel: z.string().max(80),
        headline: z.string().trim().min(1).max(200),
        subheadline: z.string().max(500),
        ctaText: z.string().trim().min(1).max(60),
        discoveryLine: z.string().max(200),
        bodyCopy: z.string().max(1200),
        location: z.string().trim().min(1).max(120),
        contact: z
            .object({
                website: z.string().max(200),
                phone: z.string().max(40),
                whatsapp: z.string().max(40),
                instagram: z.string().max(80),
            })
            .strict(),
        qr: z
            .object({
                destinationType: z.enum(["website", "booking", "whatsapp", "apartment"]),
                customUrl: z.string().max(500).optional(),
            })
            .strict(),
        amenities: z.array(z.enum(amenityKeys as [string, ...string[]])).max(24),
        perfectFor: z.array(z.string().max(80)).max(12),
        theme: z
            .object({
                primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
                accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
                backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
                textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
            })
            .strict(),
        logo: z
            .object({
                url: z.string().nullable(),
                position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
                sizePercent: z.number().min(8).max(40),
            })
            .strict(),
        images: z.record(z.enum(imageSlotKeys), flyerImageSlotSchema),
        gridImageOrder: z
            .array(z.enum(gridImageSlotKeys))
            .min(1)
            .max(FLYER_BACK_GRID_IMAGE_COUNT),
    })
    .strict();

export const createFlyerBodySchema = z
    .object({
        title: z.string().trim().min(1).max(120),
        templateKey: z.enum(templateKeys),
        pageSize: z.enum(pageSizeKeys).optional(),
        apartmentId: z.string().trim().optional(),
    })
    .strict();

export const updateFlyerBodySchema = z
    .object({
        title: z.string().trim().min(1).max(120).optional(),
        templateKey: z.enum(templateKeys).optional(),
        pageSize: z.enum(pageSizeKeys).optional(),
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
        payload: flyerPayloadSchema.optional(),
    })
    .strict();

export const exportFlyerQuerySchema = z
    .object({
        format: z.enum(["pdf", "png", "jpeg"]).default("pdf"),
        side: z.enum(["front", "back", "both"]).default("both"),
    })
    .strict();

export function parseFlyerPayload(raw: unknown): FlyerPayload {
    return flyerPayloadSchema.parse(normalizeFlyerPayload(raw)) as FlyerPayload;
}

function normalizeFlyerPayload(raw: unknown): unknown {
    if (!raw || typeof raw !== "object") {
        return raw;
    }

    const payload = { ...(raw as Record<string, unknown>) };
    const allowedGridKeys = new Set(FLYER_GRID_IMAGE_SLOT_KEYS);
    const emptyImages = createEmptyFlyerImages();

    if (payload.images && typeof payload.images === "object") {
        const existing = payload.images as Record<string, unknown>;
        payload.images = Object.fromEntries(
            FLYER_IMAGE_SLOT_DEFINITIONS.map((slot) => {
                const current = existing[slot.key];
                if (current && typeof current === "object") {
                    const entry = current as Record<string, unknown>;
                    return [
                        slot.key,
                        {
                            url: entry.url ?? null,
                            alt:
                                typeof entry.alt === "string" ? entry.alt : slot.label,
                            label:
                                typeof entry.label === "string"
                                    ? entry.label
                                    : slot.label,
                        },
                    ];
                }
                return [slot.key, emptyImages[slot.key]];
            }),
        );
    } else {
        payload.images = emptyImages;
    }

    if (Array.isArray(payload.amenities)) {
        payload.amenities = normalizeFlyerAmenityKeys(payload.amenities);
    } else {
        payload.amenities = getDefaultFlyerAmenityKeys();
    }

    if (typeof payload.discoveryLine !== "string") {
        payload.discoveryLine = DEFAULT_FLYER_DISCOVERY_LINE;
    }

    if (typeof payload.bedroomLabel !== "string") {
        payload.bedroomLabel = "";
    }

    const apartmentId =
        typeof payload.apartmentId === "string" ? payload.apartmentId.trim() : "";
    if (!String(payload.bedroomLabel).trim() && apartmentId) {
        const apartment = getApartmentById(apartmentId);
        if (apartment) {
            payload.bedroomLabel = formatFlyerBedroomLabel(apartment.beds);
        }
    }

    if (Array.isArray(payload.gridImageOrder)) {
        const filtered = payload.gridImageOrder
            .filter((key) => typeof key === "string" && allowedGridKeys.has(key as never))
            .slice(0, FLYER_BACK_GRID_IMAGE_COUNT);
        if (filtered.length > 0) {
            const padded = [...filtered];
            for (const key of getDefaultGridImageOrder()) {
                if (padded.length >= FLYER_BACK_GRID_IMAGE_COUNT) break;
                if (!padded.includes(key)) padded.push(key);
            }
            payload.gridImageOrder = padded.slice(0, FLYER_BACK_GRID_IMAGE_COUNT);
        } else {
            payload.gridImageOrder = getDefaultGridImageOrder();
        }
    }

    return payload;
}
