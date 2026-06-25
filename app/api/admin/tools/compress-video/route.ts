import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    HERO_VIDEO_MAX_BYTES,
    VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC,
    VIDEO_COMPRESS_TOOL_MAX_INPUT_BYTES,
} from "@/lib/videos/constants";
import { compressVideoForUpload } from "@/lib/videos/compressForUpload";

export const maxDuration = 300;

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

function isCompressToolEnabled() {
    return process.env.ENABLE_VIDEO_COMPRESS_TOOL === "true";
}

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function POST(request: NextRequest) {
    if (!isCompressToolEnabled()) {
        return NextResponse.json(
            { error: "Video compress tool is disabled." },
            { status: 404 },
        );
    }

    try {
        await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json(
            { error: "Could not read upload. Run this tool locally for large files." },
            { status: 400 },
        );
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Missing video file." }, { status: 400 });
    }

    if (file.size > VIDEO_COMPRESS_TOOL_MAX_INPUT_BYTES) {
        return NextResponse.json(
            {
                error: `File exceeds ${Math.round(VIDEO_COMPRESS_TOOL_MAX_INPUT_BYTES / (1024 * 1024))}MB tool limit.`,
            },
            { status: 400 },
        );
    }

    try {
        const input = Buffer.from(await file.arrayBuffer());
        const result = await compressVideoForUpload(input, {
            mimeType: file.type || undefined,
            fileName: file.name,
        });

        const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
        const downloadName = `${baseName}-compressed.mp4`;

        return new NextResponse(new Uint8Array(result.buffer), {
            status: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": `attachment; filename="${downloadName}"`,
                "X-Compressed-Bytes": String(result.bytes),
                "X-Upload-Limit-Bytes": String(HERO_VIDEO_MAX_BYTES),
                "X-Output-Width": String(result.outputWidth),
                "X-Output-Crf": String(result.crf),
            },
        });
    } catch (err) {
        console.error("Video compress failed:", err);
        return routeErrorResponse(err);
    }
}

export async function GET() {
    if (!isCompressToolEnabled()) {
        return NextResponse.json({ enabled: false });
    }

    return NextResponse.json({
        enabled: true,
        maxInputMb: Math.round(VIDEO_COMPRESS_TOOL_MAX_INPUT_BYTES / (1024 * 1024)),
        maxDurationSec: VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC,
        uploadLimitMb: Math.round(HERO_VIDEO_MAX_BYTES / (1024 * 1024)),
        targetOutputMb: Math.round(
            (HERO_VIDEO_MAX_BYTES * 0.92) / (1024 * 1024),
        ),
    });
}
