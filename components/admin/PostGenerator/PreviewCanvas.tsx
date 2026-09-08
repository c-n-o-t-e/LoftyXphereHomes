"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
    POST_CANVAS_HEIGHT,
    POST_CANVAS_WIDTH,
    resolvePostLayoutVariant,
    type PostDocument,
} from "@/lib/post-generator/types";
import { ImageCanvas } from "@/components/admin/PostGenerator/ImageCanvas";
import {
    PostAmenityIcon,
    PostContactIcon,
    bodyFontFamily,
    headingFontFamily,
} from "@/components/admin/PostGenerator/icons";
import {
    DEFAULT_AMENITIES_STYLE,
    DEFAULT_CONTACT_STYLE,
} from "@/lib/post-generator/defaults";
import { splitAmenityLabelLines } from "@/lib/post-generator/amenityLabel";
import { goldDivider, POST_TOKENS } from "@/lib/post-generator/tokens";
import { GalleryAtelierCanvas } from "@/components/admin/PostGenerator/GalleryAtelierCanvas";

type PreviewCanvasProps = {
    document: PostDocument;
    /** When true, disable hover animations for export fidelity. */
    exportMode?: boolean;
    className?: string;
};

function hexWithAlpha(hex: string, alpha: number): string {
    if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
    const cleaned = hex.replace("#", "");
    const full =
        cleaned.length === 3
            ? cleaned
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : cleaned.padEnd(6, "0").slice(0, 6);
    const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${full}${a}`;
}

export function PreviewCanvas({
    document: doc,
    exportMode = false,
    className,
}: PreviewCanvasProps) {
    if (resolvePostLayoutVariant(doc.layout) === "gallery-atelier") {
        return <GalleryAtelierCanvas document={doc} className={className} />;
    }

    const { layout, overlay, theme, fonts, headline, description, button, logo } =
        doc;
    const amenitiesStyle = {
        ...DEFAULT_AMENITIES_STYLE,
        ...(doc.amenitiesStyle ?? {}),
    };
    const contactStyle = {
        ...DEFAULT_CONTACT_STYLE,
        ...(doc.contactStyle ?? {}),
    };
    const footerIconColor = contactStyle.iconColor || theme.icon;
    const footerTextColor = contactStyle.textColor || theme.icon;
    const visibleAmenities = doc.amenities.filter((a) => a.visible);
    const visibleContacts = doc.contact.filter((c) => c.visible);

    const logoUrl =
        logo.variant === "light"
            ? logo.lightUrl ?? logo.url
            : logo.variant === "dark"
              ? logo.darkUrl ?? logo.url
              : logo.url;

    const logoPositionStyle = (() => {
        const pad = logo.padding;
        switch (logo.position) {
            case "top-center":
                return { top: pad, left: "50%", transform: "translateX(-50%)" };
            case "top-right":
                return { top: pad, right: pad };
            case "bottom-left":
                return { bottom: pad, left: pad };
            case "bottom-right":
                return { bottom: pad, right: pad };
            default:
                return { top: pad, left: pad };
        }
    })();

    const cardInset = Math.max(0, overlay.cardInsetX ?? POST_TOKENS.glass.cardInsetX);
    const footerGap = Math.max(0, overlay.footerGap ?? POST_TOKENS.spacing.footerGap);
    const cardOffsetY = overlay.cardOffsetY ?? POST_TOKENS.glass.cardOffsetY;
    const photoFade = Math.min(40, Math.max(0, overlay.photoFadePercent ?? 14));
    const footerBandH =
        56 + contactStyle.iconSize + contactStyle.paddingY * 2 + 12;

    const cardTopPercent = overlay.photoHeightPercent - overlay.overlapPercent;
    const divider = theme.divider?.startsWith("rgba")
        ? theme.divider
        : goldDivider(0.18);

    const glassBg = overlay.glassEffect
        ? hexWithAlpha(
              overlay.backgroundColor?.startsWith("#")
                  ? overlay.backgroundColor
                  : POST_TOKENS.colors.white,
              overlay.opacity,
          )
        : overlay.backgroundColor || theme.background;

    const glassBorder =
        overlay.borderThickness > 0
            ? `${overlay.borderThickness}px solid ${
                  overlay.borderColor?.startsWith("rgba") ||
                  overlay.borderColor?.startsWith("rgb")
                      ? overlay.borderColor
                      : overlay.borderColor || POST_TOKENS.colors.glassBorder
              }`
            : undefined;

    // Soft mask: photo fully visible until (100 - fade)%, then fades to transparent
    const fadeStart = Math.max(0, 100 - photoFade);
    const photoMask = `linear-gradient(to bottom, #000 0%, #000 ${fadeStart}%, transparent 100%)`;
    /** Single luxury border inset — drawn over hero + editorial, not around a padded stage. */
    const borderInset = Math.max(16, layout.outerPadding || POST_TOKENS.frame.borderInset);

    return (
        <div
            className={className}
            style={{
                width: POST_CANVAS_WIDTH,
                height: POST_CANVAS_HEIGHT,
                position: "relative",
                background: theme.background,
                overflow: "hidden",
                fontFamily: bodyFontFamily(fonts.body),
            }}
            data-post-canvas
        >
            {/*
              Hero apartment photo — full-bleed background of the upper canvas.
              Touches left/right edges; no cream margin / no framed image card.
            */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${overlay.photoHeightPercent}%`,
                    zIndex: 1,
                    WebkitMaskImage: photoMask,
                    maskImage: photoMask,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                }}
            >
                <ImageCanvas
                    image={doc.image}
                    style={{
                        position: "absolute",
                        inset: 0,
                    }}
                />
            </div>

            {/* Soft ivory dissolve under the hero (layered with mask) */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${Math.max(0, overlay.photoHeightPercent - photoFade - 2)}%`,
                    height: `${Math.max(photoFade, 10) + 8}%`,
                    background: `linear-gradient(to bottom, transparent 0%, ${hexWithAlpha(theme.background, 0.25)} 40%, ${theme.background} 100%)`,
                    zIndex: 2,
                    pointerEvents: "none",
                }}
            />

            {/* Logo on the hero */}
            {(logoUrl || logo.showWordmark) && (
                <div
                    style={{
                        position: "absolute",
                        zIndex: 6,
                        opacity: logo.opacity,
                        display: "flex",
                        flexDirection: "column",
                        alignItems:
                            logo.position === "top-center" ? "center" : "flex-start",
                        gap: 6,
                        ...logoPositionStyle,
                    }}
                >
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt="Lofty Xphere Homes"
                            style={{
                                width: logo.size,
                                height: "auto",
                                objectFit: "contain",
                                filter:
                                    logo.variant === "light"
                                        ? "brightness(0) saturate(100%) invert(72%) sepia(22%) saturate(550%) hue-rotate(5deg) brightness(95%)"
                                        : undefined,
                            }}
                        />
                    ) : null}
                    {logo.showWordmark ? (
                        <span
                            style={{
                                color:
                                    logo.variant === "dark"
                                        ? theme.text
                                        : theme.gold || theme.icon,
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                textShadow:
                                    logo.variant === "light"
                                        ? "0 1px 8px rgba(0,0,0,0.35)"
                                        : undefined,
                                lineHeight: 1.25,
                                textAlign:
                                    logo.position === "top-center" ? "center" : "left",
                                maxWidth: 140,
                            }}
                        >
                            {logo.wordmark}
                        </span>
                    ) : null}
                </div>
            )}

            {/*
              Editorial stack: glass card (headline + CTA + amenities) + contact footer.
            */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `calc(${cardTopPercent}% + ${cardOffsetY}px)`,
                    bottom: 0,
                    zIndex: 4,
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: cardInset,
                    paddingRight: cardInset,
                    boxSizing: "border-box",
                }}
            >
                {/* Glassmorphism card — overlaps hero fade intentionally */}
                <div
                    style={{
                        flexShrink: 0,
                        background: glassBg,
                        backdropFilter: overlay.glassEffect
                            ? `blur(${Math.max(overlay.blur, 12)}px) saturate(1.15)`
                            : overlay.blur > 0
                              ? `blur(${overlay.blur}px)`
                              : undefined,
                        WebkitBackdropFilter: overlay.glassEffect
                            ? `blur(${Math.max(overlay.blur, 12)}px) saturate(1.15)`
                            : undefined,
                        borderRadius: overlay.borderRadius,
                        border: glassBorder,
                        boxShadow:
                            overlay.shadow > 0
                                ? `0 ${Math.max(4, overlay.shadow / 3)}px ${overlay.shadow * 1.4}px ${POST_TOKENS.colors.shadow}`
                                : undefined,
                        padding: `${layout.contentPaddingTop}px ${layout.contentPaddingX}px ${layout.contentPaddingBottom}px`,
                        boxSizing: "border-box",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontFamily: headingFontFamily(fonts.heading),
                            fontSize: headline.fontSize,
                            fontWeight: headline.fontWeight,
                            letterSpacing: headline.letterSpacing,
                            lineHeight: headline.lineHeight,
                            textAlign: headline.align,
                            color: headline.color,
                        }}
                    >
                        <span style={{ display: "block" }}>{headline.line1}</span>
                        <span style={{ display: "block" }}>
                            {headline.line2}{" "}
                            <span style={{ color: headline.accentColor }}>
                                {headline.accentWord}
                            </span>
                        </span>
                    </h2>

                    {headline.showAccentDivider ? (
                        <span
                            style={{
                                display: "block",
                                width: 42,
                                height: 1.5,
                                background: headline.accentColor,
                                marginTop: 12,
                            }}
                        />
                    ) : null}

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 18,
                            marginTop: 22,
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                flex: 1,
                                maxWidth: `${description.maxWidthPercent}%`,
                                fontFamily: bodyFontFamily(fonts.body),
                                fontSize: description.fontSize,
                                fontWeight: description.fontWeight,
                                letterSpacing: description.letterSpacing,
                                lineHeight: description.lineHeight,
                                textAlign: description.align,
                                color: description.color,
                            }}
                        >
                            {description.text}
                        </p>

                        <motion.div
                            whileHover={
                                exportMode ? undefined : { scale: button.hoverScale }
                            }
                            style={{
                                flexShrink: 0,
                                background: button.backgroundColor || theme.button,
                                color: button.textColor || theme.buttonText,
                                borderRadius: button.borderRadius,
                                padding: `${button.paddingY}px ${button.paddingX}px`,
                                width: button.width === "auto" ? "auto" : button.width,
                                height:
                                    button.height === "auto" ? "auto" : button.height,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                fontFamily: bodyFontFamily(fonts.body),
                                fontSize: button.fontSize,
                                fontWeight: button.fontWeight,
                                letterSpacing: button.letterSpacing,
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                boxShadow: "0 4px 14px rgba(200,166,106,0.22)",
                            }}
                        >
                            {button.text}
                            {button.showIcon && button.icon === "arrow-right" ? (
                                <ArrowRight
                                    style={{ width: 15, height: 15 }}
                                    strokeWidth={2.2}
                                />
                            ) : null}
                        </motion.div>
                    </div>

                    {/* Amenities — inside the same glass card as headline + CTA */}
                    {visibleAmenities.length > 0 ? (
                        <div
                            style={{
                                marginTop: 26,
                                borderTop: `1px solid ${divider}`,
                                borderBottom: `1px solid ${divider}`,
                                paddingTop: 20,
                                paddingBottom: 20,
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${Math.max(2, amenitiesStyle.columns)}, minmax(0, 1fr))`,
                                    columnGap: amenitiesStyle.columnGap,
                                    rowGap: amenitiesStyle.rowGap,
                                    alignItems: "start",
                                }}
                            >
                                {visibleAmenities.map((item, index) => {
                                    const labelLines = splitAmenityLabelLines(item.label);
                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                textAlign: "center",
                                                gap: amenitiesStyle.iconLabelGap,
                                                minWidth: 0,
                                                borderLeft:
                                                    index > 0
                                                        ? `1px solid ${divider}`
                                                        : undefined,
                                                paddingLeft: index > 0 ? 6 : 0,
                                                paddingRight: 4,
                                            }}
                                        >
                                            <PostAmenityIcon
                                                icon={item.icon}
                                                customSvg={item.customSvg}
                                                size={amenitiesStyle.iconSize}
                                                color={theme.icon}
                                                strokeWidth={amenitiesStyle.strokeWidth}
                                            />
                                            <span
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    fontFamily: bodyFontFamily(fonts.body),
                                                    fontSize: amenitiesStyle.fontSize,
                                                    fontWeight: amenitiesStyle.fontWeight,
                                                    letterSpacing: "0.04em",
                                                    lineHeight: 1.12,
                                                    color: amenitiesStyle.goldLabels
                                                        ? theme.icon
                                                        : theme.text,
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {labelLines.map((line, li) => (
                                                    <span key={`${item.id}-${li}`}>
                                                        {line}
                                                    </span>
                                                ))}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Spacer — keeps contact footer anchored to the bottom */}
                <div
                    style={{
                        flex: "1 1 auto",
                        minHeight: footerGap,
                    }}
                />

                {/* Contact footer — icon + label clusters separated by | */}
                <div
                    style={{
                        flexShrink: 0,
                        height: footerBandH,
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                        paddingBottom: Math.max(borderInset - 8, 8),
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0,
                        }}
                    >
                        {visibleContacts.map((item, index) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flex: "0 0 auto",
                                    minWidth: 0,
                                }}
                            >
                                {index > 0 ? (
                                    <span
                                        aria-hidden
                                        style={{
                                            fontFamily: bodyFontFamily(fonts.body),
                                            fontSize: contactStyle.fontSize,
                                            fontWeight: 400,
                                            color: footerTextColor,
                                            opacity: 0.45,
                                            paddingLeft: 18,
                                            paddingRight: 18,
                                            lineHeight: 1,
                                            userSelect: "none",
                                        }}
                                    >
                                        |
                                    </span>
                                ) : null}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: contactStyle.gap,
                                        justifyContent: "center",
                                    }}
                                >
                                    <PostContactIcon
                                        type={item.type}
                                        size={contactStyle.iconSize}
                                        color={footerIconColor}
                                        strokeWidth={contactStyle.strokeWidth}
                                    />
                                    <span
                                        style={{
                                            fontFamily: bodyFontFamily(fonts.body),
                                            fontSize: contactStyle.fontSize,
                                            fontWeight: contactStyle.fontWeight,
                                            letterSpacing: "0.015em",
                                            lineHeight: 1,
                                            color: footerTextColor,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/*
              Single continuous champagne-gold border — inset inside the composition.
              Drawn over the hero photo and around the editorial section. One border only.
            */}
            <div
                style={{
                    position: "absolute",
                    inset: borderInset,
                    border: `${layout.borderThickness}px solid ${layout.borderColor || theme.gold}`,
                    borderRadius: layout.borderRadius,
                    pointerEvents: "none",
                    zIndex: 20,
                    boxSizing: "border-box",
                }}
            />
        </div>
    );
}
