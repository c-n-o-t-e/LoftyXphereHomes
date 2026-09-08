import { z } from "zod";
import {
    migrateLegacyPostDocument,
    normalizePostDocument as fillPostDocument,
} from "@/lib/post-generator/defaults";
import {
    DEFAULT_POST_PRESET,
    type PostDocument,
    type PostPresetKey,
} from "@/lib/post-generator/types";

/** Accepted on create/update. Legacy aliases collapse to Option 1. */
const PRESET_KEY_INPUT = z.enum([
    "luxury-editorial",
    "gallery-atelier",
    "luxury-classic",
    "luxury-gold",
    "boutique-hotel",
    "minimal",
    "dark-luxury",
]);

const presetKeySchema = PRESET_KEY_INPUT.transform((value): PostPresetKey => {
    if (value === "gallery-atelier") return "gallery-atelier";
    return DEFAULT_POST_PRESET;
});

const amenitySchema = z.object({
    id: z.string().min(1),
    label: z.string().max(80),
    icon: z.string().max(40),
    customSvg: z.string().max(20000).nullable().optional(),
    visible: z.boolean(),
});

const contactSchema = z.object({
    id: z.string().min(1),
    type: z.enum(["instagram", "whatsapp", "website", "email", "phone"]),
    label: z.string().max(120),
    visible: z.boolean(),
});

export const postDocumentSchema = z.object({
    version: z.union([z.literal(1), z.literal(2)]),
    apartmentId: z.string().nullable(),
    apartmentName: z.string().max(120),
    apartmentSlug: z.string().max(120).nullable(),
    bookingUrl: z.string().max(500).nullable(),
    layout: z.record(z.string(), z.unknown()),
    image: z.record(z.string(), z.unknown()),
    overlay: z.record(z.string(), z.unknown()),
    headline: z.record(z.string(), z.unknown()),
    description: z.record(z.string(), z.unknown()),
    button: z.record(z.string(), z.unknown()),
    amenities: z.array(amenitySchema).max(16),
    amenitiesStyle: z.record(z.string(), z.unknown()).optional(),
    logo: z.record(z.string(), z.unknown()),
    contact: z.array(contactSchema).max(6),
    contactStyle: z.record(z.string(), z.unknown()).optional(),
    theme: z.record(z.string(), z.unknown()),
    fonts: z.record(z.string(), z.unknown()),
});

export const createPostTemplateBodySchema = z.object({
    title: z.string().min(1).max(120),
    presetKey: presetKeySchema.optional(),
    apartmentId: z.string().min(1).optional(),
    document: postDocumentSchema.optional(),
});

export const updatePostTemplateBodySchema = z.object({
    title: z.string().min(1).max(120).optional(),
    presetKey: presetKeySchema.nullable().optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    document: postDocumentSchema.optional(),
});

/**
 * Persist path: fill missing fields only. Does not rewrite layout to the
 * approved glass defaults, even when a v1 draft matches the old cream-card
 * fingerprint (pill CTA + dense glass + 4-col gold amenities, etc.).
 */
export function normalizeSavedPostDocument(raw: unknown): PostDocument {
    if (!raw || typeof raw !== "object") return fillPostDocument({});
    const parsed = postDocumentSchema.safeParse(raw);
    if (!parsed.success) {
        return fillPostDocument(raw as Partial<PostDocument>);
    }
    return fillPostDocument(parsed.data as Partial<PostDocument>);
}

/**
 * Load path: fill defaults, then migrate true v1 cream-card drafts once.
 * After migration the document is stamped version 2 so reload will not
 * re-apply heuristics.
 */
export function parsePostDocument(raw: unknown): PostDocument {
    if (!raw || typeof raw !== "object") return migrateLegacyPostDocument({});

    const parsed = postDocumentSchema.safeParse(raw);
    if (!parsed.success) {
        // Best-effort merge for drafts written before schema tightening
        return migrateLegacyPostDocument(raw as Partial<PostDocument>);
    }

    return migrateLegacyPostDocument(parsed.data as Partial<PostDocument>);
}

export function isPostPresetKey(value: string): value is PostPresetKey {
    return value === "luxury-editorial" || value === "gallery-atelier";
}

export function normalizePostPresetKey(
    value: string | null | undefined,
): PostPresetKey | null {
    if (value == null || value === "") return null;
    if (value === "gallery-atelier") return "gallery-atelier";
    return DEFAULT_POST_PRESET;
}
