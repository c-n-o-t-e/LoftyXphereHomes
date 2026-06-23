"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { uploadHeroVideoDirect } from "@/lib/videos/directUploadClient";
import type { HeroVideoConfig } from "@/lib/videos/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HeroVideoManager() {
    const [heroVideo, setHeroVideo] = useState<HeroVideoConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
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

    const loadHeroVideo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/hero-video", { headers });
            const data = (await res.json()) as {
                heroVideo?: HeroVideoConfig | null;
                error?: string;
            };
            if (!res.ok) throw new Error(data.error ?? "Failed to load hero video");
            setHeroVideo(data.heroVideo ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load hero video");
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        void loadHeroVideo();
    }, [loadHeroVideo]);

    const onUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        try {
            const headers = await authHeaders();
            const uploaded = await uploadHeroVideoDirect({ file, authHeaders: headers });
            setHeroVideo(uploaded);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const onDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const headers = await authHeaders();
            const res = await fetch("/api/admin/hero-video", {
                method: "DELETE",
                headers,
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) throw new Error(data.error ?? "Delete failed");
            setHeroVideo(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-gray-900">Upload hero loop</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload MP4, WebM, or MOV (max 60 seconds). We compress to
                        mobile + desktop MP4 and a poster image — the original is not
                        stored.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void onUpload(file);
                        e.target.value = "";
                    }}
                />

                <Button
                    type="button"
                    disabled={isUploading || isDeleting}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing video…
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            {heroVideo ? "Replace hero video" : "Upload hero video"}
                        </>
                    )}
                </Button>

                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </Card>

            {isLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading current hero video…
                </div>
            ) : heroVideo ? (
                <Card className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h3 className="font-semibold text-gray-900">Current hero</h3>
                            <p className="text-sm text-gray-500">
                                Updated {new Date(heroVideo.updatedAt).toLocaleString()}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="text-red-600"
                            disabled={isDeleting || isUploading}
                            onClick={() => void onDelete()}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                        <video
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            poster={heroVideo.posterUrl}
                        >
                            <source src={heroVideo.desktopMp4Url} type="video/mp4" />
                        </video>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <p className="text-sm text-gray-600">
                        No hero video yet. The homepage uses a gradient until you upload one.
                    </p>
                </Card>
            )}
        </div>
    );
}
