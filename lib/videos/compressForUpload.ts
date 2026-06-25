import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import {
    ALLOWED_HERO_VIDEO_MIME_TYPES,
    VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC,
    VIDEO_COMPRESS_TOOL_TARGET_BYTES,
} from "./constants";
import {
    appendVideoTranscodeArgs,
    estimateVideoBitrateKbps,
    probeHasAudioStream,
    probeVideoDurationSec,
    runFfmpeg,
} from "./ffmpeg";
import { validateVideoUpload } from "./process";

export type CompressVideoForUploadResult = {
    buffer: Buffer;
    bytes: number;
    durationSec: number;
    outputWidth: number;
    crf: number;
    hasAudio: boolean;
};

const WIDTH_STEPS = [1920, 1280, 960] as const;
const CRF_STEPS = [24, 26, 28, 30, 32] as const;

async function transcodeToTarget(args: {
    inputPath: string;
    outputPath: string;
    maxWidth: number;
    crf: number;
    maxDurationSec: number;
    maxRateKbps: number;
    includeAudio: boolean;
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
        "medium",
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
        includeAudio: args.includeAudio,
    });
    ffmpegArgs.push(args.outputPath);

    await runFfmpeg(ffmpegArgs);
}

export async function compressVideoForUpload(
    input: Buffer,
    options?: {
        targetMaxBytes?: number;
        maxDurationSec?: number;
        mimeType?: string;
        fileName?: string;
    },
): Promise<CompressVideoForUploadResult> {
    const targetMaxBytes =
        options?.targetMaxBytes ?? VIDEO_COMPRESS_TOOL_TARGET_BYTES;
    const maxDurationSec =
        options?.maxDurationSec ?? VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC;

    const validation = validateVideoUpload({
        buffer: input,
        mimeType: options?.mimeType,
        fileName: options?.fileName,
        maxBytes: Number.MAX_SAFE_INTEGER,
        allowedMimeTypes: ALLOWED_HERO_VIDEO_MIME_TYPES,
    });
    if (!validation.ok) {
        throw new Error(validation.error);
    }

    const workDir = join(tmpdir(), `video-compress-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });

    const inputPath = join(workDir, "source.bin");
    const outputPath = join(workDir, "compressed.mp4");

    try {
        await writeFile(inputPath, input);

        const durationSec = await probeVideoDurationSec(inputPath);
        if (durationSec > maxDurationSec + 1) {
            throw new Error(
                `Video is ${Math.ceil(durationSec)}s long. Shorten it to ${maxDurationSec}s or less, then try again.`,
            );
        }

        const hasAudio = await probeHasAudioStream(inputPath);
        const effectiveDuration = Math.max(1, Math.min(durationSec, maxDurationSec));
        const maxRateKbps = estimateVideoBitrateKbps({
            targetBytes: targetMaxBytes,
            durationSec: effectiveDuration,
            includeAudio: hasAudio,
        });

        for (const maxWidth of WIDTH_STEPS) {
            for (const crf of CRF_STEPS) {
                await transcodeToTarget({
                    inputPath,
                    outputPath,
                    maxWidth,
                    crf,
                    maxDurationSec,
                    maxRateKbps,
                    includeAudio: hasAudio,
                });

                const buffer = await readFile(outputPath);
                if (buffer.length <= targetMaxBytes) {
                    return {
                        buffer,
                        bytes: buffer.length,
                        durationSec: effectiveDuration,
                        outputWidth: maxWidth,
                        crf,
                        hasAudio,
                    };
                }
            }
        }

        throw new Error(
            `Could not compress below ${Math.round(targetMaxBytes / (1024 * 1024))}MB. Try a shorter clip or trim fast motion sections.`,
        );
    } finally {
        await rm(workDir, { recursive: true, force: true });
    }
}
