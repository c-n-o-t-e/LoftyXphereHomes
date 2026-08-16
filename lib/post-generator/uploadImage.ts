/**
 * Turn a user-picked File into a canvas-safe data URL.
 * Resizes so Instagram export stays reliable on phone + desktop.
 */

const MAX_EDGE = 2400;
const JPEG_QUALITY = 0.88;

function loadFileAsImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read that image"));
        };
        img.src = url;
    });
}

export async function fileToExportableDataUrl(file: File): Promise<string> {
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) {
        throw new Error("Please choose a JPG, PNG, or WEBP photo");
    }

    // HEIC from iPhone cameras often won't decode in browsers
    if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
        throw new Error(
            "HEIC photos aren’t supported here — in Photos, share as JPG, or retake/export as JPEG",
        );
    }

    const img = await loadFileAsImage(file);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w < 1 || h < 1) throw new Error("That image looks empty");

    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported in this browser");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, tw, th);

    // Prefer JPEG for photos (much smaller than PNG data URLs)
    const preferPng = file.type === "image/png" || file.type === "image/gif";
    const dataUrl = preferPng
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", JPEG_QUALITY);

    if (!dataUrl.startsWith("data:image/")) {
        throw new Error("Could not prepare that image for download");
    }
    return dataUrl;
}
