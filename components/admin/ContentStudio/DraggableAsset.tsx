"use client";

import { useRef } from "react";
import { getLayout } from "@/lib/content-studio/layouts";
import { editorialPlaceholderSrc } from "@/lib/content-studio/placeholders";
import type { EditorialDocument, StudioAssetTransform } from "@/lib/content-studio/types";

type DragMode = "move" | "scale" | "rotate";

export function DraggableAsset({
    document,
    scale,
    onChange,
}: {
    document: EditorialDocument;
    scale: number;
    onChange: (patch: Partial<StudioAssetTransform>) => void;
}) {
    const layout = getLayout(document.layoutId);
    const asset = document.asset;
    const modeRef = useRef<DragMode>("move");
    const startRef = useRef({
        x: 0,
        y: 0,
        assetX: 0,
        assetY: 0,
        assetScale: 1,
        assetRotation: 0,
    });

    const src = asset.url ?? editorialPlaceholderSrc(asset.category, layout.assetTreatment);
    const width = asset.width * asset.scale;
    const height = asset.height * asset.scale;
    const isHero = layout.heroBleed || layout.assetTreatment === "hero";

    const onPointerDown = (mode: DragMode) => (event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        modeRef.current = mode;
        startRef.current = {
            x: event.clientX,
            y: event.clientY,
            assetX: asset.x,
            assetY: asset.y,
            assetScale: asset.scale,
            assetRotation: asset.rotation,
        };
    };

    const onPointerMove = (event: React.PointerEvent) => {
        if (!(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
            return;
        }
        const dx = (event.clientX - startRef.current.x) / scale;
        const dy = (event.clientY - startRef.current.y) / scale;
        if (modeRef.current === "move") {
            onChange({
                x: startRef.current.assetX + dx,
                y: startRef.current.assetY + dy,
            });
            return;
        }
        if (modeRef.current === "scale") {
            const next = Math.min(
                2.4,
                Math.max(0.35, startRef.current.assetScale + dx / 280),
            );
            onChange({ scale: Number(next.toFixed(3)) });
            return;
        }
        onChange({
            rotation: Math.round(startRef.current.assetRotation + dx * 0.4),
        });
    };

    if (isHero) {
        return (
            <div
                className="absolute inset-0 cursor-grab overflow-hidden active:cursor-grabbing"
                onPointerDown={onPointerDown("move")}
                onPointerMove={onPointerMove}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="absolute max-w-none"
                    style={{
                        left: asset.x - width / 2,
                        top: asset.y - height / 2,
                        width,
                        height,
                        objectFit: "cover",
                        opacity: asset.opacity,
                    }}
                />
            </div>
        );
    }

    const shadowOpacity = asset.shadowOpacity ?? 0.18;
    const shadowBlur = asset.shadowBlur ?? asset.shadow ?? 0;
    const shadowScale = asset.shadowScale ?? 0.7;
    const shadowOffsetY = asset.shadowOffsetY ?? 24;

    return (
        <div
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
                left: asset.x - width / 2,
                top: asset.y - height / 2,
                width,
                height,
                transform: `rotate(${asset.rotation}deg)`,
                opacity: asset.opacity,
                zIndex: 4,
            }}
            onPointerDown={onPointerDown("move")}
            onPointerMove={onPointerMove}
        >
            {shadowBlur > 0 && shadowOpacity > 0 ? (
                <div
                    className="pointer-events-none absolute left-1/2"
                    style={{
                        width: `${Math.round(shadowScale * 100)}%`,
                        height: Math.max(22, Math.round(height * 0.12)),
                        bottom: -shadowOffsetY,
                        transform: `translateX(-50%) rotate(${-asset.rotation}deg)`,
                        background: `radial-gradient(ellipse at center, rgba(36,26,20,${shadowOpacity}) 0%, rgba(36,26,20,0) 72%)`,
                        filter: `blur(${Math.round(shadowBlur * 0.28)}px)`,
                    }}
                />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt=""
                draggable={false}
                className="relative h-full w-full object-contain"
                style={{
                    filter:
                        shadowBlur > 0
                            ? `drop-shadow(0 ${Math.round(shadowOffsetY * 0.15)}px ${Math.round(shadowBlur * 0.35)}px rgba(36,26,20,${shadowOpacity * 0.45}))`
                            : undefined,
                }}
            />
            <button
                type="button"
                aria-label="Scale visual"
                className="absolute -right-2 -bottom-2 z-10 h-4 w-4 rounded-full border border-[#C8A66A] bg-[#F6EFE3]"
                onPointerDown={onPointerDown("scale")}
            />
            <button
                type="button"
                aria-label="Rotate visual"
                className="absolute top-1/2 -right-2 z-10 h-4 w-4 -translate-y-1/2 rounded-full border border-[#5A4331] bg-white"
                onPointerDown={onPointerDown("rotate")}
            />
        </div>
    );
}
