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
        proc.on("close", () => {
            const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
            if (!match) {
                reject(new Error("Could not read video duration."));
                return;
            }
            const hours = Number.parseInt(match[1], 10);
            const minutes = Number.parseInt(match[2], 10);
            const seconds = Number.parseFloat(match[3]);
            resolve(hours * 3600 + minutes * 60 + seconds);
        });
    });
}
