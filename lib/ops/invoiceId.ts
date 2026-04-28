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

