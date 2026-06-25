"use client";

import { useEffect, useRef } from "react";
import type { ApartmentVideoConfig } from "@/lib/videos/types";

interface ApartmentVideoPlayerProps {
    video: ApartmentVideoConfig;
    autoPlay?: boolean;
    className?: string;
    onPlay?: () => void;
    onEnded?: () => void;
}

export function ApartmentVideoPlayer({
    video,
    autoPlay = false,
    className = "h-full w-full object-contain",
    onPlay,
    onEnded,
}: ApartmentVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!autoPlay || !videoRef.current) return;
        void videoRef.current.play().catch(() => {
            // Autoplay may be blocked until user interaction.
        });
    }, [autoPlay, video.desktopMp4Url, video.mobileMp4Url]);

    return (
        <video
            ref={videoRef}
            className={className}
            controls
            playsInline
            preload={autoPlay ? "auto" : "none"}
            poster={video.posterUrl}
            onPlay={onPlay}
            onEnded={onEnded}
        >
            {video.mobileMp4Url ? (
                <source
                    src={video.mobileMp4Url}
                    type="video/mp4"
                    media="(max-width: 768px)"
                />
            ) : null}
            {video.desktopMp4Url ? (
                <source src={video.desktopMp4Url} type="video/mp4" />
            ) : video.mobileMp4Url ? (
                <source src={video.mobileMp4Url} type="video/mp4" />
            ) : null}
        </video>
    );
}
