"use client";

/**
 * Pure Canvas 2D export — no html2canvas / no Tailwind / no lab() colors.
 * Draws the Instagram post from the document model, then saves a real file.
 */

import {
    POST_CANVAS_HEIGHT,
    POST_CANVAS_WIDTH,
    type AmenityIconKey,
    type ContactIconKey,
    type PostDocument,
    type PostExportFormat,
    type PostExportScale,
    type PostImageControls,
} from "@/lib/post-generator/types";
import {
    bodyFontFamily,
    headingFontFamily,
} from "@/components/admin/PostGenerator/icons";
import {
    amenityIconSvg,
    contactIconSvg,
    loadSvgAsImage,
} from "@/lib/post-generator/iconSvg";
import {
    DEFAULT_AMENITIES_STYLE,
    DEFAULT_CONTACT_STYLE,
} from "@/lib/post-generator/defaults";
import { splitAmenityLabelLines } from "@/lib/post-generator/amenityLabel";
import { POST_TOKENS } from "@/lib/post-generator/tokens";

export type ExportPostOptions = {
    format: PostExportFormat;
    scale: PostExportScale;
    transparentBackground?: boolean;
    fileName?: string;
    authHeaders?: HeadersInit;
};

/**
 * Turn an upload name like "section one.jpg" into a safe download base name.
 * Keeps spaces (user expectation) but strips path / reserved OS characters.
 */
export function sanitizeExportBaseName(raw: string): string {
    const withoutExt = raw.replace(/\.[a-z0-9]{1,8}$/i, "");
    const cleaned = withoutExt
        .replace(/[/\\?%*:|"<>]+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
    return cleaned || "instagram-post";
}

/** Prefer uploaded file name; else suite slug; else generic. */
export function resolvePostExportFileName(doc: PostDocument): string {
    const fromUpload = doc.image.sourceFileName?.trim();
    if (fromUpload) return sanitizeExportBaseName(fromUpload);
    if (doc.apartmentSlug?.trim()) {
        return `lofty-${doc.apartmentSlug.trim()}-post`;
    }
    return "lofty-instagram-post";
}

function resolveAssetUrl(src: string): string {
    if (!src) return src;
    if (
        src.startsWith("data:") ||
        src.startsWith("blob:") ||
        src.startsWith("http://") ||
        src.startsWith("https://")
    ) {
        return src;
    }
    if (typeof window !== "undefined") {
        return new URL(src, window.location.origin).href;
    }
    return src;
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function loadHtmlImage(src: string, useCors: boolean): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        if (useCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

/**
 * Fetch image bytes in a canvas-safe way (proxy first for remote hosts).
 * Never draw a hotlinked Supabase <img> — that taints the canvas.
 */
async function fetchImageBlob(
    src: string,
    authHeaders?: HeadersInit,
): Promise<Blob | null> {
    if (!src) return null;
    if (src.startsWith("data:")) {
        try {
            const res = await fetch(src);
            if (res.ok) return await res.blob();
        } catch {
            return null;
        }
        return null;
    }

    const absolute = resolveAssetUrl(src);

    if (absolute.startsWith("blob:")) {
        try {
            const res = await fetch(absolute);
            if (res.ok) return await res.blob();
        } catch {
            return null;
        }
        return null;
    }

    const sameOrigin =
        typeof window !== "undefined" && absolute.startsWith(window.location.origin);

    if (sameOrigin) {
        try {
            const res = await fetch(absolute, { cache: "no-cache", credentials: "same-origin" });
            if (res.ok) return await res.blob();
        } catch {
            // continue
        }
    }

    // Authenticated proxy — required for Supabase public objects (no CORS for canvas)
    if (absolute.startsWith("http://") || absolute.startsWith("https://")) {
        try {
            const proxy = `/api/admin/flyers/image-proxy?url=${encodeURIComponent(absolute)}`;
            const headers = new Headers(authHeaders);
            const res = await fetch(proxy, { headers, cache: "no-cache" });
            if (res.ok) {
                const blob = await res.blob();
                // Guard against JSON error bodies served as 200
                if (blob.type.includes("json")) return null;
                if (blob.size > 32) return blob;
            }
        } catch {
            // fall through
        }

        try {
            const res = await fetch(absolute, { mode: "cors", cache: "no-cache" });
            if (res.ok) return await res.blob();
        } catch {
            return null;
        }
    }

    return null;
}

async function loadDrawable(
    src: string,
    authHeaders?: HeadersInit,
): Promise<CanvasImageSource | null> {
    // Uploaded photos are stored as data URLs — load them directly (no fetch/proxy).
    if (src.startsWith("data:")) {
        if (typeof createImageBitmap === "function") {
            try {
                const res = await fetch(src);
                const blob = await res.blob();
                return await createImageBitmap(blob);
            } catch {
                // Some browsers choke on huge data: fetch — fall through to <img>
            }
        }
        return loadHtmlImage(src, false);
    }

    const blob = await fetchImageBlob(src, authHeaders);
    if (!blob) return null;

    if (typeof createImageBitmap === "function") {
        try {
            return await createImageBitmap(blob);
        } catch {
            // fall through to HTMLImageElement
        }
    }

    const dataUrl = await blobToDataUrl(blob);
    // data: URLs must NOT set crossOrigin — Safari/Chrome will fail the load
    return loadHtmlImage(dataUrl, false);
}

/**
 * Visible hero rectangle after CSS-style crop insets (percent of the photo band).
 * Matches ImageCanvas: outer frame stays full-bleed, inner photo is inset.
 */
export function heroPhotoCropRect(
    photoW: number,
    photoH: number,
    image: Pick<PostImageControls, "cropTop" | "cropRight" | "cropBottom" | "cropLeft">,
): { x: number; y: number; width: number; height: number } {
    const clampPct = (n: number) => Math.min(40, Math.max(0, Number.isFinite(n) ? n : 0));
    const top = (photoH * clampPct(image.cropTop)) / 100;
    const bottom = (photoH * clampPct(image.cropBottom)) / 100;
    const left = (photoW * clampPct(image.cropLeft)) / 100;
    const right = (photoW * clampPct(image.cropRight)) / 100;
    return {
        x: left,
        y: top,
        width: Math.max(1, photoW - left - right),
        height: Math.max(1, photoH - top - bottom),
    };
}

function drawableSize(source: CanvasImageSource): { w: number; h: number } {
    if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
        return { w: source.width, h: source.height };
    }
    if (source instanceof HTMLImageElement) {
        return { w: source.naturalWidth || source.width, h: source.naturalHeight || source.height };
    }
    if (source instanceof HTMLCanvasElement) {
        return { w: source.width, h: source.height };
    }
    return { w: 0, h: 0 };
}

function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

/** Rasterize amenity/contact SVGs so download icons match the live preview. */
async function loadIconImage(svgMarkup: string): Promise<HTMLImageElement | null> {
    try {
        return await loadSvgAsImage(svgMarkup);
    } catch {
        return null;
    }
}

async function renderPostToCanvas(
    doc: PostDocument,
    scale: number,
    authHeaders?: HeadersInit,
    transparent?: boolean,
): Promise<HTMLCanvasElement> {
    const W = POST_CANVAS_WIDTH;
    const H = POST_CANVAS_HEIGHT;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported in this browser");

    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const { layout, overlay, theme, fonts, headline, description, button, logo, image } =
        doc;
    const amenities = doc.amenities.filter((a) => a.visible);
    const contacts = doc.contact.filter((c) => c.visible);
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

    // Preload amenity + contact icons (same SVGs as the live preview)
    const amenityIconImgs = await Promise.all(
        amenities.map((item) =>
            loadIconImage(
                amenityIconSvg(
                    item.icon as AmenityIconKey,
                    amenitiesStyle.iconSize,
                    theme.icon,
                    amenitiesStyle.strokeWidth,
                    item.customSvg,
                ),
            ),
        ),
    );
    const contactIconImgs = await Promise.all(
        contacts.map((item) =>
            loadIconImage(
                contactIconSvg(
                    item.type as ContactIconKey,
                    contactStyle.iconSize,
                    footerIconColor,
                    contactStyle.strokeWidth,
                ),
            ),
        ),
    );

    // Full-canvas ivory ground — hero is full-bleed (no cream margin around photo)
    if (!transparent) {
        ctx.fillStyle = theme.background;
        ctx.fillRect(0, 0, W, H);
    }

    ctx.save();

    const borderInset = Math.max(16, layout.outerPadding || 28);
    // Full-bleed stage (photo touches canvas edges)
    const innerX = 0;
    const innerY = 0;
    const innerW = W;
    const innerH = H;

    const cardInset = Math.max(0, overlay.cardInsetX ?? 36);
    const cardOffsetY = overlay.cardOffsetY ?? -40;
    const photoFade = Math.min(40, Math.max(0, overlay.photoFadePercent ?? 13));
    const footerBandH = 56 + contactStyle.iconSize + contactStyle.paddingY * 2 + 12;
    const photoH = (innerH * overlay.photoHeightPercent) / 100;
    const cardTopLocal =
        (innerH * (overlay.photoHeightPercent - overlay.overlapPercent)) / 100 +
        cardOffsetY;
    const dividerAlpha = 0.18;

    // Hero photo with soft bottom fade (no hard cut)
    if (image.url) {
        const img = await loadDrawable(image.url, authHeaders);
        if (!img) {
            throw new Error(
                "Could not load the apartment photo for download. Re-select the suite or re-upload the image, then try again.",
            );
        }
        const { w: iw, h: ih } = drawableSize(img);
        if (iw < 1 || ih < 1) {
            throw new Error("Apartment photo loaded empty — please re-upload and try again.");
        }

        const off = document.createElement("canvas");
        off.width = Math.max(1, Math.round(innerW));
        off.height = Math.max(1, Math.round(photoH));
        const octx = off.getContext("2d");
        if (!octx) throw new Error("Could not prepare photo layer");

        const crop = heroPhotoCropRect(innerW, photoH, image);
        const scaleFactor = Math.max(0.01, image.scale * image.zoom);
        const cover = Math.max(crop.width / iw, crop.height / ih) * scaleFactor;
        const dw = iw * cover;
        const dh = ih * cover;
        const ox =
            crop.x +
            (crop.width - dw) / 2 +
            image.panX +
            ((image.positionX - 50) / 50) * (dw - crop.width) * 0.25;
        const oy =
            crop.y +
            (crop.height - dh) / 2 +
            image.panY +
            ((image.positionY - 50) / 50) * (dh - crop.height) * 0.25;

        const needsFilter =
            image.brightness !== 100 ||
            image.contrast !== 100 ||
            image.saturation !== 100 ||
            image.blur > 0;
        if (needsFilter) {
            octx.filter = [
                `brightness(${image.brightness}%)`,
                `contrast(${image.contrast}%)`,
                `saturate(${image.saturation}%)`,
                image.blur > 0 ? `blur(${image.blur}px)` : "",
            ]
                .filter(Boolean)
                .join(" ");
        }
        octx.save();
        octx.beginPath();
        octx.rect(crop.x, crop.y, crop.width, crop.height);
        octx.clip();
        try {
            octx.drawImage(img, ox, oy, dw, dh);
        } catch {
            octx.filter = "none";
            octx.drawImage(img, ox, oy, dw, dh);
        }
        octx.restore();
        octx.filter = "none";

        // Soft bottom fade: destination-in must cover the FULL photo height.
        // Filling only the fade band would erase everything above it.
        const fadePct = Math.min(40, Math.max(0, photoFade)) / 100;
        if (fadePct > 0.01) {
            const fadeStart = Math.max(0, 1 - fadePct);
            const g = octx.createLinearGradient(0, 0, 0, photoH);
            g.addColorStop(0, "rgba(0,0,0,1)");
            g.addColorStop(fadeStart, "rgba(0,0,0,1)");
            g.addColorStop(1, "rgba(0,0,0,0)");
            octx.globalCompositeOperation = "destination-in";
            octx.fillStyle = g;
            octx.fillRect(0, 0, off.width, off.height);
            octx.globalCompositeOperation = "source-over";
        }

        ctx.drawImage(off, innerX, innerY);

        if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap) {
            img.close();
        }
    } else {
        const g = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + photoH);
        g.addColorStop(0, "#d9d0c3");
        g.addColorStop(0.5, "#efe8dc");
        g.addColorStop(1, "#cfc4b4");
        ctx.fillStyle = g;
        ctx.fillRect(innerX, innerY, innerW, photoH);
        ctx.fillStyle = "#7a7268";
        ctx.font = "600 16px Manrope, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Upload a photo", innerX + innerW / 2, innerY + photoH / 2);
    }

    // Soft ivory wash only near the seam (don't blank the hero)
    {
        const fadePct = Math.min(40, Math.max(0, photoFade)) / 100;
        const washH = Math.max(photoH * fadePct, photoH * 0.08);
        const washY = innerY + photoH - washH;
        for (let i = 0; i < 12; i++) {
            const t = (i + 1) / 12;
            ctx.globalAlpha = t * t * 0.85;
            ctx.fillStyle = theme.background;
            const y = washY + (washH * i) / 12;
            ctx.fillRect(innerX, y, innerW, washH / 12 + 1);
        }
        ctx.globalAlpha = 1;
    }

    // Glass card (headline + description + CTA + amenities)
    const panelX = innerX + cardInset;
    const panelW = innerW - cardInset * 2;
    const pr = overlay.borderRadius;
    const cx = panelX + layout.contentPaddingX;
    const contentW = panelW - layout.contentPaddingX * 2;

    // Measure content height for glass card
    ctx.font = `${headline.fontWeight} ${headline.fontSize}px ${headingFontFamily(fonts.heading)}`;
    const headlineH =
        headline.fontSize * headline.lineHeight * 2 +
        (headline.showAccentDivider ? 18 : 0);
    ctx.font = `${description.fontWeight} ${description.fontSize}px ${bodyFontFamily(fonts.body)}`;
    const descMaxW = (contentW * description.maxWidthPercent) / 100;
    const descLines = wrapText(ctx, description.text, descMaxW);
    const descLineH = description.fontSize * description.lineHeight;
    const descBlockH = Math.max(
        descLines.length * descLineH,
        button.fontSize + button.paddingY * 2,
    );

    const cols = Math.max(2, amenitiesStyle.columns || 8);
    const iconSize = amenitiesStyle.iconSize;
    const amenityRowH =
        iconSize + amenitiesStyle.iconLabelGap + amenitiesStyle.fontSize * 2.4 + 6;
    const amenityRows = Math.max(1, Math.ceil(Math.max(amenities.length, 1) / cols));
    const amenityInnerH =
        amenities.length > 0
            ? amenityRows * amenityRowH +
              Math.max(0, amenityRows - 1) * Math.max(0, amenitiesStyle.rowGap) +
              40
            : 0;
    const amenitiesSectionH =
        amenities.length > 0 ? 26 + amenityInnerH : 0;

    const panelH =
        layout.contentPaddingTop +
        headlineH +
        22 +
        descBlockH +
        amenitiesSectionH +
        layout.contentPaddingBottom;
    const panelY = innerY + cardTopLocal;

    // Soft ambient shadow
    if (overlay.shadow > 0) {
        ctx.save();
        ctx.shadowColor = "rgba(44,44,44,0.08)";
        ctx.shadowBlur = overlay.shadow * 1.4;
        ctx.shadowOffsetY = Math.max(4, overlay.shadow / 3);
        ctx.fillStyle = "rgba(255,255,255,0.01)";
        roundRect(ctx, panelX, panelY, panelW, panelH, pr);
        ctx.fill();
        ctx.restore();
    }

    // Glass fill (white at opacity) — canvas can't blur backdrop, approximate with translucent white
    ctx.save();
    ctx.globalAlpha = Math.min(Math.max(overlay.opacity, 0.12), 0.92);
    ctx.fillStyle = overlay.backgroundColor?.startsWith("#")
        ? overlay.backgroundColor
        : "#FFFFFF";
    roundRect(ctx, panelX, panelY, panelW, panelH, pr);
    ctx.fill();
    ctx.restore();

    // Slight ivory underlay so export still reads as frosted over the fade
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = theme.background;
    roundRect(ctx, panelX, panelY, panelW, panelH, pr);
    ctx.fill();
    ctx.restore();

    if (overlay.borderThickness > 0) {
        ctx.strokeStyle =
            overlay.borderColor || POST_TOKENS.colors.glassBorder;
        ctx.lineWidth = overlay.borderThickness;
        roundRect(ctx, panelX, panelY, panelW, panelH, pr);
        ctx.stroke();
    }

    // Logo
    const logoSrc =
        logo.variant === "light"
            ? logo.lightUrl ?? logo.url
            : logo.variant === "dark"
              ? logo.darkUrl ?? logo.url
              : logo.url;
    if (logoSrc) {
        const logoImg = await loadDrawable(logoSrc, authHeaders);
        if (logoImg) {
            ctx.save();
            ctx.globalAlpha = logo.opacity;
            let lx = innerX + logo.padding;
            let ly = innerY + logo.padding;
            if (logo.position === "top-right") lx = innerX + innerW - logo.padding - logo.size;
            if (logo.position === "top-center") lx = innerX + (innerW - logo.size) / 2;
            const { w: lw, h: lh0 } = drawableSize(logoImg);
            const aspect = lh0 / Math.max(lw, 1);
            const lh = logo.size * aspect;
            ctx.drawImage(logoImg, lx, ly, logo.size, lh);
            if (logo.showWordmark) {
                ctx.fillStyle = logo.variant === "dark" ? theme.text : theme.icon;
                ctx.font = `600 11px ${bodyFontFamily(fonts.body)}`;
                ctx.textAlign = "left";
                ctx.fillText(logo.wordmark.toUpperCase(), lx, ly + lh + 14);
            }
            ctx.restore();
            if (typeof ImageBitmap !== "undefined" && logoImg instanceof ImageBitmap) {
                logoImg.close();
            }
        }
    }

    // Headline inside glass card
    let ty = panelY + layout.contentPaddingTop;
    ctx.fillStyle = headline.color;
    ctx.font = `${headline.fontWeight} ${headline.fontSize}px ${headingFontFamily(fonts.heading)}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(headline.line1, cx, ty);
    ty += headline.fontSize * headline.lineHeight;
    if (headline.showAccentDivider) {
        ctx.fillStyle = headline.accentColor;
        ctx.fillRect(cx, ty + 4, 42, 1.5);
        ty += 18;
    }
    ctx.fillStyle = headline.color;
    ctx.font = `${headline.fontWeight} ${headline.fontSize}px ${headingFontFamily(fonts.heading)}`;
    const line2 = `${headline.line2} `;
    ctx.fillText(line2, cx, ty);
    const line2W = ctx.measureText(line2).width;
    ctx.fillStyle = headline.accentColor;
    ctx.fillText(headline.accentWord, cx + line2W, ty);
    ty += headline.fontSize * headline.lineHeight + 22;

    // Description + CTA
    ctx.fillStyle = description.color;
    ctx.font = `${description.fontWeight} ${description.fontSize}px ${bodyFontFamily(fonts.body)}`;
    descLines.forEach((line, i) => {
        ctx.fillText(line, cx, ty + i * descLineH);
    });

    ctx.font = `${button.fontWeight} ${button.fontSize}px ${bodyFontFamily(fonts.body)}`;
    const ctaLabel = button.showIcon ? `${button.text}  →` : button.text;
    const ctaTextW = ctx.measureText(ctaLabel).width;
    const ctaW = ctaTextW + button.paddingX * 2;
    const ctaH = button.fontSize + button.paddingY * 2;
    const ctaX = panelX + panelW - layout.contentPaddingX - ctaW;
    const ctaY = ty + Math.max(0, (descLines.length * descLineH - ctaH) / 2);
    ctx.fillStyle = button.backgroundColor || theme.button;
    roundRect(
        ctx,
        ctaX,
        ctaY,
        ctaW,
        ctaH,
        button.borderRadius > 100 ? ctaH / 2 : button.borderRadius,
    );
    ctx.fill();
    ctx.fillStyle = button.textColor || theme.buttonText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ctaLabel, ctaX + ctaW / 2, ctaY + ctaH / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // Amenities INSIDE glass card (same frosted panel as headline + CTA)
    const amenityRuleTop = ty + descBlockH + 26;
    const amenityTop = amenityRuleTop + 20;

    if (amenities.length > 0) {
        ctx.save();
        ctx.globalAlpha = dividerAlpha;
        ctx.strokeStyle = theme.gold || theme.icon;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, amenityRuleTop);
        ctx.lineTo(cx + contentW, amenityRuleTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, amenityRuleTop + amenityInnerH - 20);
        ctx.lineTo(cx + contentW, amenityRuleTop + amenityInnerH - 20);
        ctx.stroke();
        ctx.restore();

        const colW = contentW / cols;
        const labelColor = amenitiesStyle.goldLabels ? theme.icon : theme.text;
        amenities.forEach((item, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const ax = cx + colW * col + colW / 2;
            const ay =
                amenityTop +
                row * (amenityRowH + Math.max(0, amenitiesStyle.rowGap));

            if (col > 0) {
                ctx.save();
                ctx.globalAlpha = dividerAlpha;
                ctx.strokeStyle = theme.gold || theme.icon;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx + colW * col, ay + 2);
                ctx.lineTo(
                    cx + colW * col,
                    ay + iconSize + amenitiesStyle.fontSize * 2.2,
                );
                ctx.stroke();
                ctx.restore();
            }

            const iconImg = amenityIconImgs[i];
            if (iconImg) {
                ctx.drawImage(iconImg, ax - iconSize / 2, ay, iconSize, iconSize);
            }
            ctx.fillStyle = labelColor;
            ctx.font = `${amenitiesStyle.fontWeight} ${amenitiesStyle.fontSize}px ${bodyFontFamily(fonts.body)}`;
            ctx.textAlign = "center";
            const lines = splitAmenityLabelLines(item.label);
            const labelY = ay + iconSize + amenitiesStyle.iconLabelGap;
            const lineH = amenitiesStyle.fontSize * 1.12;
            lines.forEach((line, li) => {
                ctx.fillText(line, ax, labelY + li * lineH);
            });
        });
        ctx.textAlign = "left";
    }

    // Contact footer — icon + label clusters separated by |
    const footerY = innerY + innerH - footerBandH;
    const contactPadX = cardInset;
    const contactY = footerY + footerBandH / 2 - contactStyle.iconSize / 2 + 2;
    const contactContentW = innerW - contactPadX * 2;
    const contactLeft = innerX + contactPadX;

    if (contacts.length > 0) {
        const glyphSize = contactStyle.iconSize;
        const pipePad = 18;
        ctx.font = `${contactStyle.fontWeight} ${contactStyle.fontSize}px ${bodyFontFamily(fonts.body)}`;
        const pipeW = ctx.measureText("|").width;
        const pipeSlot = pipePad * 2 + pipeW;
        const itemWidths = contacts.map((item) => {
            const tw = ctx.measureText(item.label).width;
            return glyphSize + contactStyle.gap + tw;
        });
        const totalW =
            itemWidths.reduce((a, b) => a + b, 0) +
            Math.max(0, contacts.length - 1) * pipeSlot;
        let cursor = contactLeft + Math.max(0, (contactContentW - totalW) / 2);

        contacts.forEach((item, i) => {
            if (i > 0) {
                ctx.save();
                ctx.globalAlpha = 0.45;
                ctx.fillStyle = footerTextColor;
                ctx.font = `400 ${contactStyle.fontSize}px ${bodyFontFamily(fonts.body)}`;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText("|", cursor + pipePad, contactY + glyphSize / 2);
                ctx.restore();
                cursor += pipeSlot;
            }

            const glyphX = cursor;
            const textX = glyphX + glyphSize + contactStyle.gap;
            const iconImg = contactIconImgs[i];
            if (iconImg) {
                ctx.drawImage(iconImg, glyphX, contactY, glyphSize, glyphSize);
            }
            ctx.fillStyle = footerTextColor;
            ctx.font = `${contactStyle.fontWeight} ${contactStyle.fontSize}px ${bodyFontFamily(fonts.body)}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(item.label, textX, contactY + glyphSize / 2);
            ctx.textBaseline = "top";
            cursor += itemWidths[i]!;
        });
    }

    ctx.restore(); // content

    // Single continuous champagne-gold border — inset inside the composition
    ctx.strokeStyle = layout.borderColor || theme.gold;
    ctx.lineWidth = layout.borderThickness;
    roundRect(
        ctx,
        borderInset,
        borderInset,
        W - borderInset * 2,
        H - borderInset * 2,
        layout.borderRadius,
    );
    ctx.stroke();

    return canvas;
}

async function canvasToBlob(
    canvas: HTMLCanvasElement,
    format: PostExportFormat,
): Promise<Blob> {
    const mime =
        format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
    const quality = format === "png" ? undefined : 0.95;

    try {
        // Smoke-check for tainted canvas before toBlob
        canvas.toDataURL("image/png");
    } catch {
        throw new Error(
            "Photo blocked export (CORS). Re-select the apartment photo and try again.",
        );
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else if (format === "webp") {
                    canvas.toBlob(
                        (png) => (png ? resolve(png) : reject(new Error("Encode failed"))),
                        "image/png",
                    );
                } else {
                    reject(new Error("Could not create image file"));
                }
            },
            mime,
            quality,
        );
    });
}

function isMobileDevice(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
    // iPadOS desktop UA with touch
    return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

async function downloadViaAnchor(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    try {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Give Safari time to start the download before revoking
        await new Promise((r) => setTimeout(r, 400));
    } finally {
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
}

async function shareViaSheet(blob: Blob, filename: string): Promise<"shared" | "cancelled" | "unsupported"> {
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
    };
    if (typeof nav.share !== "function") return "unsupported";
    try {
        if (typeof nav.canShare === "function" && !nav.canShare({ files: [file] })) {
            return "unsupported";
        }
        await nav.share({
            files: [file],
            title: filename,
            text: "Lofty Xphere Homes Instagram post",
        });
        return "shared";
    } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return "cancelled";
        return "unsupported";
    }
}

/**
 * Save blob to Downloads (desktop) or Photos/Files via share sheet (phone).
 * Order matters: phones need share; desktops need a real download click.
 */
async function saveBlobToDevice(blob: Blob, filename: string): Promise<void> {
    if (!blob || blob.size < 64) {
        throw new Error("Export produced an empty file — try again");
    }

    if (isMobileDevice()) {
        const shareResult = await shareViaSheet(blob, filename);
        if (shareResult === "shared" || shareResult === "cancelled") return;
        // Fall through: some mobile browsers still honor <a download>
    }

    try {
        await downloadViaAnchor(blob, filename);
        return;
    } catch {
        // try file-saver next
    }

    try {
        const { saveAs } = await import("file-saver");
        saveAs(blob, filename);
        return;
    } catch {
        // last resort
    }

    // Mobile fallback if share was unsupported: open image so user can long-press Save
    if (isMobileDevice()) {
        const url = URL.createObjectURL(blob);
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
            URL.revokeObjectURL(url);
            throw new Error(
                "Could not save automatically. Allow pop-ups, then tap Download again and choose Save Image.",
            );
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
    }

    throw new Error("Download blocked by the browser — please try Chrome or Safari");
}

/**
 * Export a post document to PNG/JPEG/WEBP and save it on this device.
 * Does not use html2canvas — draws directly with Canvas 2D.
 */
export async function exportPostDocument(
    doc: PostDocument,
    options: ExportPostOptions,
): Promise<void> {
    if (!doc || typeof doc !== "object" || !doc.layout || !doc.headline) {
        throw new Error("Nothing to export — post data is missing");
    }

    if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready.catch(() => undefined);
    }

    const format =
        options.transparentBackground && options.format === "jpeg"
            ? "png"
            : options.format;

    const canvas = await renderPostToCanvas(
        doc,
        options.scale,
        options.authHeaders,
        options.transparentBackground,
    );

    const blob = await canvasToBlob(canvas, format);
    const base =
        options.fileName?.trim() ||
        resolvePostExportFileName(doc);
    const ext = format === "jpeg" ? "jpg" : format === "webp" ? "webp" : "png";
    await saveBlobToDevice(blob, `${base}@${options.scale}x.${ext}`);
}

/** @deprecated Prefer exportPostDocument — kept so old call sites keep typechecking briefly */
export async function exportPostCanvas(
    _element: HTMLElement,
    options: ExportPostOptions & { document?: PostDocument },
): Promise<void> {
    if (!options.document) {
        throw new Error("exportPostCanvas requires document — use exportPostDocument");
    }
    return exportPostDocument(options.document, options);
}
