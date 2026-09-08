"use client";

import type { LayoutDefinition } from "@/lib/content-studio/layouts";

export function LayoutThumbnail({
    layout,
    active,
}: {
    layout: LayoutDefinition;
    active?: boolean;
}) {
    const s = 84 / 1080;
    const ground = active ? "#F6EFE3" : "#F3E9DA";

    return (
        <div
            className="relative shrink-0 overflow-hidden ring-1 ring-black/10"
            style={{ width: 84, height: 105, background: ground }}
            aria-hidden
        >
            {layout.heroBleed ? (
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(180deg, #E7D5B9 0%, #C8A66A 38%, #4C3A2E 100%)",
                    }}
                />
            ) : null}
            {layout.zones.map((zone, index) => {
                const style: React.CSSProperties = {
                    position: "absolute",
                    left: zone.rect.x * s,
                    top: zone.rect.y * s,
                    width: zone.rect.w * s,
                    height: zone.rect.h * s,
                };
                if (zone.type === "asset") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                background: layout.heroBleed
                                    ? "transparent"
                                    : "rgba(200,166,106,0.42)",
                                borderRadius: layout.assetTreatment === "cutout" ? 3 : 1,
                            }}
                        />
                    );
                }
                if (zone.type === "overlay") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                background:
                                    "linear-gradient(to top, rgba(246,239,227,0.95), transparent)",
                            }}
                        />
                    );
                }
                if (zone.type === "text-stack" || zone.type === "title") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                background: layout.heroBleed
                                    ? "rgba(246,239,227,0.55)"
                                    : "rgba(36,26,20,0.72)",
                            }}
                        />
                    );
                }
                if (zone.type === "points") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                background: "rgba(90,67,49,0.12)",
                                boxShadow: "inset 0 1px 0 rgba(200,166,106,0.45)",
                            }}
                        />
                    );
                }
                return null;
            })}
            {layout.showFrame ? (
                <div
                    className="absolute"
                    style={{
                        inset: 4,
                        border: "0.5px solid rgba(200,166,106,0.8)",
                    }}
                />
            ) : null}
        </div>
    );
}
