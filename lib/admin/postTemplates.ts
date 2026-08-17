import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import {
    applyPreset,
    createDefaultPostDocument,
    mergePostDocument,
} from "@/lib/post-generator/defaults";
import {
    normalizePostPresetKey,
    normalizeSavedPostDocument,
    parsePostDocument,
} from "@/lib/post-generator/validation";
import { DEFAULT_POST_PRESET } from "@/lib/post-generator/types";
import type {
    PostDocument,
    PostPresetKey,
    PostTemplateRecord,
    PostTemplateStatus,
} from "@/lib/post-generator/types";
import { SITE_URL } from "@/lib/constants";

type PostTemplateRow = {
    id: string;
    title: string;
    presetKey: string | null;
    status: PostTemplateStatus;
    document: unknown;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export function serializePostTemplate(row: PostTemplateRow): PostTemplateRecord {
    return {
        id: row.id,
        title: row.title,
        presetKey: normalizePostPresetKey(row.presetKey),
        status: row.status,
        document: parsePostDocument(row.document),
        createdByEmail: row.createdByEmail,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function listPostTemplatesForAdmin(args?: {
    status?: PostTemplateStatus;
}) {
    const rows = await prisma.postTemplate.findMany({
        where: args?.status ? { status: args.status } : undefined,
        orderBy: { updatedAt: "desc" },
    });
    return rows.map(serializePostTemplate);
}

export async function getPostTemplateForAdmin(id: string) {
    const row = await prisma.postTemplate.findUnique({ where: { id } });
    if (!row) {
        throw Object.assign(new Error("Template not found"), { statusCode: 404 });
    }
    return serializePostTemplate(row);
}

export async function buildPostDocumentFromApartment(
    apartmentId: string,
): Promise<Partial<PostDocument>> {
    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        throw Object.assign(new Error("Apartment not found"), { statusCode: 404 });
    }

    const cover = await prisma.apartmentImage.findFirst({
        where: { apartmentId },
        orderBy: { displayOrder: "asc" },
    });

    const bookingUrl =
        apartment.bookingUrl?.trim() ||
        `${SITE_URL.replace(/\/$/, "")}/apartments/${apartment.id}`;

    return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        apartmentSlug: apartment.id,
        bookingUrl,
        image: {
            ...createDefaultPostDocument().image,
            url: cover?.largeUrl ?? cover?.mediumUrl ?? null,
        },
        description: {
            ...createDefaultPostDocument().description,
            text:
                apartment.shortDescription?.trim() ||
                createDefaultPostDocument().description.text,
        },
    };
}

export async function createPostTemplateForAdmin(args: {
    title: string;
    presetKey?: PostPresetKey;
    apartmentId?: string;
    document?: unknown;
    createdByEmail?: string | null;
}) {
    let document =
        args.document != null
            ? normalizeSavedPostDocument(args.document)
            : args.presetKey
              ? applyPreset(args.presetKey)
              : createDefaultPostDocument();

    if (args.apartmentId) {
        const fromApt = await buildPostDocumentFromApartment(args.apartmentId);
        document = mergePostDocument(document, fromApt);
    }

    const row = await prisma.postTemplate.create({
        data: {
            title: args.title,
            presetKey: args.presetKey ?? DEFAULT_POST_PRESET,
            status: "DRAFT",
            document,
            createdByEmail: args.createdByEmail ?? null,
        },
    });

    return serializePostTemplate(row);
}

export async function updatePostTemplateForAdmin(
    id: string,
    patch: {
        title?: string;
        presetKey?: PostPresetKey | null;
        status?: PostTemplateStatus;
        document?: unknown;
    },
) {
    const existing = await prisma.postTemplate.findUnique({ where: { id } });
    if (!existing) {
        throw Object.assign(new Error("Template not found"), { statusCode: 404 });
    }

    const row = await prisma.postTemplate.update({
        where: { id },
        data: {
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.presetKey !== undefined
                ? { presetKey: normalizePostPresetKey(patch.presetKey) }
                : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            ...(patch.document !== undefined
                ? { document: normalizeSavedPostDocument(patch.document) }
                : {}),
        },
    });

    return serializePostTemplate(row);
}

export async function duplicatePostTemplateForAdmin(
    id: string,
    createdByEmail?: string | null,
) {
    const existing = await getPostTemplateForAdmin(id);
    const row = await prisma.postTemplate.create({
        data: {
            title: `${existing.title} (copy)`,
            presetKey: existing.presetKey,
            status: "DRAFT",
            document: existing.document,
            createdByEmail: createdByEmail ?? null,
        },
    });
    return serializePostTemplate(row);
}

export async function deletePostTemplateForAdmin(id: string) {
    await prisma.postTemplate.delete({ where: { id } });
}
