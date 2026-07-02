"use client";

import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { getFlyerDimensions } from "@/lib/flyers/dimensions";
import {
    resolveColorToRgb,
    sanitizeFlyerExportClone,
} from "@/lib/flyers/exportSanitize";
import type { FlyerPageSize, FlyerSide } from "@/lib/flyers/types";

const FLYER_FONTS_HREF =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&display=swap";

const FLYER_FONTS_LINK_ID = "flyer-export-fonts";

function waitForImage(img: HTMLImageElement): Promise<void> {
    if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const done = () => {
            img.removeEventListener("load", done);
            img.removeEventListener("error", done);
            resolve();
        };
        img.addEventListener("load", done);
        img.addEventListener("error", done);
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

function ensureFlyerFontsLoaded(): Promise<void> {
    if (typeof document === "undefined") {
        return Promise.resolve();
    }

    let link = document.getElementById(FLYER_FONTS_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement("link");
        link.id = FLYER_FONTS_LINK_ID;
        link.rel = "stylesheet";
        link.href = FLYER_FONTS_HREF;
        document.head.appendChild(link);
    }

    return new Promise((resolve) => {
        if (link!.sheet) {
            resolve();
            return;
        }
        link!.addEventListener("load", () => resolve(), { once: true });
        link!.addEventListener("error", () => resolve(), { once: true });
    });
}

async function fetchImageBlob(src: string, authHeaders?: HeadersInit): Promise<Blob | null> {
    try {
        const response = await fetch(src, { mode: "cors", cache: "no-cache" });
        if (response.ok) {
            return response.blob();
        }
    } catch {
        // fall through to proxy
    }

    try {
        const proxyUrl = `/api/admin/flyers/image-proxy?url=${encodeURIComponent(src)}`;
        const response = await fetch(proxyUrl, {
            cache: "no-cache",
            headers: authHeaders,
        });
        if (response.ok) {
            return response.blob();
        }
    } catch {
        return null;
    }

    return null;
}

async function inlineExternalImages(page: HTMLElement, authHeaders?: HeadersInit): Promise<void> {
    const images = page.querySelectorAll<HTMLImageElement>("img");

    await Promise.all(
        Array.from(images).map(async (img) => {
            const src = img.currentSrc || img.src;
            if (!src || src.startsWith("data:")) {
                await waitForImage(img);
                return;
            }

            const blob = await fetchImageBlob(src, authHeaders);
            if (blob) {
                img.src = await blobToDataUrl(blob);
            }
            await waitForImage(img);
        }),
    );
}

async function waitForQrCode(page: HTMLElement): Promise<void> {
    const deadline = Date.now() + 8000;

    while (Date.now() < deadline) {
        const qrImg = page.querySelector<HTMLImageElement>('img[alt="Scan to book"]');
        if (qrImg?.src.startsWith("data:")) {
            await waitForImage(qrImg);
            return;
        }
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 80);
        });
    }
}

async function waitForPaint(): Promise<void> {
    await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });
}

function isCanvasMostlyBlank(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0 || canvas.height === 0) {
        return true;
    }

    const points = [
        [0.5, 0.5],
        [0.1, 0.1],
        [0.9, 0.1],
        [0.1, 0.9],
        [0.9, 0.9],
    ] as const;

    let nonWhite = 0;

    for (const [xRatio, yRatio] of points) {
        const x = Math.min(canvas.width - 1, Math.floor(canvas.width * xRatio));
        const y = Math.min(canvas.height - 1, Math.floor(canvas.height * yRatio));
        const [r, g, b, a] = ctx.getImageData(x, y, 1, 1).data;
        const isWhite = a < 8 || (r > 250 && g > 250 && b > 250);
        if (!isWhite) {
            nonWhite += 1;
        }
    }

    return nonWhite === 0;
}

async function preparePageForCapture(
    page: HTMLElement,
    authHeaders?: HeadersInit,
): Promise<string> {
    await ensureFlyerFontsLoaded();
    if (document.fonts?.ready) {
        await document.fonts.ready;
    }

    await waitForQrCode(page);
    await inlineExternalImages(page, authHeaders);
    await waitForPaint();

    const style = getComputedStyle(page);
    const backgroundColor = resolveColorToRgb(
        style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)"
            ? style.backgroundColor
            : "#ffffff",
    );

    const width = page.offsetWidth;
    const height = page.offsetHeight;

    if (width <= 0 || height <= 0) {
        throw new Error("Flyer page is not rendered at export size. Try again after the preview loads.");
    }

    return backgroundColor;
}

async function capturePageWithHtmlToImage(
    element: HTMLElement,
    backgroundColor: string,
): Promise<string> {
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    return toPng(element, {
        cacheBust: true,
        skipFonts: false,
        backgroundColor,
        pixelRatio: 1,
        width,
        height,
    });
}

async function capturePage(element: HTMLElement, backgroundColor: string): Promise<string> {
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor,
            scale: 1,
            useCORS: true,
            allowTaint: false,
            logging: false,
            width,
            height,
            windowWidth: width,
            windowHeight: height,
            scrollX: 0,
            scrollY: 0,
            imageTimeout: 15000,
            onclone: (clonedDocument, clonedElement) => {
                sanitizeFlyerExportClone(clonedDocument, element, clonedElement);
            },
        });

        if (!isCanvasMostlyBlank(canvas)) {
            return canvas.toDataURL("image/png");
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (
            !message.includes("lab") &&
            !message.includes("oklch") &&
            !message.includes("lch") &&
            !message.includes("color function")
        ) {
            throw err;
        }
    }

    const dataUrl = await capturePageWithHtmlToImage(element, backgroundColor);
    if (dataUrl.length < 5000) {
        throw new Error(
            "Export produced a blank image. Ensure flyer photos are loaded, then try again.",
        );
    }

    return dataUrl;
}

export async function exportFlyerPages(args: {
    container: HTMLElement;
    pageSize: FlyerPageSize;
    format: "pdf" | "png" | "jpeg";
    side: FlyerSide | "both";
    fileName: string;
    authHeaders?: HeadersInit;
}) {
    const dims = getFlyerDimensions(args.pageSize);
    const pages = Array.from(
        args.container.querySelectorAll<HTMLElement>("[data-flyer-page]"),
    );

    const front = pages.find((el) => el.dataset.flyerPage === "front");
    const back = pages.find((el) => el.dataset.flyerPage === "back");

    const selected = (
        args.side === "both" ? [front, back] : [args.side === "front" ? front : back]
    ).filter((page): page is HTMLElement => Boolean(page));

    if (selected.length === 0) {
        throw new Error("No flyer pages found to export");
    }

    if (args.format === "png" || args.format === "jpeg") {
        for (const page of selected) {
            const backgroundColor = await preparePageForCapture(page, args.authHeaders);
            const pngDataUrl = await capturePage(page, backgroundColor);

            const link = document.createElement("a");
            link.download = `${args.fileName}-${page.dataset.flyerPage}.${args.format === "jpeg" ? "jpg" : "png"}`;
            link.href =
                args.format === "jpeg"
                    ? await pngToJpegDataUrl(pngDataUrl, 0.95)
                    : pngDataUrl;
            link.click();
        }
        return;
    }

    const orientation = dims.widthMm > dims.heightMm ? "landscape" : "portrait";
    const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: [dims.widthMm, dims.heightMm],
        compress: true,
    });

    for (let index = 0; index < selected.length; index += 1) {
        const page = selected[index]!;
        const backgroundColor = await preparePageForCapture(page, args.authHeaders);
        const dataUrl = await capturePage(page, backgroundColor);

        if (index > 0) {
            pdf.addPage([dims.widthMm, dims.heightMm], orientation);
        }
        pdf.addImage(dataUrl, "PNG", 0, 0, dims.widthMm, dims.heightMm, undefined, "SLOW");
    }

    pdf.save(`${args.fileName}.pdf`);
}

async function pngToJpegDataUrl(pngDataUrl: string, quality: number): Promise<string> {
    const image = await loadImage(pngDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return pngDataUrl;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL("image/jpeg", quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
