"use client";

import { studioIconSvg } from "@/lib/content-studio/icons";
import type { StudioIconKey } from "@/lib/content-studio/types";

export function StudioIcon({
    name,
    color,
    size = 22,
}: {
    name: StudioIconKey;
    color: string;
    size?: number;
}) {
    return (
        <span
            aria-hidden
            className="inline-flex shrink-0"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{
                __html: studioIconSvg(name, color, size, 1.6),
            }}
        />
    );
}
