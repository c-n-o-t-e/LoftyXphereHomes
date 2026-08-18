import { prisma } from "@/lib/db";
import {
    createDefaultEditorialDocument,
    mergeEditorialDocument,
} from "@/lib/content-studio/defaults";
import { applyLayout } from "@/lib/content-studio/layout-engine";
import {
    normalizeSavedEditorialDocument,
    parseEditorialDocument,
} from "@/lib/content-studio/validation";
import type {
    ContentCategory,
    EditorialDocument,
    EditorialPostRecord,
    EditorialPostStatus,
    LayoutId,
} from "@/lib/content-studio/types";

type EditorialPostRow = {
    id: string;
    title: string;
    category: string;
    layoutId: string;
    status: EditorialPostStatus;
    document: unknown;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeEditorialPost(row: EditorialPostRow): EditorialPostRecord {
    const document = parseEditorialDocument(row.document);
    return {
        id: row.id,
        title: row.title,
        category: (row.category as ContentCategory) || document.category,
        layoutId: (row.layoutId as LayoutId) || document.layoutId,
        status: row.status,
        document,
        createdByEmail: row.createdByEmail,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function listEditorialPostsForAdmin() {
    const rows = await prisma.editorialPost.findMany({
        orderBy: { updatedAt: "desc" },
    });
    return rows.map(serializeEditorialPost);
}

export async function getEditorialPostForAdmin(id: string) {
    const row = await prisma.editorialPost.findUnique({ where: { id } });
    if (!row) {
        throw Object.assign(new Error("Post not found"), { statusCode: 404 });
    }
    return serializeEditorialPost(row);
}

export async function createEditorialPostForAdmin(args: {
    title: string;
    category?: ContentCategory;
    layoutId?: LayoutId;
    document?: unknown;
    createdByEmail?: string | null;
}) {
    let document: EditorialDocument =
        args.document != null
            ? normalizeSavedEditorialDocument(args.document)
            : createDefaultEditorialDocument({
                  category: args.category,
                  layoutId: args.layoutId,
              });

    if (args.layoutId && document.layoutId !== args.layoutId) {
        document = applyLayout(document, args.layoutId);
    }
    if (args.category) {
        document = mergeEditorialDocument(document, { category: args.category });
    }

    const row = await prisma.editorialPost.create({
        data: {
            title: args.title,
            category: document.category,
            layoutId: document.layoutId,
            status: "DRAFT",
            document,
            createdByEmail: args.createdByEmail ?? null,
        },
    });

    return serializeEditorialPost(row);
}

export async function updateEditorialPostForAdmin(
    id: string,
    patch: {
        title?: string;
        category?: ContentCategory;
        layoutId?: LayoutId;
        status?: EditorialPostStatus;
        document?: unknown;
    },
) {
    const existing = await prisma.editorialPost.findUnique({ where: { id } });
    if (!existing) {
        throw Object.assign(new Error("Post not found"), { statusCode: 404 });
    }

    const document =
        patch.document !== undefined
            ? normalizeSavedEditorialDocument(patch.document)
            : undefined;

    const row = await prisma.editorialPost.update({
        where: { id },
        data: {
            ...(patch.title !== undefined ? { title: patch.title } : {}),
            ...(patch.category !== undefined ? { category: patch.category } : {}),
            ...(patch.layoutId !== undefined ? { layoutId: patch.layoutId } : {}),
            ...(patch.status !== undefined ? { status: patch.status } : {}),
            ...(document
                ? {
                      document,
                      category: document.category,
                      layoutId: document.layoutId,
                  }
                : {}),
        },
    });

    return serializeEditorialPost(row);
}

export async function duplicateEditorialPostForAdmin(
    id: string,
    createdByEmail?: string | null,
) {
    const existing = await getEditorialPostForAdmin(id);
    const row = await prisma.editorialPost.create({
        data: {
            title: `${existing.title} (copy)`,
            category: existing.category,
            layoutId: existing.layoutId,
            status: "DRAFT",
            document: existing.document,
            createdByEmail: createdByEmail ?? null,
        },
    });
    return serializeEditorialPost(row);
}

export async function deleteEditorialPostForAdmin(id: string) {
    await prisma.editorialPost.delete({ where: { id } });
}
