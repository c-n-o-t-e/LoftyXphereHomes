"use client";

import { logoSrc } from "@/lib/content-studio/brand-theme";
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
                <span className="mx-2 opacity-50">·</span>
                {footer.whatsapp}
                <span className="mx-2 opacity-50">·</span>
                {footer.website}
            </>
        );
    }
    return (
        <>
            {footer.instagram}
            <span className="mx-2 opacity-50">·</span>
            {footer.website}
        </>
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
            {layout.showFrame ? (
                <div
                    className="pointer-events-none absolute"
                    style={{
                        inset: STUDIO_TOKENS.frame.inset,
                        border: `${STUDIO_TOKENS.frame.thickness}px solid ${theme.border}`,
                    }}
                />
            ) : null}

            {layout.zones.map((zone, index) => {
                const style: React.CSSProperties = {
                    position: "absolute",
                    left: zone.rect.x,
                    top: zone.rect.y,
                    width: zone.rect.w,
                    height: zone.rect.h,
                    textAlign: textAlign(zone),
                };

                if (zone.type === "overlay") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                background: theme.overlay,
                                opacity: zone.opacity ?? 0.86,
                            }}
                        />
                    );
                }

                if (zone.type === "asset") {
                    return (
                        <div key={`${zone.type}-${index}`} style={style} className="pointer-events-none" />
                    );
                }

                if (zone.type === "kicker") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                color: theme.accent,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.kickerSize,
                                fontWeight: 600,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                lineHeight: 1.3,
                            }}
                        >
                            {document.content.kicker}
                        </div>
                    );
                }

                if (zone.type === "title") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                color: theme.text,
                                fontFamily: headingStack(document),
                                fontSize: document.typography.titleSize,
                                fontWeight: document.typography.titleWeight,
                                letterSpacing: `${document.typography.titleTracking}em`,
                                lineHeight: document.typography.titleLineHeight,
                            }}
                        >
                            {document.content.title}
                        </div>
                    );
                }

                if (zone.type === "subtitle") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.bodySize,
                                fontWeight: 500,
                                lineHeight: 1.4,
                            }}
                        >
                            {document.content.subtitle}
                        </div>
                    );
                }

                if (zone.type === "body") {
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.bodySize,
                                fontWeight: 400,
                                lineHeight: 1.45,
                            }}
                        >
                            {document.content.body}
                        </div>
                    );
                }

                if (zone.type === "cta") {
                    if (!document.content.cta) return null;
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                color: theme.accent,
                                fontFamily: bodyStack(document),
                                fontSize: document.typography.ctaSize,
                                fontWeight: 500,
                                letterSpacing: "0.16em",
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

                if (zone.type === "points") {
                    const points = document.content.points.filter(
                        (point) => point.heading.trim() || point.body.trim(),
                    );
                    return (
                        <div
                            key={`${zone.type}-${index}`}
                            style={{
                                ...style,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            {points.map((point) => (
                                <div key={point.id} className="flex gap-5">
                                    <div
                                        style={{
                                            color: theme.gold,
                                            fontFamily: headingStack(document),
                                            fontSize: 22,
                                            width: 56,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {point.number}
                                    </div>
                                    <div className="pt-0.5">
                                        <StudioIcon
                                            name={point.icon as StudioIconKey}
                                            color={theme.gold}
                                            size={22}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div
                                            style={{
                                                color: theme.text,
                                                fontFamily: bodyStack(document),
                                                fontSize: 18,
                                                fontWeight: 600,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {point.heading}
                                        </div>
                                        <div
                                            style={{
                                                color: theme.textMuted,
                                                fontFamily: bodyStack(document),
                                                fontSize: 16,
                                                lineHeight: 1.4,
                                                marginTop: 6,
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

                if (zone.type === "logo") {
                    const src = logoSrc(document.logo.variant);
                    return (
                        <div
                            key={`${zone.type}-${index}`}
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
                            style={{
                                ...style,
                                color: theme.textMuted,
                                fontFamily: bodyStack(document),
                                fontSize: 15,
                                fontWeight: 500,
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

            <DraggableAsset
                asset={document.asset}
                scale={previewScale}
                onChange={onAssetChange}
            />
        </div>
    );
}
