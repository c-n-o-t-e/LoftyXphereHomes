import { z } from "zod";
import { migrateLegacyPostDocument } from "@/lib/post-generator/defaults";
import type { PostDocument, PostPresetKey } from "@/lib/post-generator/types";

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
    version: z.literal(1),
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
    presetKey: z
        .enum([
            "luxury-editorial",
            "luxury-classic",
            "luxury-gold",
            "boutique-hotel",
            "minimal",
            "dark-luxury",
        ])
        .optional(),
    apartmentId: z.string().min(1).optional(),
    document: postDocumentSchema.optional(),
});

export const updatePostTemplateBodySchema = z.object({
    title: z.string().min(1).max(120).optional(),
    presetKey: z
        .enum([
            "luxury-editorial",
            "luxury-classic",
            "luxury-gold",
            "boutique-hotel",
            "minimal",
            "dark-luxury",
        ])
        .nullable()
        .optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    document: postDocumentSchema.optional(),
});

export function parsePostDocument(raw: unknown): PostDocument {
    const defaults = migrateLegacyPostDocument({});
    if (!raw || typeof raw !== "object") return defaults;

    const parsed = postDocumentSchema.safeParse(raw);
    if (!parsed.success) {
        // Best-effort merge for drafts written before schema tightening
        return migrateLegacyPostDocument(raw as Partial<PostDocument>);
    }

    return migrateLegacyPostDocument(parsed.data as Partial<PostDocument>);
}

export function isPostPresetKey(value: string): value is PostPresetKey {
    return [
        "luxury-editorial",
        "luxury-classic",
        "luxury-gold",
        "boutique-hotel",
        "minimal",
        "dark-luxury",
    ].includes(value);
}
