import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import sharp from "sharp";
import {
    ALLOWED_HERO_VIDEO_MIME_TYPES,
    HERO_VIDEO_MAX_BYTES,
    HERO_VIDEO_MAX_DURATION_SEC,
    HERO_VIDEO_VARIANTS,
} from "./constants";
import { probeVideoDurationSec, runFfmpeg } from "./ffmpeg";
import type { ProcessedHeroVideoResult, ProcessedHeroVideoVariant } from "./types";

export type ValidateHeroVideoInputResult =
    | { ok: true; mimeType: string }
    | { ok: false; error: string };

export function validateHeroVideoUpload(args: {
    buffer: Buffer;
    mimeType?: string;
    fileName?: string;
}): ValidateHeroVideoInputResult {
    const mimeType =
        args.mimeType?.toLowerCase().split(";")[0]?.trim() ??
        guessMimeFromName(args.fileName) ??
        "";

    if (mimeType && !ALLOWED_HERO_VIDEO_MIME_TYPES.has(mimeType)) {
        return {
            ok: false,
            error: "Unsupported video type. Upload MP4, WebM, or MOV.",
        };
    }

    if (args.buffer.length === 0) {
        return { ok: false, error: "Video file is empty." };
    }

    if (args.buffer.length > HERO_VIDEO_MAX_BYTES) {
        return {
            ok: false,
            error: `Video exceeds maximum size of ${Math.round(HERO_VIDEO_MAX_BYTES / (1024 * 1024))}MB.`,
        };
    }

    return { ok: true, mimeType: mimeType || "video/mp4" };
}

function guessMimeFromName(fileName?: string) {
    const lower = fileName?.toLowerCase() ?? "";
    if (lower.endsWith(".mp4")) return "video/mp4";
    if (lower.endsWith(".webm")) return "video/webm";
    if (lower.endsWith(".mov")) return "video/quicktime";
    return undefined;
}

async function transcodeMp4(args: {
    inputPath: string;
    outputPath: string;
    maxWidth: number;
    crf: number;
    maxRateKbps: number;
}) {
    const scale = `scale='min(${args.maxWidth},iw)':-2`;
    await runFfmpeg([
        "-y",
        "-i",
        args.inputPath,
        "-an",
        "-vf",
        scale,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        String(args.crf),
        "-maxrate",
        `${args.maxRateKbps}k`,
        "-bufsize",
        `${args.maxRateKbps * 2}k`,
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        "-t",
        String(HERO_VIDEO_MAX_DURATION_SEC),
        args.outputPath,
    ]);
}

async function extractPosterWebp(inputPath: string, outputPath: string) {
    const framePath = outputPath.replace(/\.webp$/, ".jpg");
    await runFfmpeg([
        "-y",
        "-ss",
        "00:00:00.500",
        "-i",
        inputPath,
        "-vframes",
        "1",
        "-q:v",
        "2",
        framePath,
    ]);

    const frame = await readFile(framePath);
    const poster = await sharp(frame)
        .resize({
            width: HERO_VIDEO_VARIANTS.poster.width,
            withoutEnlargement: true,
        })
        .webp({ quality: HERO_VIDEO_VARIANTS.poster.quality })
        .toBuffer();

    await writeFile(outputPath, poster);
    await rm(framePath, { force: true });
    return poster;
}

function assertMaxBytes(buffer: Buffer, maxBytes: number, label: string) {
    if (buffer.length > maxBytes) {
        throw new Error(
            `${label} is still too large after compression (${Math.round(buffer.length / 1024)}KB). Try a shorter clip.`,
        );
    }
}

export async function processHeroVideo(input: Buffer): Promise<ProcessedHeroVideoResult> {
    const workDir = join(tmpdir(), `hero-video-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, "source.bin");
    const mobilePath = join(workDir, HERO_VIDEO_VARIANTS.mobile.fileName);
    const desktopPath = join(workDir, HERO_VIDEO_VARIANTS.desktop.fileName);
    const posterPath = join(workDir, HERO_VIDEO_VARIANTS.poster.fileName);

    try {
        await writeFile(inputPath, input);

        const duration = await probeVideoDurationSec(inputPath);
        if (duration > HERO_VIDEO_MAX_DURATION_SEC + 1) {
            throw new Error(
                `Hero videos must be ${HERO_VIDEO_MAX_DURATION_SEC} seconds or shorter.`,
            );
        }

        await transcodeMp4({
            inputPath,
            outputPath: mobilePath,
            maxWidth: HERO_VIDEO_VARIANTS.mobile.maxWidth,
            crf: HERO_VIDEO_VARIANTS.mobile.crf,
            maxRateKbps: HERO_VIDEO_VARIANTS.mobile.maxRateKbps,
        });
        await transcodeMp4({
            inputPath,
            outputPath: desktopPath,
            maxWidth: HERO_VIDEO_VARIANTS.desktop.maxWidth,
            crf: HERO_VIDEO_VARIANTS.desktop.crf,
            maxRateKbps: HERO_VIDEO_VARIANTS.desktop.maxRateKbps,
        });
        const posterBuffer = await extractPosterWebp(inputPath, posterPath);

        const mobileBuffer = await readFile(mobilePath);
        const desktopBuffer = await readFile(desktopPath);

        assertMaxBytes(
            mobileBuffer,
            HERO_VIDEO_VARIANTS.mobile.maxBytes,
            "Mobile video",
        );
        assertMaxBytes(
            desktopBuffer,
            HERO_VIDEO_VARIANTS.desktop.maxBytes,
            "Desktop video",
        );
        assertMaxBytes(
            posterBuffer,
            HERO_VIDEO_VARIANTS.poster.maxBytes,
            "Poster image",
        );

        const variants: ProcessedHeroVideoVariant[] = [
            {
                name: "mobile",
                buffer: mobileBuffer,
                contentType: "video/mp4",
                bytes: mobileBuffer.length,
            },
            {
                name: "desktop",
                buffer: desktopBuffer,
                contentType: "video/mp4",
                bytes: desktopBuffer.length,
            },
            {
                name: "poster",
                buffer: posterBuffer,
                contentType: "image/webp",
                bytes: posterBuffer.length,
            },
        ];

        return { variants };
    } finally {
        await rm(workDir, { recursive: true, force: true });
    }
}
