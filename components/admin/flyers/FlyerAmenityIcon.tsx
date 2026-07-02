import type { CSSProperties } from "react";
import {
    AirVent,
    Bath,
    BedDouble,
    ChefHat,
    Gamepad2,
    Headset,
    Home,
    ShieldCheck,
    Sofa,
    Sparkles,
    Sun,
    Tv,
    UtensilsCrossed,
    WashingMachine,
    Waves,
    Wifi,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { getAmenityKeyForLabel } from "@/lib/amenities/suiteAmenities";

const AMENITY_VECTOR_ICONS: Record<string, LucideIcon> = {
    "ps5-gaming-console": Gamepad2,
    "starlink-wifi": Wifi,
    "shared-lounge": Sofa,
    "on-site-restaurant": UtensilsCrossed,
    "daily-cleaning": Sparkles,
    "cozy-bedrooms": BedDouble,
    "swimming-pool": Waves,
    "private-balconies": Sun,
    "washing-machine": WashingMachine,
    "en-suite-bathrooms": Bath,
    "fully-equipped-kitchen": ChefHat,
    "smart-tv": Tv,
    "furnished-living-room": Home,
    "air-conditioning-solar-inverter": AirVent,
    "customer-service": Headset,
    "serene-neighborhood": ShieldCheck,
    "electricity-247": Zap,
};

type FlyerAmenityIconProps = {
    amenityKey?: string;
    label?: string;
    size?: string;
    style?: CSSProperties;
};

export function FlyerAmenityIcon({
    amenityKey,
    label,
    size = "0.95em",
    style,
}: FlyerAmenityIconProps) {
    const resolvedKey =
        amenityKey ?? (label ? getAmenityKeyForLabel(label) : null) ?? undefined;
    const Icon = (resolvedKey && AMENITY_VECTOR_ICONS[resolvedKey]) || Sparkles;

    return (
        <Icon
            aria-hidden
            strokeWidth={2}
            style={{
                width: size,
                height: size,
                flexShrink: 0,
                marginTop: "0.08em",
                color: "currentColor",
                stroke: "currentColor",
                ...style,
            }}
        />
    );
}
