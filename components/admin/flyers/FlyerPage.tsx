"use client";

import type { CSSProperties } from "react";
import { getFlyerDimensions } from "@/lib/flyers/dimensions";
import { FlyerAmenityIcon } from "@/components/admin/flyers/FlyerAmenityIcon";
import { getFlyerTemplate } from "@/lib/flyers/templates";
import type {
    FlyerPageSize,
    FlyerPayload,
    FlyerSide,
    FlyerTemplateKey,
} from "@/lib/flyers/types";
import {
    getAmenityLabel,
    getFlyerFontsForRender,
    getFlyerPageStyle,
    getHeroOverlayStyle,
    logoPositionStyles,
} from "@/components/admin/flyers/flyerStyles";
import { FlyerFrontLayouts } from "@/components/admin/flyers/layouts/FlyerFrontLayouts";
import { FlyerBackLayouts } from "@/components/admin/flyers/layouts/FlyerBackLayouts";

type FlyerPageProps = {
    side: FlyerSide;
    payload: FlyerPayload;
    templateKey: FlyerTemplateKey;
    pageSize: FlyerPageSize;
    qrDataUrl: string | null;
    forExport?: boolean;
    className?: string;
};

export function FlyerPage({
    side,
    payload,
    templateKey,
    pageSize,
    qrDataUrl,
    forExport = false,
    className,
}: FlyerPageProps) {
    const template = getFlyerTemplate(templateKey);
    const fonts = getFlyerFontsForRender(templateKey, forExport);
    const renderTemplate = { ...template, ...fonts };
    const dims = getFlyerDimensions(pageSize);
    const pageStyle = getFlyerPageStyle({ pageSize, payload, templateKey, forExport });

    return (
        <div
            className={className}
            data-flyer-page={side}
            data-flyer-export={forExport ? "true" : "false"}
            style={pageStyle}
        >
            {forExport ? (
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&display=swap" />
            ) : null}

            {side === "front" ? (
                <FlyerFrontLayouts
                    payload={payload}
                    template={renderTemplate}
                    qrDataUrl={qrDataUrl}
                    logoPositionStyles={logoPositionStyles(payload.logo.position)}
                    heroOverlayStyle={getHeroOverlayStyle(template.heroOverlay)}
                />
            ) : (
                <FlyerBackLayouts
                    payload={payload}
                    template={renderTemplate}
                    qrDataUrl={qrDataUrl}
                    amenityLabel={getAmenityLabel}
                />
            )}

            {forExport ? (
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        boxShadow: `inset 0 0 0 ${dims.bleedPx}px transparent`,
                    }}
                />
            ) : null}
        </div>
    );
}

export function FlyerAmenityChip({
    label,
    amenityKey,
    color,
}: {
    label: string;
    amenityKey?: string;
    color?: string;
    icon?: string;
    accentColor?: string;
    style?: "check" | "dot";
}) {
    const chipStyle: CSSProperties = {
        display: "inline-flex",
        alignItems: "flex-start",
        gap: "0.35em",
        fontSize: "0.58em",
        letterSpacing: "0.02em",
        lineHeight: 1.25,
        minWidth: 0,
        color: color ?? "inherit",
    };

    return (
        <span style={chipStyle}>
            <FlyerAmenityIcon amenityKey={amenityKey} size="0.95em" />
            <span style={{ minWidth: 0 }}>{label}</span>
        </span>
    );
}

export { FLYER_AMENITY_OPTIONS } from "@/lib/flyers/constants";
