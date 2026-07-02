export type SuiteAmenityOption = {
    key: string;
    label: string;
    icon: string;
    /** Alternate apartment copy that maps to the same amenity key. */
    aliases?: string[];
};

/** Canonical in-suite amenities used on flyers (2-bedroom wording). */
export const SUITE_AMENITY_CATALOG: SuiteAmenityOption[] = [
    { key: "ps5-gaming-console", label: "PS5 gaming console", icon: "🎮" },
    { key: "starlink-wifi", label: "Starlink Wi-Fi", icon: "📶" },
    { key: "shared-lounge", label: "Shared lounge", icon: "🛋️" },
    { key: "on-site-restaurant", label: "On-site restaurant", icon: "🍽️" },
    { key: "daily-cleaning", label: "Daily cleaning", icon: "🧹" },
    {
        key: "cozy-bedrooms",
        label: "Cozy bedrooms",
        icon: "🛏️",
        aliases: ["Cozy bedroom"],
    },
    { key: "swimming-pool", label: "Swimming pool", icon: "🏊" },
    {
        key: "private-balconies",
        label: "Private balconies",
        icon: "🌅",
        aliases: ["Private balcony"],
    },
    { key: "washing-machine", label: "Washing machine", icon: "🧺" },
    {
        key: "en-suite-bathrooms",
        label: "En-suite bathrooms",
        icon: "🚿",
        aliases: ["En-suite bathroom"],
    },
    { key: "fully-equipped-kitchen", label: "Fully equipped kitchen", icon: "🍳" },
    {
        key: "smart-tv",
        label: "Smart TV (Netflix & DStv)",
        icon: "🎬",
    },
    {
        key: "furnished-living-room",
        label: "Stylishly furnished living room",
        icon: "🏠",
    },
    {
        key: "air-conditioning-solar-inverter",
        label: "Air conditioners on solar & inverter",
        icon: "❄️",
        aliases: [
            "2 air conditioners on solar & inverter",
            "4 air conditioners on solar & inverter",
        ],
    },
    {
        key: "customer-service",
        label: "Excellent customer service & support",
        icon: "💬",
    },
    {
        key: "serene-neighborhood",
        label: "Serene, secure neighborhood",
        icon: "🛡️",
    },
    {
        key: "electricity-247",
        label: "24/7 electricity (solar, inverter & generator)",
        icon: "⚡",
    },
];

const catalogByKey = new Map(SUITE_AMENITY_CATALOG.map((item) => [item.key, item]));

const labelToKey = new Map<string, string>();
for (const item of SUITE_AMENITY_CATALOG) {
    labelToKey.set(normalizeAmenityLabel(item.label), item.key);
    for (const alias of item.aliases ?? []) {
        labelToKey.set(normalizeAmenityLabel(alias), item.key);
    }
}

function normalizeAmenityLabel(label: string): string {
    return label.trim().toLowerCase();
}

export function getDefaultFlyerAmenityKeys(): string[] {
    return SUITE_AMENITY_CATALOG.map((item) => item.key);
}

/** Ensures flyers always carry the full suite amenity list in catalog order. */
export function normalizeFlyerAmenityKeys(keys: unknown): string[] {
    const defaultKeys = getDefaultFlyerAmenityKeys();
    const allowed = new Set(defaultKeys);

    if (!Array.isArray(keys)) {
        return defaultKeys;
    }

    const filtered = keys.filter(
        (key): key is string => typeof key === "string" && allowed.has(key),
    );

    if (filtered.length < defaultKeys.length) {
        return defaultKeys;
    }

    return defaultKeys.filter((key) => filtered.includes(key));
}

export function getAmenityLabelByKey(key: string): string {
    return catalogByKey.get(key)?.label ?? key;
}

export function getAmenityIconByKey(key: string): string {
    return catalogByKey.get(key)?.icon ?? getAmenityIcon(getAmenityLabelByKey(key));
}

export function getAmenityKeyForLabel(label: string): string | null {
    return labelToKey.get(normalizeAmenityLabel(label)) ?? null;
}

/** Keyword-based icon lookup for free-text amenity labels (apartment pages). */
export function getAmenityIcon(label: string): string {
    const normalized = label.toLowerCase();

    if (normalized.includes("ps5") || normalized.includes("gaming console")) return "🎮";
    if (normalized.includes("starlink") || normalized.includes("wi-fi") || normalized.includes("wifi")) {
        return "📶";
    }
    if (normalized.includes("lounge")) return "🛋️";
    if (normalized.includes("restaurant")) return "🍽️";
    if (normalized.includes("cleaning")) return "🧹";
    if (normalized.includes("bedroom")) return "🛏️";
    if (normalized.includes("swimming pool") || normalized.includes("pool")) return "🏊";
    if (normalized.includes("balcon")) return "🌅";
    if (normalized.includes("washing machine")) return "🧺";
    if (normalized.includes("bathroom")) return "🚿";
    if (normalized.includes("kitchen")) return "🍳";
    if (normalized.includes("netflix") || normalized.includes("dstv") || normalized.includes("smart tv")) {
        return "🎬";
    }
    if (normalized.includes("living room")) return "🏠";
    if (normalized.includes("air conditioner")) return "❄️";
    if (normalized.includes("customer service")) return "💬";
    if (normalized.includes("neighborhood") || normalized.includes("secure")) return "🛡️";
    if (normalized.includes("electricity") || normalized.includes("generator") || normalized.includes("inverter")) {
        return "⚡";
    }
    if (normalized.includes("keyless") || normalized.includes("passcode")) return "🔐";
    if (normalized.includes("parking")) return "🚗";
    if (normalized.includes("gym")) return "🏋️";

    return "✨";
}
