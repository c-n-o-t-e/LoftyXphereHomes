"use client";

import type { CSSProperties } from "react";
import { FLYER_BACK_GRID_IMAGE_COUNT } from "@/lib/flyers/constants";
import { getDefaultFlyerAmenityKeys } from "@/lib/amenities/suiteAmenities";
import type { FlyerTemplateDefinition } from "@/lib/flyers/templates";
import type { FlyerImageSlotKey, FlyerPayload } from "@/lib/flyers/types";
import { FlyerAmenityChip } from "@/components/admin/flyers/FlyerPage";
import {
    FlyerFooterContact,
    FlyerGlobeIcon,
} from "@/components/admin/flyers/FlyerContactIcons";

type FlyerBackLayoutsProps = {
    payload: FlyerPayload;
    template: FlyerTemplateDefinition;
    qrDataUrl: string | null;
    amenityLabel: (key: string) => string;
};

function ImageGrid({
    payload,
    columns = 2,
    gridHeight = "32%",
    tight = false,
}: {
    payload: FlyerPayload;
    columns?: number;
    gridHeight?: string;
    tight?: boolean;
}) {
    const slots = payload.gridImageOrder.slice(0, FLYER_BACK_GRID_IMAGE_COUNT);
    const rows = Math.ceil(slots.length / columns);

    return (
        <div
            style={{
                height: gridHeight,
                maxHeight: gridHeight,
                flexShrink: 0,
                marginBottom: tight ? 0 : "0.85em",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                    gap: "0.35em",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
            {slots.map((slotKey) => {
                const slot = payload.images[slotKey as FlyerImageSlotKey];
                const url = slot?.url;
                return (
                    <div
                        key={slotKey}
                        style={{
                            background: "#E8E8E8",
                            overflow: "hidden",
                            position: "relative",
                            minHeight: 0,
                            minWidth: 0,
                        }}
                    >
                        {url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={url}
                                alt={slot?.alt ?? slotKey}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.45em",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "#999",
                                }}
                            >
                                {slot?.label ?? slotKey}
                            </div>
                        )}
                    </div>
                );
            })}
            </div>
        </div>
    );
}

function AmenitiesSection({
    payload,
    template,
    amenityLabel,
    columns = 3,
}: {
    payload: FlyerPayload;
    template: FlyerTemplateDefinition;
    amenityLabel: (key: string) => string;
    columns?: 2 | 3;
}) {
    const amenityKeys = getDefaultFlyerAmenityKeys();

    return (
        <div>
            <h2
                style={{
                    fontFamily: template.displayFont,
                    fontSize: "0.72em",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    margin: "0 0 0.45em",
                    color: payload.theme.textColor,
                }}
            >
                Amenities
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    gap: "0.35em 0.65em",
                    alignItems: "start",
                }}
            >
                {amenityKeys.map((key) => (
                    <FlyerAmenityChip
                        key={key}
                        amenityKey={key}
                        label={amenityLabel(key)}
                        color={payload.theme.textColor}
                    />
                ))}
            </div>
        </div>
    );
}

function PerfectForSection({
    payload,
    template,
}: {
    payload: FlyerPayload;
    template: FlyerTemplateDefinition;
}) {
    return (
        <div>
            <h2
                style={{
                    fontFamily: template.displayFont,
                    fontSize: "0.78em",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    margin: "0 0 0.55em",
                }}
            >
                Perfect For
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45em" }}>
                {payload.perfectFor.map((item) => (
                    <span
                        key={item}
                        style={{
                            fontSize: "0.62em",
                            padding: "0.4em 0.75em",
                            border: `1px solid ${payload.theme.accentColor}`,
                            letterSpacing: "0.06em",
                        }}
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

function FlyerDiscoveryStrip({ payload }: { payload: FlyerPayload }) {
    const line = payload.discoveryLine.trim();
    if (!line) return null;

    const color = payload.theme.textColor;
    const accent = payload.theme.accentColor;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45em",
                flexWrap: "wrap",
                textAlign: "center",
                fontSize: "0.52em",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color,
                marginTop: "1em",
                marginBottom: "1em",
            }}
        >
            <FlyerGlobeIcon color={accent} size="1.1em" />
            <span>
                {line}
                {payload.contact.website ? (
                    <>
                        {" — "}
                        <span style={{ color: accent, fontWeight: 600 }}>
                            {payload.contact.website}
                        </span>
                    </>
                ) : null}
            </span>
        </div>
    );
}

function FlyerFooter({
    payload,
    qrDataUrl,
}: {
    payload: FlyerPayload;
    qrDataUrl: string | null;
}) {
    const hasDiscovery = payload.discoveryLine.trim().length > 0;
    const footerStyle: CSSProperties = {
        borderTop: `1px solid ${payload.theme.accentColor}44`,
        paddingTop: "0.75em",
        marginTop: hasDiscovery ? 0 : "0.75em",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75em",
        fontSize: "0.58em",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    };

    return (
        <div>
            <FlyerDiscoveryStrip payload={payload} />
            <div style={footerStyle}>
                <FlyerFooterContact payload={payload} />
                {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={qrDataUrl}
                        alt="QR"
                        style={{
                            width: "4.5em",
                            height: "4.5em",
                            background: "#FFF",
                            padding: "0.2em",
                            border: `1px solid ${payload.theme.accentColor}`,
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}

function GridAmenitiesBack({ payload, template, qrDataUrl, amenityLabel }: FlyerBackLayoutsProps) {
    return (
        <div
            style={{
                height: "100%",
                padding: "5% 6%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "0.5em",
            }}
        >
            <ImageGrid payload={payload} gridHeight="52%" />
            <AmenitiesSection payload={payload} template={template} amenityLabel={amenityLabel} />
            <PerfectForSection payload={payload} template={template} />
            <div style={{ marginTop: "auto", flexShrink: 0 }}>
                <FlyerFooter payload={payload} qrDataUrl={qrDataUrl} />
            </div>
        </div>
    );
}

function MagazineGridBack({ payload, template, qrDataUrl, amenityLabel }: FlyerBackLayoutsProps) {
    return (
        <div
            style={{
                height: "100%",
                padding: "5%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: "0.75em",
            }}
        >
            <ImageGrid payload={payload} gridHeight="48%" />
            <AmenitiesSection payload={payload} template={template} amenityLabel={amenityLabel} />
            <PerfectForSection payload={payload} template={template} />
            <FlyerFooter payload={payload} qrDataUrl={qrDataUrl} />
        </div>
    );
}

function HotelColumnsBack({ payload, template, qrDataUrl, amenityLabel }: FlyerBackLayoutsProps) {
    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    backgroundColor: "#0A192F",
                    color: "#FFFFFF",
                    padding: "3% 6%",
                    fontSize: "0.52em",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                }}
            >
                Premium Shortlet Experience
            </div>
            <div style={{ padding: "4% 6%", flex: 1, display: "flex", flexDirection: "column", gap: "0.5em" }}>
                <ImageGrid payload={payload} gridHeight="48%" />
                <AmenitiesSection
                    payload={payload}
                    template={template}
                    amenityLabel={amenityLabel}
                    columns={2}
                />
                <PerfectForSection payload={payload} template={template} />
                <div style={{ marginTop: "auto" }}>
                    <FlyerFooter payload={payload} qrDataUrl={qrDataUrl} />
                </div>
            </div>
        </div>
    );
}

export function FlyerBackLayouts(props: FlyerBackLayoutsProps) {
    switch (props.template.backLayout) {
        case "magazine-grid":
            return <MagazineGridBack {...props} />;
        case "hotel-columns":
            return <HotelColumnsBack {...props} />;
        case "grid-amenities":
        default:
            return <GridAmenitiesBack {...props} />;
    }
}
