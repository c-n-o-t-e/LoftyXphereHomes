/**
 * Tab title like "April 2026" (legacy spec: en-US long month + year).
 * @see docs/BACKEND_AND_GOOGLE_SHEETS_SPEC.md
 */
export function formatMonthTabTitle(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date);
}

/** Google Sheets sheet name max length. */
export const GOOGLE_SHEETS_TAB_TITLE_MAX_LENGTH = 100;

/**
 * Strip characters invalid in Google Sheet tab names: \ / * ? : [ ]
 * @see https://developers.google.com/sheets/api/guides/concepts#sheet_names
 */
export function sanitizeSheetTitleApartmentSegment(raw: string): string {
    return String(raw ?? "")
        .trim()
        .replace(/[\\/*?:[\]]/g, "-")
        .replace(/-+/g, "-")
        .replace(/\s+/g, " ")
        .replace(/^[-\s]+|[-\s]+$/g, "")
        .trim();
}

const MONTH_APARTMENT_TAB_SEP = " — ";

/**
 * One tab per calendar month and apartment (e.g. "May 2026 — lofty-wuye-01").
 */
export function formatMonthApartmentTabTitle(
    monthDate: Date,
    apartmentKeyRaw: string,
): string {
    const monthTitle = formatMonthTabTitle(monthDate);
    let apt = sanitizeSheetTitleApartmentSegment(apartmentKeyRaw);
    if (!apt) apt = "unknown";

    const maxAptLen =
        GOOGLE_SHEETS_TAB_TITLE_MAX_LENGTH -
        monthTitle.length -
        MONTH_APARTMENT_TAB_SEP.length;
    if (maxAptLen < 1) {
        return monthTitle.slice(0, GOOGLE_SHEETS_TAB_TITLE_MAX_LENGTH);
    }
    if (apt.length > maxAptLen) {
        apt = apt.slice(0, maxAptLen).replace(/[-\s]+$/g, "").trimEnd() || "?";
    }

    return `${monthTitle}${MONTH_APARTMENT_TAB_SEP}${apt}`;
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
    const s = String(input || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        throw new Error("Invalid date format (expected YYYY-MM-DD)");
    }
    return s;
}

/**
 * Derive stay start (check-in) for which calendar month tab should receive the row.
 * YYYY-MM-DD is parsed as UTC noon for stable calendar month.
 * Year-less strings use booking year with optional roll-forward (legacy parity).
 */
export function deriveStayStartDate(
    checkInRaw: string,
    bookingDate: Date,
): Date | null {
    const raw = String(checkInRaw ?? "").trim();
    if (!raw) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(`${raw}T12:00:00.000Z`);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    if (/\b(19|20)\d{2}\b/.test(raw)) {
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    const ref =
        bookingDate instanceof Date && !Number.isNaN(bookingDate.getTime())
            ? bookingDate
            : new Date();

    const assumed = new Date(`${raw} ${ref.getFullYear()}`);
    if (Number.isNaN(assumed.getTime())) return null;

    const oneWeekMs = 7 * 86400000;
    if (assumed.getTime() < ref.getTime() - oneWeekMs) {
        assumed.setFullYear(assumed.getFullYear() + 1);
    }

    return assumed;
}

/** Month used for Google Sheet tab: check-in month, else booking date month. */
export function sheetMonthDateForBooking(checkInIso: string, bookingDate: Date): Date {
    const stayStart = deriveStayStartDate(checkInIso, bookingDate);
    if (stayStart) return stayStart;
    return bookingDate;
}
