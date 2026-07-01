import { getSupabaseClient } from "@/lib/supabase/client";
import type { ApartmentVideoConfig } from "@/lib/videos/types";

async function parseApiResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let data: (T & { error?: string }) | null = null;

    if (text) {
        try {
            data = JSON.parse(text) as T & { error?: string };
        } catch {
            throw new Error(
                text.length > 180 ? `${text.slice(0, 180)}…` : text,
            );
        }
    }

    if (!res.ok) {
        throw new Error(data?.error ?? (text || "Request failed"));
    }

    if (!data) {
        throw new Error("Empty response from server");
    }

    return data;
}

export async function uploadHeroVideoDirect(args: {
    mobileFile: File;
    desktopFile: File;
    authHeaders: Record<string, string>;
}) {
    const initRes = await fetch("/api/admin/hero-video/init", {
        method: "POST",
        headers: {
            ...args.authHeaders,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            mobile: {
                fileName: args.mobileFile.name,
                mimeType: args.mobileFile.type || "application/octet-stream",
                fileSize: args.mobileFile.size,
            },
            desktop: {
                fileName: args.desktopFile.name,
                mimeType: args.desktopFile.type || "application/octet-stream",
                fileSize: args.desktopFile.size,
            },
        }),
    });

    const initData = await parseApiResponse<{
        upload: {
            heroId: string;
            bucket: string;
            uploads: {
                mobile: { path: string; token: string };
                desktop: { path: string; token: string };
            };
        };
    }>(initRes);
    const upload = initData.upload;

    const supabase = getSupabaseClient();

    const uploadSlot = async (file: File, slot: "mobile" | "desktop") => {
        const slotUpload = upload.uploads[slot];
        const fileBody = await file.arrayBuffer();
        const { error: storageError } = await supabase.storage
            .from(upload.bucket)
            .uploadToSignedUrl(slotUpload.path, slotUpload.token, fileBody, {
                contentType: file.type || "application/octet-stream",
                upsert: true,
            });

        if (storageError) {
            throw new Error(storageError.message);
        }
    };

    await Promise.all([
        uploadSlot(args.mobileFile, "mobile"),
        uploadSlot(args.desktopFile, "desktop"),
    ]);

    const completeRes = await fetch("/api/admin/hero-video/complete", {
        method: "POST",
        headers: {
            ...args.authHeaders,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            heroId: upload.heroId,
            mobileMimeType: args.mobileFile.type || "application/octet-stream",
            desktopMimeType: args.desktopFile.type || "application/octet-stream",
        }),
    });

    const completeData = await parseApiResponse<{
        heroVideo: {
            id: string;
            mobileMp4Url: string;
            desktopMp4Url: string;
            posterUrl: string;
            updatedAt: string;
        };
    }>(completeRes);

    return completeData.heroVideo;
}

export async function uploadApartmentVideoDirect(args: {
    apartmentId: string;
    file: File;
    authHeaders: Record<string, string>;
}): Promise<ApartmentVideoConfig> {
    const initRes = await fetch(
        `/api/admin/apartments/${args.apartmentId}/video/init`,
        {
            method: "POST",
            headers: {
                ...args.authHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: args.file.name,
                mimeType: args.file.type || "application/octet-stream",
                fileSize: args.file.size,
            }),
        },
    );

    const initData = await parseApiResponse<{
        upload: {
            videoId: string;
            bucket: string;
            path: string;
            token: string;
        };
    }>(initRes);
    const upload = initData.upload;

    const supabase = getSupabaseClient();
    const fileBody = await args.file.arrayBuffer();

    const { error: storageError } = await supabase.storage
        .from(upload.bucket)
        .uploadToSignedUrl(upload.path, upload.token, fileBody, {
            contentType: args.file.type || "application/octet-stream",
            upsert: true,
        });

    if (storageError) {
        throw new Error(storageError.message);
    }

    const completeRes = await fetch(
        `/api/admin/apartments/${args.apartmentId}/video/complete`,
        {
            method: "POST",
            headers: {
                ...args.authHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                videoId: upload.videoId,
                mimeType: args.file.type || "application/octet-stream",
            }),
        },
    );

    const completeData = await parseApiResponse<{
        apartmentVideo: ApartmentVideoConfig;
    }>(completeRes);

    return completeData.apartmentVideo;
}
