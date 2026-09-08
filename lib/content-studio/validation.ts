import { z } from "zod";
import { createDefaultEditorialDocument, mergeEditorialDocument } from "@/lib/content-studio/defaults";
import {
    ASSET_CATEGORIES,
    CONTENT_CATEGORIES,
    FOOTER_VARIANTS,
    LAYOUT_IDS,
    LOGO_VARIANTS,
    STUDIO_DOCUMENT_VERSION,
    THEME_IDS,
    type EditorialDocument,
} from "@/lib/content-studio/types";

const pointSchema = z.object({
    id: z.string().min(1),
    number: z.string().max(8),
    heading: z.string().max(80),
    body: z.string().max(240),
    icon: z.string().max(40),
});

export const editorialDocumentSchema = z.object({
    version: z.literal(STUDIO_DOCUMENT_VERSION),
    format: z.enum(["portrait-4-5", "story-9-16", "square-1-1"]),
    category: z.enum(CONTENT_CATEGORIES),
    layoutId: z.enum(LAYOUT_IDS),
    themeId: z.enum(THEME_IDS),
    theme: z.record(z.string(), z.unknown()),
    fonts: z.record(z.string(), z.unknown()),
    typography: z.record(z.string(), z.unknown()),
    content: z.object({
        kicker: z.string().max(80),
        title: z.string().max(220),
        subtitle: z.string().max(160),
        body: z.string().max(600),
        cta: z.string().max(80),
        ctaScript: z.string().max(80).optional().default(""),
        ctaButton: z.string().max(80).optional().default(""),
        seriesNumber: z.string().max(8).optional().default(""),
        points: z.array(pointSchema).max(8),
        keywords: z.array(z.string().max(40)).max(12),
    }),
    asset: z.record(z.string(), z.unknown()),
    logo: z.object({
        variant: z.enum(LOGO_VARIANTS),
        opacity: z.number(),
        size: z.number(),
        wordmark: z.string().max(80),
        showWordmark: z.boolean(),
    }),
    footer: z.object({
        variant: z.enum(FOOTER_VARIANTS),
        instagram: z.string().max(80),
        whatsapp: z.string().max(40),
        website: z.string().max(80),
    }),
});

export const createEditorialPostBodySchema = z.object({
    title: z.string().min(1).max(120),
    category: z.enum(CONTENT_CATEGORIES).optional(),
    layoutId: z.enum(LAYOUT_IDS).optional(),
    document: editorialDocumentSchema.optional(),
});

export const updateEditorialPostBodySchema = z.object({
    title: z.string().min(1).max(120).optional(),
    category: z.enum(CONTENT_CATEGORIES).optional(),
    layoutId: z.enum(LAYOUT_IDS).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    document: editorialDocumentSchema.optional(),
});

export const createEditorialAssetBodySchema = z.object({
    name: z.string().min(1).max(120),
    category: z.enum(ASSET_CATEGORIES),
    prompt: z.string().max(2000).optional(),
    imageUrl: z.string().min(1),
    style: z.string().max(40).optional(),
    approved: z.boolean().optional(),
    favorite: z.boolean().optional(),
});

export const updateEditorialAssetBodySchema = z.object({
    name: z.string().min(1).max(120).optional(),
    category: z.enum(ASSET_CATEGORIES).optional(),
    prompt: z.string().max(2000).optional(),
    imageUrl: z.string().min(1).optional(),
    style: z.string().max(40).optional(),
    approved: z.boolean().optional(),
    favorite: z.boolean().optional(),
});

export const generateVisualBodySchema = z.object({
    title: z.string().max(220).optional(),
    category: z.enum(CONTENT_CATEGORIES).optional(),
    keywords: z.array(z.string().max(40)).max(12).optional(),
    concept: z.string().max(400).optional(),
    layoutId: z.enum(LAYOUT_IDS).optional(),
});

export const recommendBodySchema = z.object({
    title: z.string().max(220).optional(),
    category: z.enum(CONTENT_CATEGORIES).optional(),
    keywords: z.array(z.string().max(40)).max(12).optional(),
});

export function parseEditorialDocument(raw: unknown): EditorialDocument {
    if (!raw || typeof raw !== "object") {
        return createDefaultEditorialDocument();
    }
    const parsed = editorialDocumentSchema.safeParse(raw);
    if (!parsed.success) {
        return mergeEditorialDocument(
            createDefaultEditorialDocument(),
            raw as Partial<EditorialDocument>,
        );
    }
    return mergeEditorialDocument(
        createDefaultEditorialDocument({
            category: parsed.data.category,
            layoutId: parsed.data.layoutId,
            themeId: parsed.data.themeId,
        }),
        parsed.data as Partial<EditorialDocument>,
    );
}

export function normalizeSavedEditorialDocument(raw: unknown): EditorialDocument {
    return parseEditorialDocument(raw);
}
