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
    const [mobileFile, setMobileFile] = useState<File | null>(null);
    const [desktopFile, setDesktopFile] = useState<File | null>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const desktopInputRef = useRef<HTMLInputElement>(null);

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

    const onUpload = async () => {
        if (!mobileFile || !desktopFile) {
            setError("Choose both a mobile and a desktop video before uploading.");
            return;
        }

        setIsUploading(true);
        setError(null);
        try {
            const headers = await authHeaders();
            const uploaded = await uploadHeroVideoDirect({
                mobileFile,
                desktopFile,
                authHeaders: headers,
            });
            setHeroVideo(uploaded);
            setMobileFile(null);
            setDesktopFile(null);
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

    const canUpload = Boolean(mobileFile && desktopFile) && !isUploading && !isDeleting;

    return (
        <div className="space-y-6">
            <Card className="p-6 space-y-4">
                <div>
                    <h2 className="font-semibold text-gray-900">Upload hero loops</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload separate MP4, WebM, or MOV clips for desktop and mobile
                        (max 12 seconds each). We compress each clip and generate a
                        poster from the desktop video — originals are not stored.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label
                            htmlFor="hero-desktop-upload"
                            className="text-sm font-medium text-gray-900"
                        >
                            Desktop video
                        </label>
                        <input
                            ref={desktopInputRef}
                            id="hero-desktop-upload"
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
                            onChange={(e) => {
                                setDesktopFile(e.target.files?.[0] ?? null);
                                setError(null);
                            }}
                        />
                        {desktopFile ? (
                            <p className="text-xs text-gray-500">{desktopFile.name}</p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="hero-mobile-upload"
                            className="text-sm font-medium text-gray-900"
                        >
                            Mobile video
                        </label>
                        <input
                            ref={mobileInputRef}
                            id="hero-mobile-upload"
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-900 hover:file:bg-gray-200"
                            onChange={(e) => {
                                setMobileFile(e.target.files?.[0] ?? null);
                                setError(null);
                            }}
                        />
                        {mobileFile ? (
                            <p className="text-xs text-gray-500">{mobileFile.name}</p>
                        ) : null}
                    </div>
                </div>

                <Button
                    type="button"
                    disabled={!canUpload}
                    onClick={() => void onUpload()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing videos…
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            {heroVideo ? "Replace hero videos" : "Upload hero videos"}
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Desktop</p>
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                                <video
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster={heroVideo.posterUrl}
                                >
                                    <source
                                        src={heroVideo.desktopMp4Url}
                                        type="video/mp4"
                                    />
                                </video>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Mobile</p>
                            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                                <video
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster={heroVideo.posterUrl}
                                >
                                    <source
                                        src={heroVideo.mobileMp4Url}
                                        type="video/mp4"
                                    />
                                </video>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <p className="text-sm text-gray-600">
                        No hero video yet. Upload desktop and mobile clips to show a
                        looping background on the homepage.
                    </p>
                </Card>
            )}
        </div>
    );
}
