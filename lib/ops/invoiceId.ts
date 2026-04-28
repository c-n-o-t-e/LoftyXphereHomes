import { randomBytes } from "crypto";

export type InvoiceIdInput = {
    bookingDate: Date;
};

/**
 * Format: LXH-YYMMDD-XXXXXX
 * - YYMMDD from booking date (not stay date)
 * - XXXXXX random uppercase alnum
 */
export function makeInvoiceId(input: InvoiceIdInput): string {
    const d = input.bookingDate;
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const random = randomBytes(4)
        .toString("base64url")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 6)
        .toUpperCase()
        .padEnd(6, "X");
    return `LXH-${yy}${mm}${dd}-${random}`;
}

export function parseDateFromInvoiceId(invoiceId: string): Date | null {
    const m = String(invoiceId || "")
        .trim()
        .match(/^LXH-(\d{2})(\d{2})(\d{2})-[A-Z0-9]{6}$/i);
    if (!m) return null;
    const yy = Number(m[1]);
    const mm = Number(m[2]);
    const dd = Number(m[3]);
    if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd))
        return null;

    const year = 2000 + yy;
    const date = new Date(Date.UTC(year, mm - 1, dd));
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

/** Extract LXH-… id from free text (e.g. pasted email or sentence). */
export function parseInvoiceIdFromText(text: string): string | null {
    const t = String(text ?? "").trim();
    if (!t) return null;

    const labeled = t.match(
        /invoice\s*(?:id|number)?\s*[:#-]?\s*(LXH-[A-Z0-9]+(?:-[A-Z0-9]+)+)/i,
    );
    if (labeled?.[1]) return labeled[1];

    const embedded = t.match(/\b(LXH-[A-Z0-9]+(?:-[A-Z0-9]+)+)\b/i);
    return embedded?.[1] ?? null;
}

/** Accept pasted invoice id or free text containing an LXH-… id. */
export function resolveInvoiceIdFromFormInput(raw: string): string | null {
    const t = String(raw ?? "").trim();
    if (!t) return null;
    return (
        parseInvoiceIdFromText(t) ||
        parseInvoiceIdFromText(`Invoice ID: ${t}`)
    );
}

