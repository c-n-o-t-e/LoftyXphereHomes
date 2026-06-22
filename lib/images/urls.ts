import type { ApartmentImageSet } from "./types";

/** Pick the best variant URL for a viewport width (Airbnb-style responsive loading). */
export function pickImageUrlForWidth(
    image: ApartmentImageSet,
    viewportWidth: number,
): string {
    if (viewportWidth < 768) return image.medium || image.thumbnail || image.large;
    if (viewportWidth < 1280) return image.medium || image.large;
    return image.large || image.medium;
}

/** Build a srcSet string for native responsive loading outside next/image. */
export function buildImageSrcSet(image: ApartmentImageSet): string {
    const parts = [
        image.thumbnail ? `${image.thumbnail} 300w` : null,
        image.medium ? `${image.medium} 800w` : null,
        image.large ? `${image.large} 1600w` : null,
    ].filter(Boolean);

    return parts.join(", ");
}

/** Convert a flat URL list (legacy/static) into image sets for the gallery. */
export function legacyUrlsToImageSets(urls: string[]): ApartmentImageSet[] {
    return urls.map((url) => ({
        thumbnail: url,
        medium: url,
        large: url,
    }));
}
