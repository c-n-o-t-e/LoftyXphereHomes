"use client";

import type { CSSProperties } from "react";
import type { PostImageControls } from "@/lib/post-generator/types";

type ImageCanvasProps = {
    image: PostImageControls;
    className?: string;
    style?: CSSProperties;
};

export function ImageCanvas({ image, className, style }: ImageCanvasProps) {
    const scale = image.scale * image.zoom;
    const filter = [
        `brightness(${image.brightness}%)`,
        `contrast(${image.contrast}%)`,
        `saturate(${image.saturation}%)`,
        image.blur > 0 ? `blur(${image.blur}px)` : null,
    ]
        .filter(Boolean)
        .join(" ");

    const inset = {
        top: `${image.cropTop}%`,
        right: `${image.cropRight}%`,
        bottom: `${image.cropBottom}%`,
        left: `${image.cropLeft}%`,
    };

    return (
        <div
            className={className}
            style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: image.borderRadius,
                boxShadow:
                    image.shadow > 0
                        ? `0 ${image.shadow / 2}px ${image.shadow}px rgba(0,0,0,0.25)`
                        : undefined,
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    ...inset,
                    overflow: "hidden",
                }}
            >
                {image.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={image.url}
                        alt=""
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: `${image.positionX}% ${image.positionY}%`,
                            transform: `translate(${image.panX}px, ${image.panY}px) scale(${scale})`,
                            transformOrigin: "center center",
                            filter,
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background:
                                "linear-gradient(145deg, #d9d0c3 0%, #efe8dc 45%, #cfc4b4 100%)",
                            display: "grid",
                            placeItems: "center",
                            color: "#7a7268",
                            fontFamily: '"Manrope", sans-serif',
                            fontSize: 18,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        Upload a photo
                    </div>
                )}
            </div>
        </div>
    );
}
