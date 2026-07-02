"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { FlyerPageSize, FlyerPayload, FlyerTemplateKey } from "@/lib/flyers/types";
import { FlyerPreview } from "@/components/admin/flyers/FlyerPreview";

type FlyerExportOverlayProps = {
    open: boolean;
    payload: FlyerPayload;
    templateKey: FlyerTemplateKey;
    pageSize: FlyerPageSize;
    exportRef: React.RefObject<HTMLDivElement | null>;
};

export function FlyerExportOverlay({
    open,
    payload,
    templateKey,
    pageSize,
    exportRef,
}: FlyerExportOverlayProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !open) {
        return null;
    }

    return createPortal(
        <div
            aria-hidden
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 2147483646,
                background: "rgba(248, 250, 252, 0.98)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                overflow: "auto",
                padding: "24px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: 500,
                }}
            >
                <span
                    aria-hidden
                    style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid #cbd5e1",
                        borderTopColor: "#334155",
                        borderRadius: "999px",
                        animation: "flyer-export-spin 0.8s linear infinite",
                    }}
                />
                Generating export…
            </div>
            <style>{`@keyframes flyer-export-spin { to { transform: rotate(360deg); } }`}</style>
            <div ref={exportRef}>
                <FlyerPreview
                    payload={payload}
                    templateKey={templateKey}
                    pageSize={pageSize}
                    forExport
                />
            </div>
        </div>,
        document.body,
    );
}
