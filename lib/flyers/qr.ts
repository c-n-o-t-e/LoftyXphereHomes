import QRCode from "qrcode";
import { getApartmentById } from "@/lib/data/apartments";
import { getWhatsAppChatUrl, SITE_URL } from "@/lib/constants";
import {
    DEFAULT_FLYER_CONTACT,
    resolveDefaultWebsiteUrl,
} from "@/lib/flyers/constants";
import type { FlyerPayload } from "@/lib/flyers/types";

export function resolveFlyerQrUrl(payload: FlyerPayload): string {
    const { qr, contact, apartmentId } = payload;

    if (qr.customUrl?.trim()) {
        return qr.customUrl.trim();
    }

    switch (qr.destinationType) {
        case "website":
            return resolveDefaultWebsiteUrl();
        case "booking":
            return `${resolveDefaultWebsiteUrl()}/booking`;
        case "whatsapp":
            return (
                getWhatsAppChatUrl(contact.whatsapp || DEFAULT_FLYER_CONTACT.whatsapp) ??
                resolveDefaultWebsiteUrl()
            );
        case "apartment": {
            const apartment = apartmentId ? getApartmentById(apartmentId) : undefined;
            if (apartment?.bookingUrl?.trim()) return apartment.bookingUrl.trim();
            if (apartmentId) {
                return `${resolveDefaultWebsiteUrl()}/apartments/${apartmentId}`;
            }
            return resolveDefaultWebsiteUrl();
        }
        default:
            return SITE_URL;
    }
}

export async function generateFlyerQrDataUrl(
    payload: FlyerPayload,
    size = 512,
): Promise<string> {
    const url = resolveFlyerQrUrl(payload);
    return QRCode.toDataURL(url, {
        width: size,
        margin: 1,
        color: {
            dark: "#111111",
            light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
    });
}

export async function generateFlyerQrBuffer(
    payload: FlyerPayload,
    size = 512,
): Promise<Buffer> {
    const url = resolveFlyerQrUrl(payload);
    return QRCode.toBuffer(url, {
        width: size,
        margin: 1,
        color: {
            dark: "#111111",
            light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
        type: "png",
    });
}
