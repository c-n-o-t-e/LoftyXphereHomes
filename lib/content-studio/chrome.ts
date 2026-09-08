import type { EditorialDocument, StudioContent, StudioFooter } from "@/lib/content-studio/types";

export const CAMPAIGN_CTA_SCRIPT = "With Us!";
export const CAMPAIGN_CTA_BUTTON = "BOOK NOW";
export const FOOTER_BAR_HEIGHT = 64;

export function campaignCta(content: StudioContent) {
    return {
        invitation: (content.cta ?? "").trim() || "Book Your Next Stay",
        script: (content.ctaScript ?? "").trim() || CAMPAIGN_CTA_SCRIPT,
        button: (content.ctaButton ?? "").trim() || CAMPAIGN_CTA_BUTTON,
    };
}

export function seriesNumber(content: StudioContent): string {
    const raw =
        (content.seriesNumber ?? "").trim() || content.points[0]?.number || "01";
    return raw.replace(/[^\d]/g, "").padStart(2, "0").slice(-2) || "01";
}

export type FooterBarItem = {
    key: "website" | "instagram" | "phone";
    label: string;
};

export function footerBarItems(footer: StudioFooter): FooterBarItem[] {
    const items: FooterBarItem[] = [];
    if (footer.website) items.push({ key: "website", label: footer.website });
    if (footer.instagram) items.push({ key: "instagram", label: footer.instagram });
    if (footer.whatsapp) items.push({ key: "phone", label: footer.whatsapp });
    return items;
}

export function hasCampaignCta(document: EditorialDocument, showCta: boolean): boolean {
    if (!showCta) return false;
    return Boolean(
        (document.content.cta ?? "").trim() ||
            (document.content.ctaButton ?? "").trim() ||
            (document.content.ctaScript ?? "").trim(),
    );
}
