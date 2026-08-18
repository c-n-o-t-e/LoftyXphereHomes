"use client";

import { useRef } from "react";
import type { StudioAssetTransform } from "@/lib/content-studio/types";

type DragMode = "move" | "scale" | "rotate";

export function DraggableAsset({
    asset,
    scale,
    onChange,
}: {
    asset: StudioAssetTransform;
    scale: number;
    onChange: (patch: Partial<StudioAssetTransform>) => void;
}) {
    const modeRef = useRef<DragMode>("move");
    const startRef = useRef({
        x: 0,
        y: 0,
        assetX: 0,
        assetY: 0,
        assetScale: 1,
        assetRotation: 0,
    });

    if (!asset.url) return null;

    const width = asset.width * asset.scale;
    const height = asset.height * asset.scale;

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

    return (
        <div
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
                left: asset.x - width / 2,
                top: asset.y - height / 2,
                width,
                height,
                transform: `rotate(${asset.rotation}deg)`,
                filter:
                    asset.shadow > 0
                        ? `drop-shadow(0 ${Math.round(asset.shadow * 0.35)}px ${asset.shadow}px rgba(36,26,20,0.20))`
                        : undefined,
            }}
            onPointerDown={onPointerDown("move")}
            onPointerMove={onPointerMove}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={asset.url}
                alt=""
                draggable={false}
                className="h-full w-full object-contain"
            />
            <button
                type="button"
                aria-label="Scale visual"
                className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full border border-[#C8A66A] bg-[#F6EFE3]"
                onPointerDown={onPointerDown("scale")}
            />
            <button
                type="button"
                aria-label="Rotate visual"
                className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rounded-full border border-[#5B4636] bg-white"
                onPointerDown={onPointerDown("rotate")}
            />
        </div>
    );
}
