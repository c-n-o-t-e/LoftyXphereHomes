"use client";

import {
    campaignCta,
    footerBarItems,
    seriesNumber,
} from "@/lib/content-studio/chrome";
import { STUDIO_PALETTE, STUDIO_TOKENS } from "@/lib/content-studio/tokens";
import type { LayoutZone } from "@/lib/content-studio/layouts";
import type { EditorialDocument } from "@/lib/content-studio/types";

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

function FooterGlyph({
    name,
    color,
}: {
    name: "website" | "instagram" | "phone";
    color: string;
}) {
    const common = {
        width: 14,
        height: 14,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: color,
        strokeWidth: 1.7,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };
    if (name === "instagram") {
        return (
            <svg {...common} aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill={color} stroke="none" />
            </svg>
        );
    }
    if (name === "phone") {
        return (
            <svg {...common} aria-hidden>
                <path d="M7 3h4l1.5 4-2 1.5a12 12 0 0 0 5 5L17 12l4 1.5v4c0 1-1 2-2 2A16 16 0 0 1 5 5c0-1 1-2 2-2Z" />
            </svg>
        );
    }
    return (
        <svg {...common} aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
    );
}

export function SeriesBadge({
    document,
    zone,
}: {
    document: EditorialDocument;
    zone: LayoutZone;
}) {
    const theme = document.theme;
    const number = seriesNumber(document.content);
    const kicker = document.content.kicker.trim();
    if (!kicker && !(document.content.seriesNumber ?? "").trim()) return null;

    return (
        <div
            className="pointer-events-none absolute z-[6] flex items-center justify-end gap-3"
            style={{
                left: zone.rect.x,
                top: zone.rect.y,
                width: zone.rect.w,
                height: zone.rect.h,
            }}
        >
            <div style={{ textAlign: "right" }}>
                <div
                    style={{
                        color: theme.textMuted,
                        fontFamily: bodyStack(document),
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                    }}
                >
                    Series
                </div>
                <div
                    style={{
                        color: theme.text,
                        fontFamily: bodyStack(document),
                        fontSize: 13,
                        fontWeight: 500,
                        marginTop: 3,
                    }}
                >
                    {kicker}
                </div>
            </div>
            <div
                style={{
                    width: 56,
                    height: 56,
                    border: `1.5px solid ${theme.gold}`,
                    color: theme.gold,
                    fontFamily: headingStack(document),
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "-0.04em",
                    flexShrink: 0,
                }}
            >
                {number}
            </div>
        </div>
    );
}

export function CtaCluster({
    document,
    zone,
}: {
    document: EditorialDocument;
    zone: LayoutZone;
}) {
    const theme = document.theme;
    const cta = campaignCta(document.content);

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
            <div
                style={{
                    fontFamily: headingStack(document),
                    fontSize: 22,
                    color: theme.text,
                    lineHeight: 1.15,
                }}
            >
                {cta.invitation}
            </div>
            <div
                style={{
                    fontFamily: headingStack(document),
                    fontSize: 30,
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: theme.gold,
                    marginTop: 2,
                    lineHeight: 1,
                }}
            >
                {cta.script}
            </div>
            <div
                style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: theme.gold,
                    color: STUDIO_PALETTE.ivory,
                    fontFamily: bodyStack(document),
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "12px 28px",
                    minWidth: 168,
                }}
            >
                {cta.button}
            </div>
        </div>
    );
}

export function FooterBar({
    document,
    zone,
}: {
    document: EditorialDocument;
    zone: LayoutZone;
}) {
    const items = footerBarItems(document.footer);
    if (items.length === 0) return null;
    const bar = document.theme.id === "dark-editorial" ? "#1A1410" : "#2B211A";
    const ink = STUDIO_PALETTE.ivory;

    return (
        <div
            className="pointer-events-none absolute z-[8] flex items-center justify-center gap-10"
            style={{
                left: zone.rect.x,
                top: zone.rect.y,
                width: zone.rect.w,
                height: zone.rect.h,
                background: bar,
                color: ink,
                fontFamily: bodyStack(document),
                fontSize: 12,
                letterSpacing: "0.04em",
            }}
        >
            {items.map((item) => (
                <span key={item.key} className="inline-flex items-center gap-2">
                    <FooterGlyph name={item.key} color={ink} />
                    {item.label}
                </span>
            ))}
        </div>
    );
}
