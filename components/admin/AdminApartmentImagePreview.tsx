"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type AdminApartmentImagePreviewProps = {
    apartmentId: string;
    imageId: string;
    alt: string;
    className?: string;
};

export function AdminApartmentImagePreview({
    apartmentId,
    imageId,
    alt,
    className,
}: AdminApartmentImagePreviewProps) {
    const [src, setSrc] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        let cancelled = false;

        async function loadPreview() {
            try {
                const supabase = getSupabaseClient();
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) {
                    throw new Error("Not signed in");
                }

                const res = await fetch(
                    `/api/admin/apartments/${apartmentId}/images/${imageId}/preview?variant=medium`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                if (!res.ok) {
                    throw new Error("Preview unavailable");
                }

                const blob = await res.blob();
                if (cancelled) return;

                objectUrl = URL.createObjectURL(blob);
                setSrc(objectUrl);
                setFailed(false);
            } catch {
                if (!cancelled) setFailed(true);
            }
        }

        void loadPreview();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [apartmentId, imageId]);

    if (failed) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 text-xs text-gray-500 text-center px-2 ${className ?? ""}`}
            >
                Preview unavailable — delete and re-upload this photo
            </div>
        );
    }

    if (!src) {
        return (
            <div
                className={`animate-pulse bg-gray-200 ${className ?? ""}`}
                aria-label="Loading image preview"
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
            decoding="async"
        />
    );
}
