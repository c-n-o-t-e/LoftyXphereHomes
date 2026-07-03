/** Display label for flyer bedroom badge (e.g. "1 Bedroom", "2 Bedroom"). */
export function formatFlyerBedroomLabel(beds: number): string {
    if (!Number.isFinite(beds) || beds < 1) {
        return "";
    }

    if (beds === 1) {
        return "1 Bedroom";
    }

    return `${Math.floor(beds)} Bedroom`;
}
