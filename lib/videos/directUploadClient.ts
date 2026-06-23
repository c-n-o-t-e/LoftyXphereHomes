import { getSupabaseClient } from "@/lib/supabase/client";

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
    file: File;
    authHeaders: Record<string, string>;
}) {
    const initRes = await fetch("/api/admin/hero-video/init", {
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
    });

    const initData = await parseApiResponse<{
        upload: {
            heroId: string;
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

    const completeRes = await fetch("/api/admin/hero-video/complete", {
        method: "POST",
        headers: {
            ...args.authHeaders,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            heroId: upload.heroId,
            mimeType: args.file.type || "application/octet-stream",
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
