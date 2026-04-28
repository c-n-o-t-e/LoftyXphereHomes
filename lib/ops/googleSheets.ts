import { google, sheets_v4 } from "googleapis";
import { formatMonthTabTitle } from "./dates";
import { parseDateFromInvoiceId } from "./invoiceId";

export type SheetsBookingRow = {
    name: string;
    phone: string;
    apartment: string;
    checkIn: string; // YYYY-MM-DD
    checkOut: string; // YYYY-MM-DD
    amountNgn: number;
    bookingDate: Date;
    stayed: boolean;
    invoiceId: string;
};

const HEADER_ROW = [
    "Name",
    "Phone",
    "Room Code",
    "Check-in",
    "Check-out",
    "Amount",
    "Booking Date",
    "Stayed",
    "Invoice ID",
];

function requireSpreadsheetId(): string {
    const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.SHEET_ID;
    if (!id) {
        throw new Error(
            "Missing GOOGLE_SHEETS_SPREADSHEET_ID (or SHEET_ID) env var for Google Sheets integration.",
        );
    }
    return id;
}

function getCredentialsPath(): string {
    // Prefer standard env. Fallback supports the older AdminDashboard behavior.
    return (
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.GOOGLE_SHEETS_CREDENTIALS_PATH ||
        "credentials.json"
    );
}

async function createSheetsClient(): Promise<sheets_v4.Sheets> {
    const auth = new google.auth.GoogleAuth({
        keyFile: getCredentialsPath(),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({ version: "v4", auth });
}

async function listSheetTitles(sheets: sheets_v4.Sheets): Promise<string[]> {
    const res = await sheets.spreadsheets.get({
        spreadsheetId: requireSpreadsheetId(),
        fields: "sheets.properties.title",
    });
    return (res.data.sheets || [])
        .map((s) => s.properties?.title)
        .filter((t): t is string => Boolean(t));
}

function quoteSheetNameForRange(title: string): string {
    return `'${String(title).replace(/'/g, "''")}'`;
}

function findTitleCaseInsensitive(titles: string[], desired: string): string | null {
    const lower = desired.toLowerCase();
    return titles.find((t) => t.toLowerCase() === lower) ?? null;
}

async function ensureMonthSheet(
    sheets: sheets_v4.Sheets,
    monthTitle: string,
): Promise<string> {
    const titles = await listSheetTitles(sheets);
    const existing = findTitleCaseInsensitive(titles, monthTitle);
    if (existing) return existing;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: requireSpreadsheetId(),
        requestBody: {
            requests: [{ addSheet: { properties: { title: monthTitle } } }],
        },
    });

    // Best-effort set a simple header row at B4:J4 (matching legacy layout).
    const q = quoteSheetNameForRange(monthTitle);
    await sheets.spreadsheets.values.update({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!B4:J4`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADER_ROW] },
    });

    return monthTitle;
}

export async function appendBookingRowToSheet(row: SheetsBookingRow) {
    const sheets = await createSheetsClient();
    const monthTitle = formatMonthTabTitle(row.bookingDate);
    const targetTitle = await ensureMonthSheet(sheets, monthTitle);

    const q = quoteSheetNameForRange(targetTitle);

    // Best-effort idempotency: if invoiceId already exists in column J, do not append again.
    // This avoids duplicates if the job succeeded but marking SUCCESS failed, or if processors overlap.
    const existingRow = await findInvoiceRowInTab(sheets, targetTitle, row.invoiceId);
    if (existingRow != null) {
        return;
    }

    await sheets.spreadsheets.values.append({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!B:J`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
            values: [
                [
                    row.name,
                    row.phone,
                    row.apartment,
                    row.checkIn,
                    row.checkOut,
                    row.amountNgn,
                    row.bookingDate.toISOString(),
                    row.stayed,
                    row.invoiceId,
                ],
            ],
        },
    });
}

async function findInvoiceRowInTab(
    sheets: sheets_v4.Sheets,
    sheetTitle: string,
    invoiceId: string,
): Promise<number | null> {
    const q = quoteSheetNameForRange(sheetTitle);
    const col = await sheets.spreadsheets.values.get({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!J:J`,
    });
    const values = col.data.values || [];
    const idx0 = values.findIndex(
        (r) => String(r?.[0] ?? "").trim() === String(invoiceId).trim(),
    );
    if (idx0 === -1) return null;
    return idx0 + 1;
}

export async function setStayedByInvoiceId(args: {
    invoiceId: string;
    stayed: boolean;
}) {
    const sheets = await createSheetsClient();
    const id = String(args.invoiceId).trim();

    const titles = await listSheetTitles(sheets);

    // Prefer month tab based on invoice date prefix.
    const fromId = parseDateFromInvoiceId(id);
    if (fromId) {
        const preferred = formatMonthTabTitle(fromId);
        const canonical = findTitleCaseInsensitive(titles, preferred);
        if (canonical) {
            const rowNumber = await findInvoiceRowInTab(sheets, canonical, id);
            if (rowNumber != null) {
                const q = quoteSheetNameForRange(canonical);
                await sheets.spreadsheets.values.update({
                    spreadsheetId: requireSpreadsheetId(),
                    range: `${q}!I${rowNumber}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: { values: [[args.stayed]] },
                });
                return { sheetTitle: canonical, rowNumber };
            }
        }
    }

    // Fallback: scan all tabs.
    for (const sheetTitle of titles) {
        const rowNumber = await findInvoiceRowInTab(sheets, sheetTitle, id);
        if (rowNumber == null) continue;
        const q = quoteSheetNameForRange(sheetTitle);
        await sheets.spreadsheets.values.update({
            spreadsheetId: requireSpreadsheetId(),
            range: `${q}!I${rowNumber}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [[args.stayed]] },
        });
        return { sheetTitle, rowNumber };
    }

    const err = new Error("Invoice ID not found in Google Sheet");
    (err as any).statusCode = 404;
    throw err;
}

