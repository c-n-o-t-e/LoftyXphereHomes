import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import sharp from "sharp";
import {
    ALLOWED_HERO_VIDEO_MIME_TYPES,
    APARTMENT_VIDEO_MAX_BYTES,
    APARTMENT_VIDEO_MAX_DURATION_SEC,
    APARTMENT_VIDEO_VARIANTS,
    HERO_VIDEO_MAX_BYTES,
    HERO_VIDEO_MAX_DURATION_SEC,
    HERO_VIDEO_VARIANTS,
} from "./constants";
import {
    appendVideoTranscodeArgs,
    estimateVideoBitrateKbps,
    probeHasAudioStream,
    probeVideoDurationSec,
    runFfmpeg,
} from "./ffmpeg";
import type { ProcessedHeroVideoResult, ProcessedHeroVideoVariant } from "./types";

export type ValidateVideoInputResult =
    | { ok: true; mimeType: string }
    | { ok: false; error: string };

export type ValidateHeroVideoInputResult = ValidateVideoInputResult;

type VideoVariantConfig = {
    mobile: {
        fileName: string;
        maxWidth: number;
        crf: number;
        maxRateKbps: number;
        maxBytes: number;
    };
    desktop: {
        fileName: string;
        maxWidth: number;
        crf: number;
        maxRateKbps: number;
        maxBytes: number;
    };
    poster: {
        fileName: string;
        width: number;
        quality: number;
        maxBytes: number;
    };
};

export function validateVideoUpload(args: {
    buffer: Buffer;
    mimeType?: string;
    fileName?: string;
    maxBytes?: number;
    allowedMimeTypes?: Set<string>;
}): ValidateVideoInputResult {
    const maxBytes = args.maxBytes ?? HERO_VIDEO_MAX_BYTES;
    const allowedMimeTypes = args.allowedMimeTypes ?? ALLOWED_HERO_VIDEO_MIME_TYPES;
    const mimeType =
        args.mimeType?.toLowerCase().split(";")[0]?.trim() ??
        guessMimeFromName(args.fileName) ??
        "";

    if (mimeType && !allowedMimeTypes.has(mimeType)) {
        return {
            ok: false,
            error: "Unsupported video type. Upload MP4, WebM, or MOV.",
        };
    }

    if (args.buffer.length === 0) {
        return { ok: false, error: "Video file is empty." };
    }

    if (args.buffer.length > maxBytes) {
        return {
            ok: false,
            error: `Video exceeds maximum size of ${Math.round(maxBytes / (1024 * 1024))}MB.`,
        };
    }

    return { ok: true, mimeType: mimeType || "video/mp4" };
}

export function validateHeroVideoUpload(args: {
    buffer: Buffer;
    mimeType?: string;
    fileName?: string;
}): ValidateHeroVideoInputResult {
    return validateVideoUpload(args);
}

export function validateApartmentVideoUpload(args: {
    buffer: Buffer;
    mimeType?: string;
    fileName?: string;
}): ValidateVideoInputResult {
    return validateVideoUpload({
        ...args,
        maxBytes: APARTMENT_VIDEO_MAX_BYTES,
    });
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
    maxDurationSec: number;
    includeAudio?: boolean;
}) {
    const scale = `scale='min(${args.maxWidth},iw)':-2`;
    const ffmpegArgs = [
        "-y",
        "-i",
        args.inputPath,
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
        String(args.maxDurationSec),
    ];

    appendVideoTranscodeArgs({
        ffmpegArgs,
        includeAudio: args.includeAudio ?? false,
    });
    ffmpegArgs.push(args.outputPath);

    await runFfmpeg(ffmpegArgs);
}

async function transcodeMp4ToFit(args: {
    inputPath: string;
    outputPath: string;
    label: string;
    maxWidth: number;
    crf: number;
    maxDurationSec: number;
    durationSec: number;
    includeAudio: boolean;
    maxBytes: number;
}): Promise<Buffer> {
    const widthSteps = [
        args.maxWidth,
        Math.min(args.maxWidth, 960),
        Math.min(args.maxWidth, 720),
    ].filter((value, index, list) => list.indexOf(value) === index);

    const crfSteps = [0, 2, 4, 6, 8].map((step) =>
        Math.min(args.crf + step, 32),
    );

    for (const maxWidth of widthSteps) {
        for (const crf of crfSteps) {
            const maxRateKbps = estimateVideoBitrateKbps({
                targetBytes: args.maxBytes,
                durationSec: args.durationSec,
                includeAudio: args.includeAudio,
            });

            await transcodeMp4({
                inputPath: args.inputPath,
                outputPath: args.outputPath,
                maxWidth,
                crf,
                maxRateKbps,
                maxDurationSec: args.maxDurationSec,
                includeAudio: args.includeAudio,
            });

            const buffer = await readFile(args.outputPath);
            if (buffer.length <= args.maxBytes) {
                return buffer;
            }
        }
    }

    throw new Error(
        `${args.label} is still too large after compression (${Math.round(
            (await readFile(args.outputPath)).length / 1024,
        )}KB). Try a shorter clip.`,
    );
}

async function extractPosterWebp(
    inputPath: string,
    outputPath: string,
    posterConfig: VideoVariantConfig["poster"],
) {
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
            width: posterConfig.width,
            withoutEnlargement: true,
        })
        .webp({ quality: posterConfig.quality })
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

export async function processVideo(
    input: Buffer,
    options: {
        maxDurationSec: number;
        variants: VideoVariantConfig;
        workDirPrefix: string;
        includeAudio?: boolean;
    },
): Promise<ProcessedHeroVideoResult> {
    const workDir = join(tmpdir(), `${options.workDirPrefix}-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, "source.bin");
    const mobilePath = join(workDir, options.variants.mobile.fileName);
    const desktopPath = join(workDir, options.variants.desktop.fileName);
    const posterPath = join(workDir, options.variants.poster.fileName);

    try {
        await writeFile(inputPath, input);

        const duration = await probeVideoDurationSec(inputPath);
        if (duration > options.maxDurationSec + 1) {
            throw new Error(
                `Videos must be ${options.maxDurationSec} seconds or shorter.`,
            );
        }

        const includeAudio = options.includeAudio ?? false;
        const hasAudio = includeAudio && (await probeHasAudioStream(inputPath));
        const effectiveDuration = Math.max(
            1,
            Math.min(duration, options.maxDurationSec),
        );

        const mobileBuffer = await transcodeMp4ToFit({
            inputPath,
            outputPath: mobilePath,
            label: "Mobile video",
            maxWidth: options.variants.mobile.maxWidth,
            crf: options.variants.mobile.crf,
            maxDurationSec: options.maxDurationSec,
            durationSec: effectiveDuration,
            includeAudio: hasAudio,
            maxBytes: options.variants.mobile.maxBytes,
        });
        const desktopBuffer = await transcodeMp4ToFit({
            inputPath,
            outputPath: desktopPath,
            label: "Desktop video",
            maxWidth: options.variants.desktop.maxWidth,
            crf: options.variants.desktop.crf,
            maxDurationSec: options.maxDurationSec,
            durationSec: effectiveDuration,
            includeAudio: hasAudio,
            maxBytes: options.variants.desktop.maxBytes,
        });
        const posterBuffer = await extractPosterWebp(
            inputPath,
            posterPath,
            options.variants.poster,
        );

        assertMaxBytes(
            posterBuffer,
            options.variants.poster.maxBytes,
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

export async function processHeroVideo(input: Buffer): Promise<ProcessedHeroVideoResult> {
    return processVideo(input, {
        maxDurationSec: HERO_VIDEO_MAX_DURATION_SEC,
        variants: HERO_VIDEO_VARIANTS,
        workDirPrefix: "hero-video",
    });
}

export async function processApartmentVideo(
    input: Buffer,
): Promise<ProcessedHeroVideoResult> {
    return processVideo(input, {
        maxDurationSec: APARTMENT_VIDEO_MAX_DURATION_SEC,
        variants: APARTMENT_VIDEO_VARIANTS,
        workDirPrefix: "apartment-video",
        includeAudio: true,
    });
}
