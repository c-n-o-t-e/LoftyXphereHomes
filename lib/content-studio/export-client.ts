"use client";

import { logoSrc } from "@/lib/content-studio/brand-theme";
import { composeTextStack } from "@/lib/content-studio/fit-typography";
import { getLayout, zoneOf, type LayoutZone } from "@/lib/content-studio/layouts";
import { canvasSize } from "@/lib/content-studio/layout-engine";
import { loadSvgAsImage, studioIconSvg } from "@/lib/content-studio/icons";
import { editorialPlaceholderSrc } from "@/lib/content-studio/placeholders";
import { STUDIO_TOKENS } from "@/lib/content-studio/tokens";
import type {
    EditorialDocument,
    StudioExportFormat,
    StudioExportScale,
    StudioIconKey,
} from "@/lib/content-studio/types";
import { resolveCanvasImageRequest } from "@/lib/post-generator/canvasImageRequest";

export type ExportStudioOptions = {
    format: StudioExportFormat;
    scale: StudioExportScale;
    fileName?: string;
    authHeaders?: HeadersInit;
};

export function sanitizeStudioFileName(raw: string): string {
    const withoutExt = raw.replace(/\.[a-z0-9]{1,8}$/i, "");
    return (
        withoutExt
            .replace(/[/\\?%*:|"<>]+/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120) || "lofty-editorial-post"
    );
}

export function resolveStudioExportFileName(document: EditorialDocument): string {
    const fromTitle = document.content.title.trim();
    if (fromTitle) {
        return sanitizeStudioFileName(fromTitle.toLowerCase().replace(/\s+/g, "-"));
    }
    return "lofty-editorial-post";
}

function headingFamily(name: EditorialDocument["fonts"]["heading"]): string {
    return name === "Cormorant Garamond"
        ? '"Cormorant Garamond", "Times New Roman", serif'
        : STUDIO_TOKENS.type.display;
}

function bodyFamily(name: EditorialDocument["fonts"]["body"]): string {
    return name === "Manrope"
        ? '"Manrope", "Helvetica Neue", sans-serif'
        : STUDIO_TOKENS.type.sans;
}

function wrapLines(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxLines = 8,
): string[] {
    const explicit = text.split("\n");
    if (explicit.length > 1) {
        return explicit.flatMap((line) => wrapLines(ctx, line, maxWidth, maxLines)).slice(0, maxLines);
    }
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const lines: string[] = [];
    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
        const next = `${current} ${words[i]}`;
        if (ctx.measureText(next).width <= maxWidth) {
            current = next;
        } else {
            lines.push(current);
            current = words[i];
            if (lines.length === maxLines - 1) break;
        }
    }
    if (lines.length < maxLines) lines.push(current);
    return lines;
}

function drawWrapped(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: CanvasTextAlign,
    maxLines = 8,
) {
    const lines = wrapLines(ctx, text, maxWidth, maxLines);
    ctx.textAlign = align;
    const origin =
        align === "center" ? x + maxWidth / 2 : align === "right" ? x + maxWidth : x;
    lines.forEach((line, index) => {
        ctx.fillText(line, origin, y + index * lineHeight);
    });
    return lines.length * lineHeight;
}

async function loadImage(
    src: string,
    authHeaders?: HeadersInit,
): Promise<HTMLImageElement | null> {
    if (!src) return null;
    const request = resolveCanvasImageRequest(src);
    const url = request.kind === "proxy" ? request.src : request.src;
    try {
        if (src.startsWith("data:") || src.startsWith("blob:")) {
            return await decodeImage(src, false);
        }
        if (request.kind === "proxy") {
            const res = await fetch(url, { headers: authHeaders });
            if (!res.ok) return null;
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            return decodeImage(dataUrl, false);
        }
        return decodeImage(url, request.kind === "direct" ? request.useCors : false);
    } catch {
        return null;
    }
}

function decodeImage(src: string, useCors: boolean): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image();
        if (useCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

function alignOf(zone?: LayoutZone): CanvasTextAlign {
    return zone?.align ?? "left";
}

function drawFooter(
    ctx: CanvasRenderingContext2D,
    document: EditorialDocument,
    zone: LayoutZone,
) {
    const { footer, theme } = document;
    ctx.fillStyle = theme.textMuted;
    ctx.font = `500 13px ${bodyFamily(document.fonts.body)}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = alignOf(zone);

    let label = "";
    if (footer.variant === "full") {
        label = [footer.instagram, footer.whatsapp, footer.website]
            .filter(Boolean)
            .join("   ·   ");
    } else if (footer.variant === "micro") {
        label = [footer.instagram, footer.website].filter(Boolean).join("  ·  ");
    } else if (footer.variant === "website-only") {
        label = footer.website;
    }

    if (!label) return;
    const x =
        zone.align === "center"
            ? zone.rect.x + zone.rect.w / 2
            : zone.align === "right"
              ? zone.rect.x + zone.rect.w
              : zone.rect.x;
    ctx.fillText(label, x, zone.rect.y + zone.rect.h / 2);
}

function drawAsset(
    ctx: CanvasRenderingContext2D,
    document: EditorialDocument,
    image: HTMLImageElement,
    hero: boolean,
) {
    const { asset } = document;
    const w = asset.width * asset.scale;
    const h = asset.height * asset.scale;
    ctx.save();
    ctx.globalAlpha = asset.opacity ?? 1;

    if (hero) {
        ctx.drawImage(image, asset.x - w / 2, asset.y - h / 2, w, h);
        ctx.restore();
        return;
    }

    const shadowBlur = asset.shadowBlur ?? asset.shadow ?? 0;
    const shadowOpacity = asset.shadowOpacity ?? 0.18;
    const shadowScale = asset.shadowScale ?? 0.7;
    const shadowOffsetY = asset.shadowOffsetY ?? 24;

    if (shadowBlur > 0 && shadowOpacity > 0) {
        ctx.save();
        ctx.translate(asset.x, asset.y + h / 2 + shadowOffsetY * 0.35);
        ctx.fillStyle = `rgba(36,26,20,${shadowOpacity})`;
        ctx.filter = `blur(${Math.round(shadowBlur * 0.28)}px)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, (w * shadowScale) / 2, Math.max(14, h * 0.06), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    ctx.translate(asset.x, asset.y);
    ctx.rotate((asset.rotation * Math.PI) / 180);
    if (shadowBlur > 0) {
        ctx.shadowColor = `rgba(36,26,20,${shadowOpacity * 0.45})`;
        ctx.shadowBlur = shadowBlur * 0.35;
        ctx.shadowOffsetY = shadowOffsetY * 0.15;
    }
    ctx.drawImage(image, -w / 2, -h / 2, w, h);
    ctx.restore();
}

function drawTextStack(
    ctx: CanvasRenderingContext2D,
    document: EditorialDocument,
    zone: LayoutZone,
) {
    const theme = document.theme;
    const items = composeTextStack(document, zone);
    const align = alignOf(zone);

    for (const item of items) {
        if (item.type === "kicker") {
            ctx.fillStyle = theme.accent;
            ctx.font = `600 ${document.typography.kickerSize}px ${bodyFamily(document.fonts.body)}`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0.28em";
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                item.text.toUpperCase(),
                item.x,
                item.y,
                item.w,
                document.typography.kickerSize * 1.3,
                align,
                2,
            );
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
        } else if (item.type === "title") {
            ctx.fillStyle = theme.text;
            ctx.font = `${document.typography.titleWeight} ${item.fontSize}px ${headingFamily(document.fonts.heading)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                item.uppercase ? item.text.toUpperCase() : item.text,
                item.x,
                item.y,
                item.w,
                item.fontSize * document.typography.titleLineHeight,
                align,
                8,
            );
        } else if (item.type === "rule") {
            ctx.fillStyle = theme.gold;
            ctx.globalAlpha = 0.85;
            ctx.fillRect(item.x, item.y, item.w, item.h);
            ctx.globalAlpha = 1;
        } else if (item.type === "subtitle") {
            ctx.fillStyle = theme.textMuted;
            ctx.font = `italic 500 ${document.typography.bodySize + 2}px ${headingFamily(document.fonts.heading)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                item.text,
                item.x,
                item.y,
                item.w,
                (document.typography.bodySize + 2) * 1.35,
                align,
                3,
            );
        } else if (item.type === "body") {
            ctx.fillStyle = theme.textMuted;
            ctx.font = `400 ${document.typography.bodySize}px ${bodyFamily(document.fonts.body)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                item.text,
                item.x,
                item.y,
                item.w,
                document.typography.bodySize * 1.48,
                align,
                6,
            );
        } else if (item.type === "cta") {
            ctx.fillStyle = theme.accent;
            ctx.font = `500 ${document.typography.ctaSize}px ${bodyFamily(document.fonts.body)}`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0.22em";
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                item.text.toUpperCase(),
                item.x,
                item.y,
                item.w,
                document.typography.ctaSize * 1.3,
                align,
                1,
            );
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
            const ruleX =
                align === "center" ? item.x + item.w / 2 - 24 : align === "right" ? item.x + item.w - 48 : item.x;
            ctx.fillStyle = theme.gold;
            ctx.fillRect(ruleX, item.y + document.typography.ctaSize + 10, 48, 1);
        } else if (item.type === "mark") {
            ctx.save();
            ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
            ctx.rotate(Math.PI / 4);
            ctx.strokeStyle = theme.gold;
            ctx.lineWidth = 1;
            ctx.strokeRect(-5, -5, 10, 10);
            ctx.restore();
        }
    }
}

export async function renderEditorialToCanvas(
    document: EditorialDocument,
    options: { scale: StudioExportScale; authHeaders?: HeadersInit },
): Promise<HTMLCanvasElement> {
    const { width, height } = canvasSize(document.format);
    const scale = options.scale;
    const canvas = window.document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const layout = getLayout(document.layoutId);
    const theme = document.theme;

    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    const assetSrc =
        document.asset.url ??
        editorialPlaceholderSrc(document.asset.category, layout.assetTreatment);
    const assetImage = await loadImage(assetSrc, options.authHeaders);
    const logoImage = await loadImage(logoSrc(document.logo.variant), options.authHeaders);
    const hero = layout.heroBleed || layout.assetTreatment === "hero";

    if (hero && assetImage) {
        drawAsset(ctx, document, assetImage, true);
    }

    for (const zone of layout.zones) {
        if (zone.type === "overlay") {
            if (layout.overlayStyle === "gradient") {
                const gradient = ctx.createLinearGradient(
                    zone.rect.x,
                    zone.rect.y + zone.rect.h,
                    zone.rect.x,
                    zone.rect.y,
                );
                gradient.addColorStop(0, theme.background);
                gradient.addColorStop(0.46, theme.overlay);
                gradient.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(zone.rect.x, zone.rect.y, zone.rect.w, zone.rect.h);
            } else {
                ctx.fillStyle = theme.overlay;
                ctx.globalAlpha = zone.opacity ?? 0.86;
                ctx.fillRect(zone.rect.x, zone.rect.y, zone.rect.w, zone.rect.h);
                ctx.globalAlpha = 1;
            }
        }
    }

    if (!hero && assetImage) {
        drawAsset(ctx, document, assetImage, false);
    }

    for (const zone of layout.zones) {
        if (zone.type === "text-stack") {
            drawTextStack(ctx, document, zone);
            continue;
        }

        if (zone.type === "cta" && layout.showCta && document.content.cta) {
            ctx.fillStyle = theme.accent;
            ctx.font = `500 ${document.typography.ctaSize}px ${bodyFamily(document.fonts.body)}`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0.22em";
            ctx.textBaseline = "middle";
            drawWrapped(
                ctx,
                document.content.cta.toUpperCase(),
                zone.rect.x,
                zone.rect.y + zone.rect.h / 2 - document.typography.ctaSize / 2,
                zone.rect.w,
                document.typography.ctaSize * 1.3,
                alignOf(zone),
                1,
            );
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
            continue;
        }

        if (zone.type === "points") {
            const points = document.content.points.filter(
                (point) => point.heading.trim() || point.body.trim(),
            );
            const columns = zone.columns ?? (layout.pointsStyle === "grid" ? 2 : 1);
            const isGrid = layout.pointsStyle === "grid" || columns > 1;
            const colW = zone.rect.w / columns;
            const rows = Math.ceil(points.length / columns);
            const rowH = zone.rect.h / Math.max(rows, 1);

            for (let i = 0; i < points.length; i += 1) {
                const point = points[i];
                const col = i % columns;
                const row = Math.floor(i / columns);
                const x = zone.rect.x + col * colW;
                const y = zone.rect.y + row * rowH;
                ctx.strokeStyle = `${theme.gold}33`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y + 8);
                ctx.lineTo(x + colW - 16, y + 8);
                ctx.stroke();

                ctx.fillStyle = theme.gold;
                ctx.font = `500 ${isGrid ? 32 : 42}px ${headingFamily(document.fonts.heading)}`;
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                ctx.fillText(point.number, x, y + 22);

                const textX = x + (isGrid ? 110 : 100);
                if (isGrid) {
                    try {
                        const icon = await loadSvgAsImage(
                            studioIconSvg(point.icon as StudioIconKey, theme.gold, 20, 1.6),
                        );
                        ctx.drawImage(icon, x + 78, y + 28, 18, 18);
                    } catch {
                        // decorative
                    }
                }

                ctx.fillStyle = theme.text;
                ctx.font = `600 ${isGrid ? 15 : 16}px ${bodyFamily(document.fonts.body)}`;
                ctx.fillText(point.heading.toUpperCase(), textX, y + 26);
                ctx.fillStyle = theme.textMuted;
                ctx.font = `400 16px ${bodyFamily(document.fonts.body)}`;
                drawWrapped(
                    ctx,
                    point.body,
                    textX,
                    y + 52,
                    colW - (textX - x) - 16,
                    22,
                    "left",
                    3,
                );
            }
            continue;
        }

        if (zone.type === "logo") {
            const size = document.logo.size;
            ctx.globalAlpha = document.logo.opacity;
            const x =
                zone.align === "center"
                    ? zone.rect.x + (zone.rect.w - size) / 2
                    : zone.align === "right"
                      ? zone.rect.x + zone.rect.w - size
                      : zone.rect.x;
            if (logoImage) {
                const ratio = logoImage.naturalHeight / logoImage.naturalWidth || 0.4;
                ctx.drawImage(logoImage, x, zone.rect.y, size, size * ratio);
            } else {
                ctx.fillStyle = theme.gold;
                ctx.font = `500 13px ${bodyFamily(document.fonts.body)}`;
                ctx.textAlign = alignOf(zone);
                ctx.textBaseline = "middle";
                const tx =
                    zone.align === "center" ? zone.rect.x + zone.rect.w / 2 : zone.rect.x;
                ctx.fillText(document.logo.wordmark, tx, zone.rect.y + zone.rect.h / 2);
            }
            ctx.globalAlpha = 1;
            continue;
        }

        if (zone.type === "footer") {
            drawFooter(ctx, document, zone);
        }
    }

    if (layout.showFrame) {
        ctx.strokeStyle = theme.border;
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = STUDIO_TOKENS.frame.thickness;
        ctx.strokeRect(
            STUDIO_TOKENS.frame.inset,
            STUDIO_TOKENS.frame.inset,
            width - STUDIO_TOKENS.frame.inset * 2,
            height - STUDIO_TOKENS.frame.inset * 2,
        );
        ctx.globalAlpha = 1;
    }

    if (layout.showVignette) {
        const vignette = ctx.createRadialGradient(
            width / 2,
            height / 2,
            width * 0.2,
            width / 2,
            height / 2,
            width * 0.78,
        );
        vignette.addColorStop(0, "rgba(36,26,20,0)");
        vignette.addColorStop(1, "rgba(36,26,20,0.28)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
    }

    if (!zoneOf(layout, "logo") && logoImage) {
        ctx.globalAlpha = document.logo.opacity;
        ctx.drawImage(logoImage, 64, height - 80, document.logo.size, document.logo.size * 0.4);
        ctx.globalAlpha = 1;
    }

    return canvas;
}

export async function exportEditorialDocument(
    document: EditorialDocument,
    options: ExportStudioOptions,
): Promise<void> {
    const canvas = await renderEditorialToCanvas(document, {
        scale: options.scale,
        authHeaders: options.authHeaders,
    });
    const mime =
        options.format === "jpeg"
            ? "image/jpeg"
            : options.format === "webp"
              ? "image/webp"
              : "image/png";
    const quality = options.format === "png" ? 1 : 0.96;
    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mime, quality),
    );
    if (!blob) throw new Error("Could not encode the export");

    const name = `${options.fileName ?? resolveStudioExportFileName(document)}.${options.format}`;
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = name;
    window.document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
