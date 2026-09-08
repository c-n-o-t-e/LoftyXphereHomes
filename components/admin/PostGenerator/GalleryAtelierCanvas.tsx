"use client";

import { ArrowRight } from "lucide-react";
import {
    POST_CANVAS_HEIGHT,
    POST_CANVAS_WIDTH,
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
import { ATELIER_TOKENS, POST_TOKENS } from "@/lib/post-generator/tokens";

export function GalleryAtelierCanvas({
    document: doc,
    className,
}: {
    document: PostDocument;
    className?: string;
}) {
    const { layout, theme, fonts, headline, description, button, logo } = doc;
    const amenitiesStyle = {
        ...DEFAULT_AMENITIES_STYLE,
        ...(doc.amenitiesStyle ?? {}),
    };
    const contactStyle = {
        ...DEFAULT_CONTACT_STYLE,
        ...(doc.contactStyle ?? {}),
    };
    const visibleAmenities = doc.amenities.filter((item) => item.visible);
    const visibleContacts = doc.contact.filter((item) => item.visible);
    const photoPct = layout.splitPhotoPercent ?? ATELIER_TOKENS.photoWidthPercent;
    const photoW = Math.round((POST_CANVAS_WIDTH * photoPct) / 100);
    const panelW = POST_CANVAS_WIDTH - photoW;
    const borderInset = Math.max(16, layout.outerPadding || 32);
    const logoUrl = logo.darkUrl ?? logo.url;

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
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: photoW,
                    height: POST_CANVAS_HEIGHT,
                    zIndex: 1,
                }}
            >
                <ImageCanvas
                    image={doc.image}
                    style={{ position: "absolute", inset: 0 }}
                />
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: photoW,
                    width: panelW,
                    height: POST_CANVAS_HEIGHT,
                    background: theme.background,
                    zIndex: 2,
                    boxSizing: "border-box",
                    padding: `${layout.contentPaddingTop}px ${layout.contentPaddingX}px ${layout.contentPaddingBottom}px`,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 36,
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: theme.gold,
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                        }}
                    >
                        Stay
                    </p>
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt=""
                            style={{
                                width: logo.size,
                                height: "auto",
                                objectFit: "contain",
                                opacity: logo.opacity,
                                filter:
                                    "brightness(0) saturate(100%) invert(72%) sepia(28%) saturate(620%) hue-rotate(6deg)",
                            }}
                        />
                    ) : null}
                </div>

                <h2
                    style={{
                        margin: 0,
                        fontFamily: headingFontFamily(fonts.heading),
                        fontSize: headline.fontSize,
                        fontWeight: headline.fontWeight,
                        letterSpacing: headline.letterSpacing,
                        lineHeight: headline.lineHeight,
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

                <span
                    style={{
                        display: "block",
                        width: 36,
                        height: 1,
                        background: theme.gold,
                        marginTop: 18,
                        marginBottom: 18,
                    }}
                />

                <p
                    style={{
                        margin: 0,
                        fontSize: description.fontSize,
                        fontWeight: description.fontWeight,
                        letterSpacing: description.letterSpacing,
                        lineHeight: description.lineHeight,
                        color: description.color,
                    }}
                >
                    {description.text}
                </p>

                {visibleAmenities.length > 0 ? (
                    <div
                        style={{
                            marginTop: 36,
                            display: "grid",
                            gridTemplateColumns: `repeat(${Math.max(2, amenitiesStyle.columns)}, minmax(0, 1fr))`,
                            columnGap: amenitiesStyle.columnGap,
                            rowGap: amenitiesStyle.rowGap,
                        }}
                    >
                        {visibleAmenities.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    minWidth: 0,
                                }}
                            >
                                <PostAmenityIcon
                                    icon={item.icon}
                                    customSvg={item.customSvg}
                                    size={amenitiesStyle.iconSize}
                                    color={theme.gold}
                                    strokeWidth={amenitiesStyle.strokeWidth}
                                />
                                <span
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        fontSize: amenitiesStyle.fontSize,
                                        fontWeight: amenitiesStyle.fontWeight,
                                        letterSpacing: "0.08em",
                                        lineHeight: 1.25,
                                        textTransform: "uppercase",
                                        color: theme.text,
                                    }}
                                >
                                    {splitAmenityLabelLines(item.label).map((line, li) => (
                                        <span key={`${item.id}-${li}`}>{line}</span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div style={{ flex: 1, minHeight: 24 }} />

                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        color: button.textColor || theme.gold,
                        fontSize: button.fontSize,
                        fontWeight: button.fontWeight,
                        letterSpacing: button.letterSpacing,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${theme.gold}`,
                        paddingBottom: 8,
                        width: "fit-content",
                    }}
                >
                    {button.text}
                    {button.showIcon && button.icon === "arrow-right" ? (
                        <ArrowRight style={{ width: 13, height: 13 }} strokeWidth={1.7} />
                    ) : null}
                </div>

                <div
                    style={{
                        marginTop: 28,
                        paddingTop: 18,
                        borderTop: `1px solid ${POST_TOKENS.colors.divider}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                    }}
                >
                    {visibleContacts.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: contactStyle.gap,
                            }}
                        >
                            <PostContactIcon
                                type={item.type}
                                size={contactStyle.iconSize}
                                color={theme.gold}
                                strokeWidth={contactStyle.strokeWidth}
                            />
                            <span
                                style={{
                                    fontSize: contactStyle.fontSize,
                                    fontWeight: 500,
                                    letterSpacing: "0.02em",
                                    color: theme.text,
                                }}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: photoW,
                    width: ATELIER_TOKENS.hairline,
                    background: theme.gold,
                    opacity: 0.55,
                    zIndex: 5,
                    pointerEvents: "none",
                }}
            />

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
