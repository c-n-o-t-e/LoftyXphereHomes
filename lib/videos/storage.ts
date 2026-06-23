import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureApartmentImagesBucket } from "@/lib/images/bucket";
import { HERO_STORAGE_PREFIX, HERO_VIDEO_BUCKET } from "./constants";
import type { HeroVideoUrls } from "./types";

function requireSupabaseUploadEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        throw new Error("Missing Supabase storage credentials");
    }
    return { supabaseUrl, serviceKey };
}

function toBinaryBody(buffer: Buffer): ArrayBuffer {
    const copy = new ArrayBuffer(buffer.length);
    new Uint8Array(copy).set(buffer);
    return copy;
}

export function buildHeroStorageKeyBase(heroId: string) {
    return `${HERO_STORAGE_PREFIX}/${heroId}`;
}

export function buildHeroRawUploadKey(heroId: string) {
    return `${buildHeroStorageKeyBase(heroId)}/raw-upload`;
}

export function buildPublicHeroStorageUrl(storageKey: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    return `${supabaseUrl}/storage/v1/object/public/${HERO_VIDEO_BUCKET}/${storageKey}`;
}

async function uploadBinaryObject(
    storageKey: string,
    buffer: Buffer,
    contentType: string,
) {
    const { supabaseUrl, serviceKey } = requireSupabaseUploadEnv();
    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${HERO_VIDEO_BUCKET}/${storageKey}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": contentType,
                "x-upsert": "true",
                "cache-control": "public, max-age=31536000, immutable",
            },
            body: toBinaryBody(buffer),
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to upload ${storageKey}: ${text || response.statusText}`,
        );
    }
}

export async function uploadHeroVideoVariants(args: {
    heroId: string;
    variants: {
        mobile: Buffer;
        desktop: Buffer;
        poster: Buffer;
    };
}): Promise<HeroVideoUrls & { storageKeyBase: string }> {
    await ensureApartmentImagesBucket();
    const storageKeyBase = buildHeroStorageKeyBase(args.heroId);

    await uploadBinaryObject(
        `${storageKeyBase}/mobile.mp4`,
        args.variants.mobile,
        "video/mp4",
    );
    await uploadBinaryObject(
        `${storageKeyBase}/desktop.mp4`,
        args.variants.desktop,
        "video/mp4",
    );
    await uploadBinaryObject(
        `${storageKeyBase}/poster.webp`,
        args.variants.poster,
        "image/webp",
    );

    return {
        storageKeyBase,
        mobileMp4Url: buildPublicHeroStorageUrl(`${storageKeyBase}/mobile.mp4`),
        desktopMp4Url: buildPublicHeroStorageUrl(`${storageKeyBase}/desktop.mp4`),
        posterUrl: buildPublicHeroStorageUrl(`${storageKeyBase}/poster.webp`),
    };
}

export async function deleteHeroVideoStorage(storageKeyBase: string) {
    const supabase = createServerSupabaseClient();
    const keys = [
        `${storageKeyBase}/mobile.mp4`,
        `${storageKeyBase}/desktop.mp4`,
        `${storageKeyBase}/poster.webp`,
        `${storageKeyBase}/raw-upload`,
    ];
    const { error } = await supabase.storage.from(HERO_VIDEO_BUCKET).remove(keys);
    if (error) {
        throw new Error(`Failed to delete hero video files: ${error.message}`);
    }
}

export async function downloadHeroRawUpload(heroId: string): Promise<Buffer> {
    const { supabaseUrl, serviceKey } = requireSupabaseUploadEnv();
    const storageKey = buildHeroRawUploadKey(heroId);
    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${HERO_VIDEO_BUCKET}/${storageKey}`,
        { headers: { Authorization: `Bearer ${serviceKey}` } },
    );
    if (!response.ok) {
        throw new Error(`Failed to download raw hero video: ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

export async function createHeroRawUploadSignedUrl(heroId: string) {
    await ensureApartmentImagesBucket();
    const supabase = createServerSupabaseClient();
    const path = buildHeroRawUploadKey(heroId);
    const { data, error } = await supabase.storage
        .from(HERO_VIDEO_BUCKET)
        .createSignedUploadUrl(path);

    if (error || !data) {
        throw new Error(
            `Failed to create hero upload URL: ${error?.message ?? "unknown error"}`,
        );
    }

    return { path: data.path, token: data.token };
}

export async function deleteHeroRawUpload(heroId: string) {
    const supabase = createServerSupabaseClient();
    const path = buildHeroRawUploadKey(heroId);
    const { error } = await supabase.storage.from(HERO_VIDEO_BUCKET).remove([path]);
    if (error) {
        throw new Error(`Failed to delete temporary hero upload: ${error.message}`);
    }
}
