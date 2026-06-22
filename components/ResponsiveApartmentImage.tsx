import Image, { type ImageProps } from "next/image";
import { buildImageSrcSet } from "@/lib/images/urls";
import type { ApartmentImageSet } from "@/lib/images/types";

type ResponsiveApartmentImageProps = Omit<
    ImageProps,
    "src" | "placeholder" | "blurDataURL"
> & {
    image: ApartmentImageSet;
    /** Fallback when srcSet cannot be used (e.g. legacy single-URL sets) */
    variant?: "thumbnail" | "medium" | "large";
};

function pickSrc(
    image: ApartmentImageSet,
    variant: ResponsiveApartmentImageProps["variant"],
) {
    if (variant === "thumbnail") return image.thumbnail || image.medium || image.large;
    if (variant === "medium") return image.medium || image.large || image.thumbnail;
    return image.large || image.medium || image.thumbnail;
}

function hasDistinctVariants(image: ApartmentImageSet) {
    const urls = new Set(
        [image.thumbnail, image.medium, image.large].filter(Boolean),
    );
    return urls.size > 1;
}

export function ResponsiveApartmentImage({
    image,
    variant = "medium",
    sizes,
    alt,
    fill,
    className,
    priority,
    ...props
}: ResponsiveApartmentImageProps) {
    const src = pickSrc(image, variant);
    const blurDataURL = image.blurDataUrl ?? undefined;
    const srcSet = buildImageSrcSet(image);
    const useNativeSrcSet = hasDistinctVariants(image) && srcSet.length > 0;

    if (useNativeSrcSet && fill) {
        return (
            // Pre-optimized CDN variants — native srcSet avoids double-processing
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                srcSet={srcSet}
                sizes={
                    typeof sizes === "string"
                        ? sizes
                        : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                }
                alt={alt ?? image.altText ?? "Apartment photo"}
                className={className}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                style={
                    fill
                        ? {
                              position: "absolute",
                              height: "100%",
                              width: "100%",
                              inset: 0,
                          }
                        : undefined
                }
            />
        );
    }

    return (
        <Image
            {...props}
            src={src}
            alt={alt ?? image.altText ?? "Apartment photo"}
            fill={fill}
            className={className}
            priority={priority}
            unoptimized={src.includes(".supabase.co/storage/")}
            sizes={
                sizes ??
                "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            }
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
        />
    );
}
