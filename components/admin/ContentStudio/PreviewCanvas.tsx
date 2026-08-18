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
    return (
        <div
            className="relative overflow-hidden rounded-sm shadow-[0_24px_80px_rgba(36,26,20,0.18)] ring-1 ring-black/10"
            style={{
                width: STUDIO_CANVAS_WIDTH * scale,
                height: STUDIO_CANVAS_HEIGHT * scale,
            }}
        >
            <div
                style={{
                    width: STUDIO_CANVAS_WIDTH,
                    height: STUDIO_CANVAS_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
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
