import type { CSSProperties, ComponentType } from "react";
import {
    Dumbbell,
    Gamepad2,
    Globe,
    Instagram,
    Mail,
    Phone,
    ShieldCheck,
    Sparkles,
    SprayCan,
    Tv,
    Waves,
    Wifi,
    Zap,
    CookingPot,
    WashingMachine,
    BedDouble,
    AirVent,
    type LucideIcon,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { AmenityIconKey, ContactIconKey } from "@/lib/post-generator/types";

const AMENITY_ICONS: Record<Exclude<AmenityIconKey, "custom">, LucideIcon> = {
    wifi: Wifi,
    zap: Zap,
    pool: Waves,
    kitchen: CookingPot,
    gamepad: Gamepad2,
    dumbbell: Dumbbell,
    cleaning: SprayCan,
    washer: WashingMachine,
    tv: Tv,
    ac: AirVent,
    bed: BedDouble,
    shield: ShieldCheck,
    sparkles: Sparkles,
};

type ContactIconComponent = ComponentType<{
    "aria-hidden"?: boolean | "true" | "false";
    strokeWidth?: number;
    style?: CSSProperties;
    className?: string;
}>;

const CONTACT_ICONS: Record<ContactIconKey, ContactIconComponent> = {
    instagram: Instagram,
    whatsapp: FaWhatsapp,
    website: Globe,
    email: Mail,
    phone: Phone,
};

export const AMENITY_ICON_OPTIONS: { key: AmenityIconKey; label: string }[] = [
    { key: "wifi", label: "Wi‑Fi / Starlink" },
    { key: "zap", label: "Power" },
    { key: "pool", label: "Pool" },
    { key: "kitchen", label: "Kitchen" },
    { key: "gamepad", label: "Gaming / PS5" },
    { key: "dumbbell", label: "Gym" },
    { key: "cleaning", label: "Cleaning" },
    { key: "washer", label: "Washer" },
    { key: "tv", label: "Smart TV" },
    { key: "ac", label: "Air conditioning" },
    { key: "bed", label: "Bedroom" },
    { key: "shield", label: "Security" },
    { key: "sparkles", label: "Sparkles" },
    { key: "custom", label: "Custom SVG" },
];

export function PostAmenityIcon({
    icon,
    customSvg,
    size = 28,
    color,
    strokeWidth = 2.25,
}: {
    icon: AmenityIconKey;
    customSvg?: string | null;
    size?: number;
    color?: string;
    strokeWidth?: number;
}) {
    if (icon === "custom" && customSvg) {
        return (
            <span
                aria-hidden
                style={{ width: size, height: size, color, display: "inline-flex" }}
                dangerouslySetInnerHTML={{ __html: customSvg }}
            />
        );
    }

    const Icon = (icon !== "custom" && AMENITY_ICONS[icon]) || Sparkles;
    return (
        <Icon
            aria-hidden
            strokeWidth={strokeWidth}
            style={{ width: size, height: size, color, flexShrink: 0 }}
        />
    );
}

export function PostContactIcon({
    type,
    size = 14,
    color,
    style,
    strokeWidth = 2.2,
}: {
    type: ContactIconKey;
    size?: number;
    color?: string;
    style?: CSSProperties;
    strokeWidth?: number;
}) {
    const Icon = CONTACT_ICONS[type] ?? Globe;
    // Brand icons (WhatsApp) ignore strokeWidth; Lucide icons use it for weight.
    const resolvedStroke = type === "whatsapp" ? undefined : strokeWidth;
    return (
        <Icon
            aria-hidden
            strokeWidth={resolvedStroke}
            style={{ width: size, height: size, color, flexShrink: 0, ...style }}
        />
    );
}

export function headingFontFamily(name: string): string {
    switch (name) {
        case "Cormorant Garamond":
            return `"Cormorant Garamond", "Playfair Display", Georgia, serif`;
        case "Canela":
            return `"Canela", "Playfair Display", Georgia, serif`;
        case "Recoleta":
            return `"Recoleta", "Playfair Display", Georgia, serif`;
        default:
            return `"Playfair Display", Georgia, "Times New Roman", serif`;
    }
}

export function bodyFontFamily(name: string): string {
    switch (name) {
        case "Manrope":
            return `"Manrope", "Inter", system-ui, sans-serif`;
        case "Helvetica":
            return `Helvetica, "Helvetica Neue", Arial, sans-serif`;
        case "Montserrat":
            return `"Montserrat", "Inter", system-ui, sans-serif`;
        default:
            return `"Inter", system-ui, -apple-system, sans-serif`;
    }
}
