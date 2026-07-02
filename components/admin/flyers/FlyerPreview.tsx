"use client";

import { useEffect, useRef, useState } from "react";
import { generateFlyerQrDataUrl } from "@/lib/flyers/qr";
import type { FlyerPageSize, FlyerPayload, FlyerSide, FlyerTemplateKey } from "@/lib/flyers/types";
import { getFlyerDimensions, getFlyerPreviewCssSize } from "@/lib/flyers/dimensions";
import { FlyerPage } from "@/components/admin/flyers/FlyerPage";

type FlyerPreviewProps = {
    payload: FlyerPayload;
    templateKey: FlyerTemplateKey;
    pageSize: FlyerPageSize;
    side?: FlyerSide | "both";
    forExport?: boolean;
    className?: string;
    exportRef?: React.RefObject<HTMLDivElement | null>;
};

export function FlyerPreview({
    payload,
    templateKey,
    pageSize,
    side = "both",
    forExport = false,
    className,
    exportRef,
}: FlyerPreviewProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const internalRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const containerRef = exportRef ?? internalRef;
    const dims = getFlyerDimensions(pageSize);
    const previewCss = getFlyerPreviewCssSize(pageSize);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        let cancelled = false;
        void generateFlyerQrDataUrl(payload, 512).then((url) => {
            if (!cancelled) setQrDataUrl(url);
        });
        return () => {
            cancelled = true;
        };
    }, [payload]);

    useEffect(() => {
        if (forExport) return;
        const node = viewportRef.current;
        if (!node) return;

        const updateWidth = () => {
            setViewportWidth(node.clientWidth);
        };

        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(node);
        return () => observer.disconnect();
    }, [forExport, pageSize]);

    const previewScale =
        forExport || viewportWidth <= 0
            ? 1
            : viewportWidth / previewCss.widthPx;

    const pages: FlyerSide[] = side === "both" ? ["front", "back"] : [side];

    return (
        <div className={className}>
            <div
                ref={viewportRef}
                className={forExport ? undefined : "w-full"}
                style={
                    forExport
                        ? {
                              position: "relative",
                              overflow: "visible",
                          }
                        : undefined
                }
            >
                <div
                    ref={containerRef}
                    style={
                        forExport
                            ? {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "24px",
                                  alignItems: "center",
                              }
                            : {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "1.5rem",
                                  alignItems: "center",
                                  width: "100%",
                              }
                    }
                >
                    {pages.map((pageSide) => (
                        <div
                            key={pageSide}
                            className={forExport ? undefined : "w-full flex flex-col items-center"}
                            style={
                                forExport
                                    ? undefined
                                    : {
                                          height:
                                              previewCss.heightPx * previewScale + 28,
                                      }
                            }
                        >
                            <div
                                style={
                                    forExport
                                        ? undefined
                                        : {
                                              transform: `scale(${previewScale})`,
                                              transformOrigin: "top center",
                                              width: previewCss.widthPx,
                                              boxShadow:
                                                  "0 18px 40px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06)",
                                          }
                                }
                            >
                                <FlyerPage
                                    side={pageSide}
                                    payload={payload}
                                    templateKey={templateKey}
                                    pageSize={pageSize}
                                    qrDataUrl={qrDataUrl}
                                    forExport={forExport}
                                />
                            </div>
                            {!forExport ? (
                                <p className="mt-2 text-center text-xs uppercase tracking-widest text-slate-400">
                                    {pageSide} — {dims.label}
                                </p>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
