import { getSupabaseClient } from "@/lib/supabase/client";

type DirectUploadInit = {
    imageId: string;
    bucket: string;
    path: string;
    token: string;
    mode: "create" | "replace";
};

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
        throw new Error(data?.error ?? text || "Request failed");
    }

    if (!data) {
        throw new Error("Empty response from server");
    }

    return data;
}

export async function uploadApartmentImageDirect(args: {
    apartmentId: string;
    file: File;
    authHeaders: Record<string, string>;
    replaceImageId?: string;
    altText?: string | null;
}) {
    const initRes = await fetch(
        `/api/admin/apartments/${args.apartmentId}/images/init`,
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
                replaceImageId: args.replaceImageId,
            }),
        },
    );

    const initData = await parseApiResponse<{
        upload: DirectUploadInit;
    }>(initRes);
    const upload = initData.upload;

    const supabase = getSupabaseClient();
    const { error: storageError } = await supabase.storage
        .from(upload.bucket)
        .uploadToSignedUrl(upload.path, upload.token, args.file, {
            contentType: args.file.type || "application/octet-stream",
            upsert: true,
        });

    if (storageError) {
        throw new Error(storageError.message);
    }

    const completeRes = await fetch(
        `/api/admin/apartments/${args.apartmentId}/images/complete`,
        {
            method: "POST",
            headers: {
                ...args.authHeaders,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                imageId: upload.imageId,
                mimeType: args.file.type || "application/octet-stream",
                mode: upload.mode,
                altText: args.altText,
            }),
        },
    );

    const completeData = await parseApiResponse<{
        image: {
            id: string;
            apartmentId: string;
            thumbnailUrl: string;
            mediumUrl: string;
            largeUrl: string;
            altText: string | null;
            displayOrder: number;
        };
    }>(completeRes);

    return completeData.image;
}
