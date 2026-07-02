"use client";

import type { CSSProperties } from "react";
import type { FlyerTemplateDefinition } from "@/lib/flyers/templates";
import type { FlyerPayload } from "@/lib/flyers/types";
import { FlyerInlineContact } from "@/components/admin/flyers/FlyerContactIcons";

type FlyerFrontLayoutsProps = {
    payload: FlyerPayload;
    template: FlyerTemplateDefinition;
    qrDataUrl: string | null;
    logoPositionStyles: CSSProperties;
    heroOverlayStyle: CSSProperties;
};

function FlyerLogo({
    payload,
    logoPositionStyles,
    contained = false,
}: {
    payload: FlyerPayload;
    logoPositionStyles: CSSProperties;
    contained?: boolean;
}) {
    if (!payload.logo.url) return null;

    const width = `${payload.logo.sizePercent}%`;

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={payload.logo.url}
            alt="Lofty Xphere Homes"
            style={{
                position: contained ? "absolute" : "absolute",
                ...logoPositionStyles,
                width,
                maxWidth: width,
                height: "auto",
                maxHeight: contained ? "18%" : undefined,
                objectFit: "contain",
                zIndex: 4,
                pointerEvents: "none",
            }}
        />
    );
}

function ContactRow({
    payload,
    light = true,
}: {
    payload: FlyerPayload;
    light?: boolean;
}) {
    return <FlyerInlineContact payload={payload} light={light} />;
}

function CtaButton({ payload, onDark = false }: { payload: FlyerPayload; onDark?: boolean }) {
    return (
        <div
            style={{
                display: "inline-block",
                border: `1.5px solid ${payload.theme.accentColor}`,
                color: onDark ? "#FFFFFF" : payload.theme.textColor,
                backgroundColor: onDark ? "rgba(0,0,0,0.25)" : "transparent",
                padding: "0.55em 1.4em",
                fontSize: "0.68em",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 600,
            }}
        >
            {payload.ctaText}
        </div>
    );
}

function QrBlock({
    qrDataUrl,
    payload,
    size = "22%",
}: {
    qrDataUrl: string | null;
    payload: FlyerPayload;
    size?: string;
}) {
    if (!qrDataUrl) {
        return (
            <div
                style={{
                    width: size,
                    aspectRatio: "1",
                    background: "#FFFFFF",
                    border: `2px solid ${payload.theme.accentColor}`,
                }}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={qrDataUrl}
            alt="Scan to book"
            style={{
                width: size,
                aspectRatio: "1",
                objectFit: "contain",
                background: "#FFFFFF",
                padding: "3%",
                border: `2px solid ${payload.theme.accentColor}`,
            }}
        />
    );
}

function HeroDominantFront({
    payload,
    template,
    qrDataUrl,
    logoPositionStyles,
    heroOverlayStyle,
}: FlyerFrontLayoutsProps) {
    const heroUrl = payload.images.hero.url;
    const hasOverlay =
        heroOverlayStyle.background !== "transparent" &&
        heroOverlayStyle.background !== undefined;

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "70%",
                    overflow: "hidden",
                    backgroundColor: "#f3f3f3",
                }}
            >
                {heroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroUrl}
                        alt={payload.images.hero.alt ?? "Luxury apartment"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background:
                                "linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 50%, #e8e8e8 100%)",
                        }}
                    />
                )}

                {hasOverlay ? (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            ...heroOverlayStyle,
                            pointerEvents: "none",
                        }}
                    />
                ) : null}

                <FlyerLogo
                    payload={payload}
                    logoPositionStyles={logoPositionStyles}
                    contained
                />
            </div>

            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "30%",
                    backgroundColor: payload.theme.backgroundColor,
                    padding: "3.5% 7%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    color: payload.theme.textColor,
                }}
            >
                <div>
                    <div
                        style={{
                            width: "2.5em",
                            height: "2px",
                            backgroundColor: payload.theme.accentColor,
                            marginBottom: "0.45em",
                        }}
                    />
                    <h1
                        style={{
                            fontFamily: template.displayFont,
                            fontSize: "0.88em",
                            fontWeight: 600,
                            lineHeight: 1.15,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            margin: 0,
                        }}
                    >
                        {payload.headline}
                    </h1>
                    <p
                        style={{
                            marginTop: "0.4em",
                            fontSize: "0.58em",
                            lineHeight: 1.45,
                            whiteSpace: "pre-line",
                            opacity: 0.88,
                            fontWeight: 300,
                        }}
                    >
                        {payload.subheadline}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "4%",
                    }}
                >
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: "0.45em" }}>
                            <CtaButton payload={payload} />
                        </div>
                        <ContactRow payload={payload} light={false} />
                    </div>
                    <QrBlock qrDataUrl={qrDataUrl} payload={payload} size="26%" />
                </div>
            </div>
        </>
    );
}

function SplitFront({
    payload,
    template,
    qrDataUrl,
    logoPositionStyles,
    heroOverlayStyle,
}: FlyerFrontLayoutsProps) {
    const heroUrl = payload.images.hero.url;

    return (
        <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "58%", position: "relative", background: "#111" }}>
                {heroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : null}
                <div style={{ position: "absolute", inset: 0, ...heroOverlayStyle }} />
                <FlyerLogo payload={payload} logoPositionStyles={logoPositionStyles} />
            </div>
            <div
                style={{
                    width: "42%",
                    padding: "8% 6%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                }}
            >
                <div>
                    <div
                        style={{
                            width: "2em",
                            height: "2px",
                            backgroundColor: payload.theme.accentColor,
                            marginBottom: "1em",
                        }}
                    />
                    <h1
                        style={{
                            fontFamily: template.displayFont,
                            fontSize: "0.82em",
                            fontWeight: 700,
                            lineHeight: 1.2,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            margin: 0,
                        }}
                    >
                        {payload.headline}
                    </h1>
                    <p
                        style={{
                            marginTop: "1em",
                            fontSize: "0.55em",
                            lineHeight: 1.6,
                            whiteSpace: "pre-line",
                            opacity: 0.85,
                        }}
                    >
                        {payload.subheadline}
                    </p>
                </div>
                <div>
                    <div style={{ marginBottom: "1em" }}>
                        <CtaButton payload={payload} />
                    </div>
                    <ContactRow payload={payload} light={false} />
                    <div style={{ marginTop: "1em" }}>
                        <QrBlock qrDataUrl={qrDataUrl} payload={payload} size="38%" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditorialFront({
    payload,
    template,
    qrDataUrl,
    logoPositionStyles,
    heroOverlayStyle,
}: FlyerFrontLayoutsProps) {
    const heroUrl = payload.images.hero.url;

    return (
        <>
            <div style={{ height: "62%", position: "relative" }}>
                {heroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#222" }} />
                )}
                <div style={{ position: "absolute", inset: 0, ...heroOverlayStyle }} />
                <FlyerLogo payload={payload} logoPositionStyles={logoPositionStyles} />
            </div>
            <div style={{ padding: "6% 8% 5%", position: "relative" }}>
                <p
                    style={{
                        fontSize: "0.5em",
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: payload.theme.accentColor,
                        margin: "0 0 0.6em",
                    }}
                >
                    Lofty Xphere Homes
                </p>
                <h1
                    style={{
                        fontFamily: template.displayFont,
                        fontSize: "1.1em",
                        fontWeight: 500,
                        lineHeight: 1.1,
                        margin: 0,
                        maxWidth: "90%",
                    }}
                >
                    {payload.headline}
                </h1>
                <p
                    style={{
                        marginTop: "0.8em",
                        fontSize: "0.58em",
                        lineHeight: 1.55,
                        whiteSpace: "pre-line",
                        opacity: 0.8,
                    }}
                >
                    {payload.subheadline}
                </p>
                <div
                    style={{
                        marginTop: "1.2em",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "5%",
                    }}
                >
                    <div>
                        <CtaButton payload={payload} />
                        <div style={{ marginTop: "0.8em" }}>
                            <ContactRow payload={payload} light={false} />
                        </div>
                    </div>
                    <QrBlock qrDataUrl={qrDataUrl} payload={payload} size="24%" />
                </div>
            </div>
        </>
    );
}

function CorporateFront({
    payload,
    template,
    qrDataUrl,
    logoPositionStyles,
    heroOverlayStyle,
}: FlyerFrontLayoutsProps) {
    const heroUrl = payload.images.hero.url;

    return (
        <>
            <div
                style={{
                    backgroundColor: "#0A192F",
                    color: "#FFFFFF",
                    padding: "5% 7% 3%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ position: "relative" }}>
                    <FlyerLogo
                        payload={{
                            ...payload,
                            logo: { ...payload.logo, position: "top-left" },
                        }}
                        logoPositionStyles={{ position: "relative", top: 0, left: 0, width: "8em" }}
                    />
                </div>
                <span style={{ fontSize: "0.5em", letterSpacing: "0.15em", opacity: 0.7 }}>
                    {payload.location}
                </span>
            </div>
            <div style={{ height: "48%", position: "relative" }}>
                {heroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={heroUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : null}
                <div style={{ position: "absolute", inset: 0, ...heroOverlayStyle }} />
            </div>
            <div style={{ padding: "5% 7%", display: "grid", gridTemplateColumns: "1fr auto", gap: "5%" }}>
                <div>
                    <h1
                        style={{
                            fontFamily: template.displayFont,
                            fontSize: "0.78em",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            margin: 0,
                            lineHeight: 1.25,
                        }}
                    >
                        {payload.headline}
                    </h1>
                    <p
                        style={{
                            marginTop: "0.6em",
                            fontSize: "0.55em",
                            lineHeight: 1.5,
                            whiteSpace: "pre-line",
                            opacity: 0.85,
                        }}
                    >
                        {payload.subheadline}
                    </p>
                    <div style={{ marginTop: "0.8em" }}>
                        <CtaButton payload={payload} />
                    </div>
                    <div style={{ marginTop: "0.8em" }}>
                        <ContactRow payload={payload} light={false} />
                    </div>
                </div>
                <QrBlock qrDataUrl={qrDataUrl} payload={payload} size="28%" />
            </div>
        </>
    );
}

export function FlyerFrontLayouts(props: FlyerFrontLayoutsProps) {
    switch (props.template.frontLayout) {
        case "split":
            return <SplitFront {...props} />;
        case "editorial":
            return <EditorialFront {...props} />;
        case "corporate":
            return <CorporateFront {...props} />;
        case "hero-dominant":
        default:
            return <HeroDominantFront {...props} />;
    }
}
