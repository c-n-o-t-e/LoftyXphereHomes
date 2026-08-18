"use client";

import { logoSrc } from "@/lib/content-studio/brand-theme";
import { getLayout, zoneOf, type LayoutZone } from "@/lib/content-studio/layouts";
import { canvasSize } from "@/lib/content-studio/layout-engine";
import { loadSvgAsImage, studioIconSvg } from "@/lib/content-studio/icons";
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
    ctx.font = `500 15px ${bodyFamily(document.fonts.body)}`;
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

    if (layout.showFrame) {
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = STUDIO_TOKENS.frame.thickness;
        ctx.strokeRect(
            STUDIO_TOKENS.frame.inset,
            STUDIO_TOKENS.frame.inset,
            width - STUDIO_TOKENS.frame.inset * 2,
            height - STUDIO_TOKENS.frame.inset * 2,
        );
    }

    const assetImage = document.asset.url
        ? await loadImage(document.asset.url, options.authHeaders)
        : null;
    const logoImage = await loadImage(logoSrc(document.logo.variant), options.authHeaders);

    for (const zone of layout.zones) {
        if (zone.type === "overlay") {
            ctx.fillStyle = theme.overlay;
            ctx.globalAlpha = zone.opacity ?? 0.86;
            ctx.fillRect(zone.rect.x, zone.rect.y, zone.rect.w, zone.rect.h);
            ctx.globalAlpha = 1;
            continue;
        }

        if (zone.type === "asset" && assetImage) {
            const w = document.asset.width * document.asset.scale;
            const h = document.asset.height * document.asset.scale;
            ctx.save();
            ctx.translate(document.asset.x, document.asset.y);
            ctx.rotate((document.asset.rotation * Math.PI) / 180);
            if (document.asset.shadow > 0 && !layout.heroBleed) {
                ctx.shadowColor = "rgba(36,26,20,0.22)";
                ctx.shadowBlur = document.asset.shadow;
                ctx.shadowOffsetY = document.asset.shadow * 0.35;
            }
            ctx.drawImage(assetImage, -w / 2, -h / 2, w, h);
            ctx.restore();
            continue;
        }

        if (zone.type === "kicker" && document.content.kicker) {
            ctx.fillStyle = theme.accent;
            ctx.font = `600 ${document.typography.kickerSize}px ${bodyFamily(document.fonts.body)}`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0.22em";
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                document.content.kicker.toUpperCase(),
                zone.rect.x,
                zone.rect.y,
                zone.rect.w,
                document.typography.kickerSize * 1.3,
                alignOf(zone),
                2,
            );
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0px";
            continue;
        }

        if (zone.type === "title" && document.content.title) {
            ctx.fillStyle = theme.text;
            ctx.font = `${document.typography.titleWeight} ${document.typography.titleSize}px ${headingFamily(document.fonts.heading)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                document.content.title,
                zone.rect.x,
                zone.rect.y,
                zone.rect.w,
                document.typography.titleSize * document.typography.titleLineHeight,
                alignOf(zone),
                7,
            );
            continue;
        }

        if (zone.type === "subtitle" && document.content.subtitle) {
            ctx.fillStyle = theme.textMuted;
            ctx.font = `500 ${document.typography.bodySize}px ${bodyFamily(document.fonts.body)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                document.content.subtitle,
                zone.rect.x,
                zone.rect.y,
                zone.rect.w,
                document.typography.bodySize * 1.4,
                alignOf(zone),
                3,
            );
            continue;
        }

        if (zone.type === "body" && document.content.body) {
            ctx.fillStyle = theme.textMuted;
            ctx.font = `400 ${document.typography.bodySize}px ${bodyFamily(document.fonts.body)}`;
            ctx.textBaseline = "top";
            drawWrapped(
                ctx,
                document.content.body,
                zone.rect.x,
                zone.rect.y,
                zone.rect.w,
                document.typography.bodySize * 1.45,
                alignOf(zone),
                6,
            );
            continue;
        }

        if (zone.type === "cta" && document.content.cta) {
            ctx.fillStyle = theme.accent;
            ctx.font = `500 ${document.typography.ctaSize}px ${bodyFamily(document.fonts.body)}`;
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0.16em";
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
            (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
                "0px";
            continue;
        }

        if (zone.type === "points") {
            const points = document.content.points.filter(
                (point) => point.heading.trim() || point.body.trim(),
            );
            const rowH = zone.rect.h / Math.max(points.length, 1);
            for (let i = 0; i < points.length; i += 1) {
                const point = points[i];
                const y = zone.rect.y + i * rowH;
                ctx.fillStyle = theme.gold;
                ctx.font = `500 22px ${headingFamily(document.fonts.heading)}`;
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                ctx.fillText(point.number, zone.rect.x, y);

                try {
                    const icon = await loadSvgAsImage(
                        studioIconSvg(point.icon as StudioIconKey, theme.gold, 28, 1.6),
                    );
                    ctx.drawImage(icon, zone.rect.x + 70, y + 2, 26, 26);
                } catch {
                    // icon is decorative
                }

                ctx.fillStyle = theme.text;
                ctx.font = `600 20px ${bodyFamily(document.fonts.body)}`;
                ctx.fillText(point.heading.toUpperCase(), zone.rect.x + 110, y);
                ctx.fillStyle = theme.textMuted;
                ctx.font = `400 16px ${bodyFamily(document.fonts.body)}`;
                drawWrapped(
                    ctx,
                    point.body,
                    zone.rect.x + 110,
                    y + 30,
                    zone.rect.w - 130,
                    22,
                    "left",
                    2,
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
            } else if (document.logo.showWordmark || !logoImage) {
                ctx.fillStyle = theme.gold;
                ctx.font = `500 13px ${bodyFamily(document.fonts.body)}`;
                ctx.textAlign = alignOf(zone);
                ctx.textBaseline = "middle";
                const tx =
                    zone.align === "center"
                        ? zone.rect.x + zone.rect.w / 2
                        : zone.rect.x;
                ctx.fillText(document.logo.wordmark, tx, zone.rect.y + zone.rect.h / 2);
            }
            ctx.globalAlpha = 1;
            continue;
        }

        if (zone.type === "footer") {
            drawFooter(ctx, document, zone);
        }
    }

    if (!zoneOf(layout, "logo") && logoImage) {
        ctx.globalAlpha = document.logo.opacity;
        ctx.drawImage(logoImage, 72, height - 80, document.logo.size, document.logo.size * 0.4);
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
