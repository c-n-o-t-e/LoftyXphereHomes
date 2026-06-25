"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ToolConfig = {
    enabled: boolean;
    maxInputMb?: number;
    maxDurationSec?: number;
    uploadLimitMb?: number;
    targetOutputMb?: number;
};

type CompressResult = {
    blob: Blob;
    fileName: string;
    bytes: number;
    uploadLimitBytes: number;
    outputWidth: number;
    crf: number;
};

export function VideoCompressTool() {
    const [config, setConfig] = useState<ToolConfig | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);
    const [isCompressing, setIsCompressing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CompressResult | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const authHeaders = useCallback(async () => {
        const supabase = getSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error("Not signed in");
        return { Authorization: `Bearer ${token}` };
    }, []);

    useEffect(() => {
        void (async () => {
            setIsLoadingConfig(true);
            try {
                const res = await fetch("/api/admin/tools/compress-video");
                const data = (await res.json()) as ToolConfig;
                setConfig(data);
            } catch {
                setConfig({ enabled: false });
            } finally {
                setIsLoadingConfig(false);
            }
        })();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const formatMb = (bytes: number) =>
        `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const onCompress = async (file: File) => {
        setIsCompressing(true);
        setError(null);
        setResult(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        try {
            const headers = await authHeaders();
            const formData = new FormData();
            formData.set("file", file);

            const res = await fetch("/api/admin/tools/compress-video", {
                method: "POST",
                headers,
                body: formData,
            });

            if (!res.ok) {
                let message = "Compression failed";
                try {
                    const data = (await res.json()) as { error?: string };
                    message = data.error ?? message;
                } catch {
                    message = (await res.text()) || message;
                }
                throw new Error(message);
            }

            const blob = await res.blob();
            const bytes = Number.parseInt(
                res.headers.get("X-Compressed-Bytes") ?? "0",
                10,
            );
            const uploadLimitBytes = Number.parseInt(
                res.headers.get("X-Upload-Limit-Bytes") ?? "0",
                10,
            );
            const outputWidth = Number.parseInt(
                res.headers.get("X-Output-Width") ?? "0",
                10,
            );
            const crf = Number.parseInt(res.headers.get("X-Output-Crf") ?? "0", 10);
            const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
            const fileName = `${baseName}-compressed.mp4`;

            const nextResult: CompressResult = {
                blob,
                fileName,
                bytes: bytes || blob.size,
                uploadLimitBytes: uploadLimitBytes || blob.size,
                outputWidth,
                crf,
            };
            setResult(nextResult);
            setPreviewUrl(URL.createObjectURL(blob));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Compression failed");
        } finally {
            setIsCompressing(false);
        }
    };

    if (isLoadingConfig) {
        return (
            <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tool…
            </div>
        );
    }

    if (!config?.enabled) {
        return (
            <Card className="p-6 space-y-3">
                <h2 className="font-semibold text-gray-900">Tool disabled</h2>
                <p className="text-sm text-gray-600">
                    Set{" "}
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                        ENABLE_VIDEO_COMPRESS_TOOL=true
                    </code>{" "}
                    in your <code className="text-xs">.env</code>, restart the dev
                    server, then reload this page.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-gray-900">
                        Compress for website upload
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Upload your large source file (up to{" "}
                        <strong>{config.maxInputMb} MB</strong>,{" "}
                        <strong>{config.maxDurationSec} seconds</strong> max). We
                        re-encode it to under{" "}
                        <strong>{config.targetOutputMb} MB</strong> so it passes the{" "}
                        <strong>{config.uploadLimitMb} MB</strong> upload limit.
                        Original audio is kept when present. Then upload the downloaded
                        file via <strong>Admin → Hero video</strong> or apartment tour
                        video.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Run this on your local machine (<code>npm run dev</code>) for
                        100 MB+ files — hosted servers often cap request size around 4–10
                        MB.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onCompress(file);
                        e.target.value = "";
                    }}
                />

                <Button
                    type="button"
                    disabled={isCompressing}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isCompressing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Compressing… (may take a minute)
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose video to compress
                        </>
                    )}
                </Button>

                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </Card>

            {result && previewUrl && (
                <Card className="p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">Ready to upload</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Output: {formatMb(result.bytes)} · max width{" "}
                            {result.outputWidth}px · quality preset CRF {result.crf}
                            {result.bytes <= result.uploadLimitBytes
                                ? " · under upload limit"
                                : " · still over limit — try a shorter clip"}
                        </p>
                    </div>

                    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                        <video
                            className="h-full w-full object-contain"
                            controls
                            playsInline
                            src={previewUrl}
                        />
                    </div>

                    <Button asChild>
                        <a href={previewUrl} download={result.fileName}>
                            <Download className="h-4 w-4 mr-2" />
                            Download {result.fileName}
                        </a>
                    </Button>
                </Card>
            )}

            <Card className="p-6 space-y-3 bg-blue-50 border-blue-100">
                <h3 className="font-semibold text-gray-900">Will it still look sharp?</h3>
                <p className="text-sm text-gray-700">
                    Yes, for typical property tour clips. The website does not show your
                    50 MB file — it re-compresses again into a mobile stream (~3 MB) and a
                    desktop stream (~6–8 MB at 1080p). This tool keeps enough quality in
                    the source so that second pass stays clean on phones and laptops.
                </p>
                <p className="text-sm text-gray-700">
                    Tips: keep clips under {config.maxDurationSec} seconds, avoid heavy
                    camera shake, and film in good light. Very fast motion or dark
                    scenes need shorter clips to stay sharp at small file sizes.
                </p>
            </Card>
        </div>
    );
}
