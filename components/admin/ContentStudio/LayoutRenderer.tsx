"use client";

import { logoSrc } from "@/lib/content-studio/brand-theme";
import { composeTextStack } from "@/lib/content-studio/fit-typography";
import { getLayout, type LayoutZone } from "@/lib/content-studio/layouts";
import { STUDIO_TOKENS } from "@/lib/content-studio/tokens";
import type { EditorialDocument, StudioIconKey } from "@/lib/content-studio/types";
import { DraggableAsset } from "@/components/admin/ContentStudio/DraggableAsset";
import { StudioIcon } from "@/components/admin/ContentStudio/StudioIcons";

function headingStack(document: EditorialDocument) {
    return document.fonts.heading === "Cormorant Garamond"
        ? '"Cormorant Garamond", "Times New Roman", serif'
        : STUDIO_TOKENS.type.display;
}

function bodyStack(document: EditorialDocument) {
    return document.fonts.body === "Manrope"
        ? '"Manrope", "Helvetica Neue", sans-serif'
        : STUDIO_TOKENS.type.sans;
}

function textAlign(zone: LayoutZone): "left" | "center" | "right" {
    return zone.align ?? "left";
}

function FooterCopy({ document }: { document: EditorialDocument }) {
    const { footer } = document;
    if (footer.variant === "logo-only") return null;
    if (footer.variant === "website-only") return <>{footer.website}</>;
    if (footer.variant === "full") {
        return (
            <>
                {footer.instagram}
                <span className="mx-2 opacity-40">·</span>
                {footer.whatsapp}
                <span className="mx-2 opacity-40">·</span>
                {footer.website}
            </>
        );
    }
    return (
        <>
            {footer.instagram}
            <span className="mx-2 opacity-40">·</span>
            {footer.website}
        </>
    );
}

function TextStack({
    document,
    zone,
}: {
    document: EditorialDocument;
    zone: LayoutZone;
}) {
    const items = composeTextStack(document, zone);
    const theme = document.theme;
    const align = textAlign(zone);

    return (
        <div
            className="pointer-events-none absolute z-[6]"
            style={{
                left: zone.rect.x,
                top: zone.rect.y,
                width: zone.rect.w,
                height: zone.rect.h,
            }}
        >
            {items.map((item, index) => {
                if (item.type === "kicker") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                color: theme.accent,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.kickerSize,
                                fontWeight: 600,
                                letterSpacing: "0.28em",
                                textTransform: "uppercase",
                                textAlign: align,
                                lineHeight: 1.3,
                            }}
                        >
                            {item.text}
                        </div>
                    );
                }
                if (item.type === "title") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                color: theme.text,
                                fontFamily: headingStack(document),
                                fontSize: item.fontSize,
                                fontWeight: document.typography.titleWeight,
                                letterSpacing: `${document.typography.titleTracking}em`,
                                lineHeight: document.typography.titleLineHeight,
                                textAlign: align,
                                whiteSpace: "pre-wrap",
                                textTransform: item.uppercase ? "uppercase" : "none",
                            }}
                        >
                            {item.text}
                        </div>
                    );
                }
                if (item.type === "rule") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                height: item.h,
                                background: theme.gold,
                                opacity: 0.85,
                            }}
                        />
                    );
                }
                if (item.type === "subtitle") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                color: theme.textMuted,
                                fontFamily: headingStack(document),
                                fontSize: document.typography.bodySize + 2,
                                fontWeight: 500,
                                fontStyle: "italic",
                                lineHeight: 1.35,
                                textAlign: align,
                            }}
                        >
                            {item.text}
                        </div>
                    );
                }
                if (item.type === "body") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.bodySize,
                                fontWeight: 400,
                                lineHeight: 1.48,
                                textAlign: align,
                            }}
                        >
                            {item.text}
                        </div>
                    );
                }
                if (item.type === "cta") {
                    return (
                        <div
                            key={`${item.type}-${index}`}
                            style={{
                                position: "absolute",
                                left: item.x - zone.rect.x,
                                top: item.y - zone.rect.y,
                                width: item.w,
                                color: theme.accent,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.ctaSize,
                                fontWeight: 500,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                textAlign: align,
                            }}
                        >
                            {item.text}
                            <div
                                style={{
                                    width: 48,
                                    height: 1,
                                    marginTop: 10,
                                    marginLeft: align === "center" ? "auto" : 0,
                                    marginRight: align === "center" ? "auto" : align === "right" ? 0 : undefined,
                                    background: theme.gold,
                                    opacity: 0.7,
                                }}
                            />
                        </div>
                    );
                }
                return (
                    <div
                        key={`${item.type}-${index}`}
                        style={{
                            position: "absolute",
                            left: item.x - zone.rect.x,
                            top: item.y - zone.rect.y,
                            width: item.w,
                            height: item.h,
                            border: `1px solid ${theme.gold}`,
                            transform: "rotate(45deg)",
                            opacity: 0.8,
                        }}
                    />
                );
            })}
        </div>
    );
}

function PointsBlock({
    document,
    zone,
}: {
    document: EditorialDocument;
    zone: LayoutZone;
}) {
    const layout = getLayout(document.layoutId);
    const theme = document.theme;
    const points = document.content.points.filter(
        (point) => point.heading.trim() || point.body.trim(),
    );
    const columns = zone.columns ?? (layout.pointsStyle === "grid" ? 2 : 1);
    const isGrid = layout.pointsStyle === "grid" || columns > 1;

    return (
        <div
            className="pointer-events-none absolute z-[6]"
            style={{
                left: zone.rect.x,
                top: zone.rect.y,
                width: zone.rect.w,
                height: zone.rect.h,
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                columnGap: isGrid ? 48 : 0,
                rowGap: isGrid ? 0 : 8,
                alignContent: "start",
            }}
        >
            {points.map((point, index) => (
                <div
                    key={point.id}
                    style={{
                        display: "grid",
                        gridTemplateColumns: isGrid ? "72px 28px 1fr" : "92px 1fr",
                        gap: isGrid ? 14 : 18,
                        paddingTop: 22,
                        paddingBottom: 22,
                        paddingRight: isGrid && index % 2 === 0 ? 12 : 0,
                        paddingLeft: isGrid && index % 2 === 1 ? 12 : 0,
                        borderTop: `1px solid ${theme.gold}33`,
                        borderRight:
                            isGrid && index % 2 === 0 ? `1px solid ${theme.gold}22` : "none",
                    }}
                >
                    <div
                        style={{
                            color: theme.gold,
                            fontFamily: headingStack(document),
                            fontSize: isGrid ? 32 : 42,
                            lineHeight: 1,
                            letterSpacing: "-0.04em",
                            paddingTop: 2,
                        }}
                    >
                        {point.number}
                    </div>
                    {isGrid ? (
                        <div className="pt-1">
                            <StudioIcon
                                name={point.icon as StudioIconKey}
                                color={theme.gold}
                                size={18}
                            />
                        </div>
                    ) : null}
                    <div className="min-w-0">
                        <div
                            style={{
                                color: theme.text,
                                fontFamily: bodyStack(document),
                                fontSize: isGrid ? 15 : 16,
                                fontWeight: 600,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                            }}
                        >
                            {point.heading}
                        </div>
                        <div
                            style={{
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: isGrid ? 15 : 16,
                                lineHeight: 1.45,
                                marginTop: 8,
                            }}
                        >
                            {point.body}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function LayoutRenderer({
    document,
    previewScale,
    onAssetChange,
}: {
    document: EditorialDocument;
    previewScale: number;
    onAssetChange: (patch: Partial<EditorialDocument["asset"]>) => void;
}) {
    const layout = getLayout(document.layoutId);
    const theme = document.theme;

    return (
        <div
            className="relative overflow-hidden"
            style={{
                width: 1080,
                height: 1350,
                background: theme.background,
                color: theme.text,
            }}
        >
            <DraggableAsset
                document={document}
                scale={previewScale}
                onChange={onAssetChange}
            />

            {layout.zones.map((zone, index) => {
                const style: React.CSSProperties = {
                    position: "absolute",
                    left: zone.rect.x,
                    top: zone.rect.y,
                    width: zone.rect.w,
                    height: zone.rect.h,
                    textAlign: textAlign(zone),
                    zIndex: zone.type === "overlay" ? 2 : 6,
                };

                if (zone.type === "asset") return null;

                if (zone.type === "overlay") {
                    if (layout.overlayStyle === "gradient") {
                        return (
                            <div
                                key={`${zone.type}-${index}`}
                                className="pointer-events-none"
                                style={{
                                    ...style,
                                    background: `linear-gradient(to top, ${theme.background} 8%, ${theme.overlay} 46%, transparent 100%)`,
                                }}
                            />
                        );
                    }
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            className="pointer-events-none"
                            style={{
                                ...style,
                                background: theme.overlay,
                                opacity: zone.opacity ?? 0.86,
                            }}
                        />
                    );
                }

                if (zone.type === "text-stack") {
                    return (
                        <TextStack
                            key={`${zone.type}-${index}`}
                            document={document}
                            zone={zone}
                        />
                    );
                }

                if (zone.type === "points") {
                    return (
                        <PointsBlock
                            key={`${zone.type}-${index}`}
                            document={document}
                            zone={zone}
                        />
                    );
                }

                if (zone.type === "cta") {
                    if (!layout.showCta || !document.content.cta) return null;
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            className="pointer-events-none"
                            style={{
                                ...style,
                                color: theme.accent,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.ctaSize,
                                fontWeight: 500,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    zone.align === "center"
                                        ? "center"
                                        : zone.align === "right"
                                          ? "flex-end"
                                          : "flex-start",
                            }}
                        >
                            {document.content.cta}
                        </div>
                    );
                }

                if (zone.type === "logo") {
                    const src = logoSrc(document.logo.variant);
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            className="pointer-events-none"
                            style={{
                                ...style,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    zone.align === "center"
                                        ? "center"
                                        : zone.align === "right"
                                          ? "flex-end"
                                          : "flex-start",
                                opacity: document.logo.opacity,
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={src}
                                alt=""
                                style={{
                                    width: document.logo.size,
                                    height: "auto",
                                    filter:
                                        document.logo.variant === "gold"
                                            ? "brightness(0) saturate(100%) invert(72%) sepia(28%) saturate(620%) hue-rotate(6deg)"
                                            : undefined,
                                }}
                            />
                        </div>
                    );
                }

                if (zone.type === "footer") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            className="pointer-events-none"
                            style={{
                                ...style,
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: 13,
                                fontWeight: 500,
                                letterSpacing: "0.06em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                    zone.align === "center"
                                        ? "center"
                                        : zone.align === "right"
                                          ? "flex-end"
                                          : "flex-start",
                            }}
                        >
                            <FooterCopy document={document} />
                        </div>
                    );
                }

                return null;
            })}

            {layout.showFrame ? (
                <div
                    className="pointer-events-none absolute z-10"
                    style={{
                        inset: STUDIO_TOKENS.frame.inset,
                        border: `${STUDIO_TOKENS.frame.thickness}px solid ${theme.border}`,
                        opacity: 0.72,
                    }}
                />
            ) : null}

            {layout.showVignette ? (
                <div
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, rgba(36,26,20,0) 42%, rgba(36,26,20,0.28) 100%)",
                    }}
                />
            ) : null}

            {layout.showGrain ? (
                <div
                    className="pointer-events-none absolute inset-0 z-20 opacity-[0.11] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.55'/></svg>\")",
                    }}
                />
            ) : null}
        </div>
    );
}
