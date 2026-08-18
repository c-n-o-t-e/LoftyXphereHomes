import { prisma } from "@/lib/db";
import type { AssetCategory, EditorialAssetRecord } from "@/lib/content-studio/types";

type EditorialAssetRow = {
    id: string;
    name: string;
    category: string;
    prompt: string;
    imageUrl: string;
    style: string;
    approved: boolean;
    favorite: boolean;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeEditorialAsset(row: EditorialAssetRow): EditorialAssetRecord {
    return {
        id: row.id,
        name: row.name,
        category: row.category as AssetCategory,
        prompt: row.prompt,
        imageUrl: row.imageUrl,
        style: row.style,
        approved: row.approved,
        favorite: row.favorite,
        createdByEmail: row.createdByEmail,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function listEditorialAssetsForAdmin(args?: {
    category?: AssetCategory;
    approved?: boolean;
}) {
    const rows = await prisma.editorialAsset.findMany({
        where: {
            ...(args?.category ? { category: args.category } : {}),
            ...(args?.approved !== undefined ? { approved: args.approved } : {}),
        },
        orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
    });
    return rows.map(serializeEditorialAsset);
}

export async function createEditorialAssetForAdmin(args: {
    name: string;
    category: AssetCategory;
    prompt?: string;
    imageUrl: string;
    style?: string;
    approved?: boolean;
    favorite?: boolean;
    createdByEmail?: string | null;
}) {
    const row = await prisma.editorialAsset.create({
        data: {
            name: args.name,
            category: args.category,
            prompt: args.prompt ?? "",
            imageUrl: args.imageUrl,
            style: args.style ?? "lxh-editorial",
            approved: args.approved ?? true,
            favorite: args.favorite ?? false,
            createdByEmail: args.createdByEmail ?? null,
        },
    });
    return serializeEditorialAsset(row);
}

export async function updateEditorialAssetForAdmin(
    id: string,
    patch: {
        name?: string;
        category?: AssetCategory;
        prompt?: string;
        imageUrl?: string;
        style?: string;
        approved?: boolean;
        favorite?: boolean;
    },
) {
    const existing = await prisma.editorialAsset.findUnique({ where: { id } });
    if (!existing) {
        throw Object.assign(new Error("Asset not found"), { statusCode: 404 });
    }

    const row = await prisma.editorialAsset.update({
        where: { id },
        data: {
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.category !== undefined ? { category: patch.category } : {}),
            ...(patch.prompt !== undefined ? { prompt: patch.prompt } : {}),
            ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
            ...(patch.style !== undefined ? { style: patch.style } : {}),
            ...(patch.approved !== undefined ? { approved: patch.approved } : {}),
            ...(patch.favorite !== undefined ? { favorite: patch.favorite } : {}),
        },
    });
    return serializeEditorialAsset(row);
}

export async function deleteEditorialAssetForAdmin(id: string) {
    await prisma.editorialAsset.delete({ where: { id } });
}
