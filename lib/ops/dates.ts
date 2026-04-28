export function formatMonthTabTitle(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
    }).format(date);
}

export function formatNightsLabel(checkInIso: string, checkOutIso: string): string {
    const inDate = new Date(checkInIso);
    const outDate = new Date(checkOutIso);
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
        return "Nights";
    }
    const diffMs = outDate.getTime() - inDate.getTime();
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return nights === 1 ? "1 night" : `${nights} nights`;
}

export function coerceIsoDate(input: string): string {
    // Expect YYYY-MM-DD. We keep it stable for Sheets + invoice template.
    const s = String(input || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        throw new Error("Invalid date format (expected YYYY-MM-DD)");
    }
    return s;
}

