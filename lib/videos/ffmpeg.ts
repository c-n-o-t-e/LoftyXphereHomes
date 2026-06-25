import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

function requireFfmpegPath(): string {
    if (!ffmpegPath) {
        throw new Error(
            "Video processing is unavailable (ffmpeg not found). Contact support.",
        );
    }
    return ffmpegPath;
}

export function runFfmpeg(args: string[]): Promise<void> {
    const bin = requireFfmpegPath();
    return new Promise((resolve, reject) => {
        const proc = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";
        proc.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(stderr.trim() || `ffmpeg exited with code ${code}`));
        });
    });
}

export async function probeVideoDurationSec(inputPath: string): Promise<number> {
    const stderr = await readFfmpegProbeStderr(inputPath);
    const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!match) {
        throw new Error("Could not read video duration.");
    }
    const hours = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);
    const seconds = Number.parseFloat(match[3]);
    return hours * 3600 + minutes * 60 + seconds;
}

export async function probeHasAudioStream(inputPath: string): Promise<boolean> {
    const stderr = await readFfmpegProbeStderr(inputPath);
    return /\bAudio:\s/.test(stderr);
}

async function readFfmpegProbeStderr(inputPath: string): Promise<string> {
    const bin = requireFfmpegPath();
    return new Promise((resolve, reject) => {
        const proc = spawn(
            bin,
            ["-hide_banner", "-i", inputPath, "-f", "null", "-"],
            { stdio: ["ignore", "ignore", "pipe"] },
        );
        let stderr = "";
        proc.stderr?.on("data", (chunk: Buffer) => {
            stderr += chunk.toString();
        });
        proc.on("error", reject);
        proc.on("close", () => resolve(stderr));
    });
}

export const VIDEO_AUDIO_BITRATE_KBPS = 128;

export function estimateVideoBitrateKbps(args: {
    targetBytes: number;
    durationSec: number;
    includeAudio: boolean;
    audioBitrateKbps?: number;
    containerOverheadBytes?: number;
}) {
    const durationSec = Math.max(1, args.durationSec);
    const audioKbps = args.includeAudio
        ? (args.audioBitrateKbps ?? VIDEO_AUDIO_BITRATE_KBPS)
        : 0;
    const audioBytes = (audioKbps * 1000 * durationSec) / 8;
    const overhead = args.containerOverheadBytes ?? 64 * 1024;
    const videoBudgetBytes = Math.max(
        args.targetBytes - audioBytes - overhead,
        args.targetBytes * 0.65,
    );
    const kbps = Math.floor((videoBudgetBytes * 8) / durationSec / 1000);
    return Math.max(600, Math.min(6000, kbps));
}

export function appendVideoTranscodeArgs(args: {
    ffmpegArgs: string[];
    includeAudio: boolean;
    audioBitrateKbps?: number;
}) {
    if (args.includeAudio) {
        args.ffmpegArgs.push(
            "-map",
            "0:v:0",
            "-map",
            "0:a:0?",
            "-c:a",
            "aac",
            "-b:a",
            `${args.audioBitrateKbps ?? VIDEO_AUDIO_BITRATE_KBPS}k`,
            "-ac",
            "2",
        );
        return;
    }

    args.ffmpegArgs.push("-an");
}
