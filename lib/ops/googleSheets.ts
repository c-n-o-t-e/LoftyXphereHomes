import { google, sheets_v4 } from "googleapis";
import {
    formatMonthApartmentTabTitle,
    formatMonthTabTitle,
    sheetMonthDateForBooking,
} from "./dates";
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

async function getSheetIdByTitle(
    sheets: sheets_v4.Sheets,
    desiredTitle: string,
): Promise<number | null> {
    const res = await sheets.spreadsheets.get({
        spreadsheetId: requireSpreadsheetId(),
        fields: "sheets.properties(sheetId,title)",
    });
    const lower = String(desiredTitle).toLowerCase();
    const match = (res.data.sheets || []).find(
        (s) => String(s?.properties?.title || "").toLowerCase() === lower,
    );
    return match?.properties?.sheetId ?? null;
}

function hexToSheetsRgb(hex: string): sheets_v4.Schema$Color {
    const h = String(hex || "")
        .trim()
        .replace(/^#/, "");
    if (!/^[0-9a-f]{6}$/i.test(h)) return { red: 0, green: 0, blue: 0 };
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return { red: r, green: g, blue: b };
}

async function applyMonthSheetBranding(
    sheets: sheets_v4.Sheets,
    sheetTitle: string,
): Promise<void> {
    const sheetId = await getSheetIdByTitle(sheets, sheetTitle);
    if (sheetId == null) return;

    const LOFTY_RED = hexToSheetsRgb("#C0181A");
    const CHARCOAL = hexToSheetsRgb("#121212");
    const OFF_WHITE = hexToSheetsRgb("#F7F7F7");
    const LIGHT_GRAY = hexToSheetsRgb("#F2F2F2");
    const CANCEL_BG = hexToSheetsRgb("#EFEFEF");
    const CANCEL_TEXT = hexToSheetsRgb("#7A7A7A");
    const BORDER = hexToSheetsRgb("#DDDDDD");
    const SUCCESS_BG = hexToSheetsRgb("#E8F5E9");
    const SUCCESS_TEXT = hexToSheetsRgb("#1B5E20");
    const FAIL_BG = hexToSheetsRgb("#FFEBEE");
    const FAIL_TEXT = hexToSheetsRgb("#B71C1C");

    const col = (n: number) => ({
        sheetId,
        dimension: "COLUMNS" as const,
        startIndex: n,
        endIndex: n + 1,
    });

    const requests: sheets_v4.Schema$Request[] = [
        {
            updateSheetProperties: {
                properties: {
                    sheetId,
                    gridProperties: { frozenRowCount: 4, hideGridlines: true },
                },
                fields: "gridProperties.frozenRowCount,gridProperties.hideGridlines",
            },
        },
        {
            mergeCells: {
                range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 1,
                    endColumnIndex: 10,
                },
                mergeType: "MERGE_ALL",
            },
        },
        {
            mergeCells: {
                range: {
                    sheetId,
                    startRowIndex: 1,
                    endRowIndex: 2,
                    startColumnIndex: 1,
                    endColumnIndex: 10,
                },
                mergeType: "MERGE_ALL",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 2,
                    startColumnIndex: 1,
                    endColumnIndex: 11,
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: CHARCOAL,
                        horizontalAlignment: "LEFT",
                        verticalAlignment: "MIDDLE",
                        textFormat: {
                            foregroundColor: OFF_WHITE,
                            bold: true,
                            fontSize: 14,
                        },
                    },
                },
                fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat)",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 2,
                    endRowIndex: 3,
                    startColumnIndex: 1,
                    endColumnIndex: 11,
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: LOFTY_RED,
                    },
                },
                fields: "userEnteredFormat.backgroundColor",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 3,
                    endRowIndex: 4,
                    startColumnIndex: 1,
                    endColumnIndex: 10,
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: CHARCOAL,
                        horizontalAlignment: "CENTER",
                        verticalAlignment: "MIDDLE",
                        textFormat: {
                            foregroundColor: OFF_WHITE,
                            bold: true,
                            fontSize: 11,
                        },
                    },
                },
                fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat)",
            },
        },
        {
            updateDimensionProperties: {
                range: col(1),
                properties: { pixelSize: 180 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(2),
                properties: { pixelSize: 150 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(3),
                properties: { pixelSize: 110 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(4),
                properties: { pixelSize: 130 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(5),
                properties: { pixelSize: 130 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(6),
                properties: { pixelSize: 140 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(7),
                properties: { pixelSize: 170 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(8),
                properties: { pixelSize: 90 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(9),
                properties: { pixelSize: 260 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: col(10),
                properties: { pixelSize: 260 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: {
                    sheetId,
                    dimension: "ROWS",
                    startIndex: 0,
                    endIndex: 2,
                },
                properties: { pixelSize: 38 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: {
                    sheetId,
                    dimension: "ROWS",
                    startIndex: 2,
                    endIndex: 3,
                },
                properties: { pixelSize: 8 },
                fields: "pixelSize",
            },
        },
        {
            updateDimensionProperties: {
                range: {
                    sheetId,
                    dimension: "ROWS",
                    startIndex: 3,
                    endIndex: 4,
                },
                properties: { pixelSize: 32 },
                fields: "pixelSize",
            },
        },
        {
            addBanding: {
                bandedRange: {
                    range: {
                        sheetId,
                        startRowIndex: 4,
                        endRowIndex: 2000,
                        startColumnIndex: 1,
                        endColumnIndex: 10,
                    },
                    rowProperties: {
                        firstBandColor: { ...OFF_WHITE },
                        secondBandColor: { ...LIGHT_GRAY },
                    },
                },
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 4,
                    endRowIndex: 2000,
                    startColumnIndex: 4,
                    endColumnIndex: 6,
                },
                cell: {
                    userEnteredFormat: {
                        numberFormat: { type: "DATE", pattern: "dd-mmm-yyyy" },
                    },
                },
                fields: "userEnteredFormat.numberFormat",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 4,
                    endRowIndex: 2000,
                    startColumnIndex: 6,
                    endColumnIndex: 7,
                },
                cell: {
                    userEnteredFormat: {
                        numberFormat: { type: "NUMBER", pattern: "₦#,##0" },
                    },
                },
                fields: "userEnteredFormat.numberFormat",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 4,
                    endRowIndex: 2000,
                    startColumnIndex: 7,
                    endColumnIndex: 8,
                },
                cell: {
                    userEnteredFormat: {
                        numberFormat: {
                            type: "DATE_TIME",
                            pattern: "dd-mmm-yyyy hh:mm",
                        },
                    },
                },
                fields: "userEnteredFormat.numberFormat",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 4,
                    endRowIndex: 2000,
                    startColumnIndex: 8,
                    endColumnIndex: 9,
                },
                cell: {
                    userEnteredFormat: {
                        horizontalAlignment: "CENTER",
                    },
                },
                fields: "userEnteredFormat.horizontalAlignment",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 10,
                    endColumnIndex: 11,
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: LOFTY_RED,
                        textFormat: {
                            foregroundColor: OFF_WHITE,
                            bold: true,
                            fontSize: 11,
                        },
                    },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
            },
        },
        {
            repeatCell: {
                range: {
                    sheetId,
                    startRowIndex: 1,
                    endRowIndex: 2,
                    startColumnIndex: 10,
                    endColumnIndex: 11,
                },
                cell: {
                    userEnteredFormat: {
                        backgroundColor: CHARCOAL,
                        numberFormat: { type: "NUMBER", pattern: "₦#,##0" },
                        horizontalAlignment: "LEFT",
                        textFormat: {
                            foregroundColor: OFF_WHITE,
                            bold: true,
                            fontSize: 14,
                        },
                    },
                },
                fields: "userEnteredFormat(backgroundColor,numberFormat,horizontalAlignment,textFormat)",
            },
        },
        {
            updateBorders: {
                range: {
                    sheetId,
                    startRowIndex: 3,
                    endRowIndex: 2000,
                    startColumnIndex: 1,
                    endColumnIndex: 10,
                },
                innerHorizontal: {
                    style: "SOLID",
                    width: 1,
                    color: BORDER,
                },
                innerVertical: {
                    style: "SOLID",
                    width: 1,
                    color: BORDER,
                },
                top: { style: "SOLID", width: 1, color: BORDER },
                bottom: { style: "SOLID", width: 1, color: BORDER },
                left: { style: "SOLID", width: 1, color: BORDER },
                right: { style: "SOLID", width: 1, color: BORDER },
            },
        },
        {
            setBasicFilter: {
                filter: {
                    range: {
                        sheetId,
                        startRowIndex: 3,
                        endRowIndex: 2000,
                        startColumnIndex: 1,
                        endColumnIndex: 10,
                    },
                },
            },
        },
        {
            addConditionalFormatRule: {
                rule: {
                    ranges: [
                        {
                            sheetId,
                            startRowIndex: 4,
                            endRowIndex: 2000,
                            startColumnIndex: 1,
                            endColumnIndex: 10,
                        },
                    ],
                    booleanRule: {
                        condition: {
                            type: "CUSTOM_FORMULA",
                            values: [{ userEnteredValue: "=$I5=FALSE" }],
                        },
                        format: {
                            backgroundColor: CANCEL_BG,
                            textFormat: {
                                foregroundColor: CANCEL_TEXT,
                                strikethrough: true,
                            },
                        },
                    },
                },
                index: 0,
            },
        },
        {
            addConditionalFormatRule: {
                rule: {
                    ranges: [
                        {
                            sheetId,
                            startRowIndex: 4,
                            endRowIndex: 2000,
                            startColumnIndex: 8,
                            endColumnIndex: 9,
                        },
                    ],
                    booleanRule: {
                        condition: {
                            type: "CUSTOM_FORMULA",
                            values: [{ userEnteredValue: "=$I5=TRUE" }],
                        },
                        format: {
                            backgroundColor: SUCCESS_BG,
                            textFormat: {
                                foregroundColor: SUCCESS_TEXT,
                                bold: true,
                            },
                        },
                    },
                },
                index: 0,
            },
        },
        {
            addConditionalFormatRule: {
                rule: {
                    ranges: [
                        {
                            sheetId,
                            startRowIndex: 4,
                            endRowIndex: 2000,
                            startColumnIndex: 8,
                            endColumnIndex: 9,
                        },
                    ],
                    booleanRule: {
                        condition: {
                            type: "CUSTOM_FORMULA",
                            values: [{ userEnteredValue: "=$I5=FALSE" }],
                        },
                        format: {
                            backgroundColor: FAIL_BG,
                            textFormat: {
                                foregroundColor: FAIL_TEXT,
                                bold: true,
                            },
                        },
                    },
                },
                index: 0,
            },
        },
    ];

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: requireSpreadsheetId(),
        requestBody: { requests },
    });
}

async function ensureBookingSheet(
    sheets: sheets_v4.Sheets,
    tabTitle: string,
): Promise<string> {
    const titles = await listSheetTitles(sheets);
    const existing = findTitleCaseInsensitive(titles, tabTitle);
    if (existing) return existing;

    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: requireSpreadsheetId(),
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: tabTitle,
                                gridProperties: {
                                    rowCount: 2000,
                                    columnCount: 26,
                                },
                            },
                        },
                    },
                ],
            },
        });
    } catch (e) {
        const msg = String((e as Error)?.message || e);
        const raceExisting = findTitleCaseInsensitive(
            await listSheetTitles(sheets),
            tabTitle,
        );
        if (raceExisting) return raceExisting;
        if (!/already exists|duplicate/i.test(msg)) throw e;
        const afterDup = findTitleCaseInsensitive(
            await listSheetTitles(sheets),
            tabTitle,
        );
        if (afterDup) return afterDup;
        throw e;
    }

    const q = quoteSheetNameForRange(tabTitle);
    await sheets.spreadsheets.values.update({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!B1:B2`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [["LOFTY XPHERE HOMES"], [`${tabTitle} — Bookings`]],
        },
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!B4:J4`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [HEADER_ROW] },
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!K1:K3`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [["Monthly total (Stayed=TRUE)"], ["=SUMIFS(G:G,I:I,TRUE)"], [""]],
        },
    });

    await applyMonthSheetBranding(sheets, tabTitle);

    return tabTitle;
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

async function findInvoiceRowAcrossAllTabs(
    sheets: sheets_v4.Sheets,
    invoiceId: string,
): Promise<{ sheetTitle: string; rowNumber: number } | null> {
    const titles = await listSheetTitles(sheets);
    for (const sheetTitle of titles) {
        const rowNumber = await findInvoiceRowInTab(sheets, sheetTitle, invoiceId);
        if (rowNumber != null) return { sheetTitle, rowNumber };
    }
    return null;
}

export async function appendBookingRowToSheet(row: SheetsBookingRow) {
    const sheets = await createSheetsClient();

    const sheetMonthDate = sheetMonthDateForBooking(row.checkIn, row.bookingDate);
    const tabTitle = formatMonthApartmentTabTitle(sheetMonthDate, row.apartment);
    const targetTitle = await ensureBookingSheet(sheets, tabTitle);

    const existingAnywhere = await findInvoiceRowAcrossAllTabs(sheets, row.invoiceId);
    if (existingAnywhere != null) {
        return;
    }

    const q = quoteSheetNameForRange(targetTitle);
    const bookingDateDisplay =
        row.bookingDate instanceof Date && !Number.isNaN(row.bookingDate.getTime())
            ? row.bookingDate.toLocaleString()
            : new Date().toLocaleString();

    await sheets.spreadsheets.values.append({
        spreadsheetId: requireSpreadsheetId(),
        range: `${q}!B5:J`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [
                [
                    row.name,
                    row.phone,
                    row.apartment,
                    row.checkIn,
                    row.checkOut,
                    row.amountNgn,
                    bookingDateDisplay,
                    row.stayed,
                    row.invoiceId,
                ],
            ],
        },
    });
}

export async function setStayedByInvoiceId(args: {
    invoiceId: string;
    stayed: boolean;
}) {
    const sheets = await createSheetsClient();
    const id = String(args.invoiceId).trim();

    const titles = await listSheetTitles(sheets);

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
