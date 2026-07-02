import { prisma } from "@/lib/db";
import {
    buildFlyerPayloadFromApartment,
    createDefaultFlyerPayload,
    mergeFlyerPayload,
} from "@/lib/flyers/defaults";
import type {
    FlyerPageSize,
    FlyerPayload,
    FlyerRecord,
    FlyerTemplateKey,
} from "@/lib/flyers/types";
import { parseFlyerPayload } from "@/lib/flyers/validation";

type FlyerRow = {
    id: string;
    title: string;
    templateKey: string;
    pageSize: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    payload: unknown;
    createdByEmail: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeFlyer(row: FlyerRow): FlyerRecord {
    return {
        id: row.id,
        title: row.title,
        templateKey: row.templateKey as FlyerTemplateKey,
        pageSize: row.pageSize as FlyerPageSize,
        status: row.status,
        payload: parseFlyerPayload(row.payload),
        createdByEmail: row.createdByEmail,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function listFlyersForAdmin(args?: {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
    const rows = await prisma.flyer.findMany({
        where: args?.status ? { status: args.status } : undefined,
        orderBy: { updatedAt: "desc" },
    });
    return rows.map(serializeFlyer);
}

export async function getFlyerForAdmin(id: string) {
    const row = await prisma.flyer.findUnique({ where: { id } });
    if (!row) {
        throw Object.assign(new Error("Flyer not found"), { statusCode: 404 });
    }
    return serializeFlyer(row);
}

export async function createFlyerForAdmin(args: {
    title: string;
    templateKey: FlyerTemplateKey;
    pageSize?: FlyerPageSize;
    apartmentId?: string;
    createdByEmail?: string | null;
}) {
    let payload = createDefaultFlyerPayload();

    if (args.apartmentId) {
        const apartmentPatch = await buildFlyerPayloadFromApartment(args.apartmentId);
        payload = mergeFlyerPayload(payload, apartmentPatch);
    }

    const row = await prisma.flyer.create({
        data: {
            title: args.title,
            templateKey: args.templateKey,
            pageSize: args.pageSize ?? "a5-portrait",
            status: "DRAFT",
            payload,
            createdByEmail: args.createdByEmail ?? null,
        },
    });

    return serializeFlyer(row);
}

export async function updateFlyerForAdmin(
    id: string,
    patch: {
        title?: string;
        templateKey?: FlyerTemplateKey;
        pageSize?: FlyerPageSize;
        status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        payload?: FlyerPayload;
    },
) {
    const existing = await prisma.flyer.findUnique({ where: { id } });
    if (!existing) {
        throw Object.assign(new Error("Flyer not found"), { statusCode: 404 });
    }

    const currentPayload = parseFlyerPayload(existing.payload);
    const nextPayload = patch.payload
        ? mergeFlyerPayload(currentPayload, patch.payload)
        : currentPayload;

    const row = await prisma.flyer.update({
        where: { id },
        data: {
            title: patch.title ?? existing.title,
            templateKey: patch.templateKey ?? existing.templateKey,
            pageSize: patch.pageSize ?? existing.pageSize,
            status: patch.status ?? existing.status,
            payload: nextPayload,
        },
    });

    return serializeFlyer(row);
}

export async function duplicateFlyerForAdmin(id: string, createdByEmail?: string | null) {
    const existing = await getFlyerForAdmin(id);
    const row = await prisma.flyer.create({
        data: {
            title: `${existing.title} (Copy)`,
            templateKey: existing.templateKey,
            pageSize: existing.pageSize,
            status: "DRAFT",
            payload: existing.payload,
            createdByEmail: createdByEmail ?? existing.createdByEmail,
        },
    });
    return serializeFlyer(row);
}

export async function deleteFlyerForAdmin(id: string) {
    const existing = await prisma.flyer.findUnique({ where: { id } });
    if (!existing) {
        throw Object.assign(new Error("Flyer not found"), { statusCode: 404 });
    }
    await prisma.flyer.delete({ where: { id } });
}

export async function applyApartmentPresetToFlyer(id: string, apartmentId: string) {
    const existing = await getFlyerForAdmin(id);
    const apartmentPatch = await buildFlyerPayloadFromApartment(apartmentId);
    const nextPayload = mergeFlyerPayload(existing.payload, apartmentPatch);

    return updateFlyerForAdmin(id, { payload: nextPayload });
}
