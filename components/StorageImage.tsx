"use client";

import { useMemo, useState } from "react";

type StorageImageProps = {
    urls: string[];
    alt: string;
    className?: string;
};

export function StorageImage({ urls, alt, className }: StorageImageProps) {
    const candidates = useMemo(
        () => [...new Set(urls.filter((url) => typeof url === "string" && url.trim()))],
        [urls],
    );
    const [index, setIndex] = useState(0);

    const src = candidates[index];
    if (!src) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-200 text-xs text-gray-500 ${className ?? ""}`}
            >
                No preview
            </div>
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
            onError={() => {
                setIndex((current) =>
                    current + 1 < candidates.length ? current + 1 : current,
                );
            }}
        />
    );
}
