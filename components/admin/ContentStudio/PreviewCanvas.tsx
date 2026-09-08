"use client";

import { STUDIO_CANVAS_HEIGHT, STUDIO_CANVAS_WIDTH } from "@/lib/content-studio/types";
import type { EditorialDocument } from "@/lib/content-studio/types";
import { LayoutRenderer } from "@/components/admin/ContentStudio/LayoutRenderer";

export function PreviewCanvas({
    document,
    scale,
    onAssetChange,
}: {
    document: EditorialDocument;
    scale: number;
    onAssetChange: (patch: Partial<EditorialDocument["asset"]>) => void;
}) {
    const width = Math.max(1, Math.round(STUDIO_CANVAS_WIDTH * scale));
    const height = Math.max(1, Math.round(STUDIO_CANVAS_HEIGHT * scale));

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-sm bg-[#F6EFE3] shadow-[0_24px_80px_rgba(36,26,20,0.18)] ring-1 ring-black/10"
            style={{ width, height }}
        >
            <div
                className="absolute top-0 left-0 origin-top-left"
                style={{
                    width: STUDIO_CANVAS_WIDTH,
                    height: STUDIO_CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                }}
            >
                <LayoutRenderer
                    document={document}
                    previewScale={scale}
                    onAssetChange={onAssetChange}
                />
            </div>
        </div>
    );
}
