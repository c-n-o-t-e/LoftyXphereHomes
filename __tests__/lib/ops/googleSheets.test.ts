const mockSpreadsheetsGet = jest.fn();
const mockBatchUpdate = jest.fn();
const mockValuesGet = jest.fn();
const mockValuesUpdate = jest.fn();
const mockValuesAppend = jest.fn();

const mockSheetsClient = {
    spreadsheets: {
        get: mockSpreadsheetsGet,
        batchUpdate: mockBatchUpdate,
        values: {
            get: mockValuesGet,
            update: mockValuesUpdate,
            append: mockValuesAppend,
        },
    },
};

jest.mock("googleapis", () => ({
    google: {
        auth: {
            GoogleAuth: jest.fn(),
        },
        sheets: jest.fn(() => mockSheetsClient),
    },
}));

import {
    appendBookingRowToSheet,
    setStayedByInvoiceId,
} from "@/lib/ops/googleSheets";
import { google } from "googleapis";

function sheetTitleResponse(titles: string[]) {
    return {
        data: {
            sheets: titles.map((title) => ({ properties: { title } })),
        },
    };
}

const baseBookingRow = {
    name: "Jane Doe",
    phone: "0800",
    apartment: "lofty-wuye-01",
    checkIn: "2026-02-10",
    checkOut: "2026-02-12",
    amountNgn: 100000,
    bookingDate: new Date("2026-01-05T12:00:00.000Z"),
    stayed: true,
    invoiceId: "LXH-260105-ABCDEF",
};

describe("googleSheets invoice lookup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
        delete process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        delete process.env.GOOGLE_SHEETS_CREDENTIALS_PATH;
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID = "spreadsheet_123";
        mockBatchUpdate.mockResolvedValue({});
        mockValuesUpdate.mockResolvedValue({});
        mockValuesAppend.mockResolvedValue({});
    });

    it("checks invoice-month tabs before fallback when appending a booking", async () => {
        mockSpreadsheetsGet.mockResolvedValueOnce(
            sheetTitleResponse([
                "February 2026 — lofty-wuye-01",
                "January 2026 — lofty-wuye-01",
            ]),
        );
        mockValuesGet.mockResolvedValue({ data: { values: [] } });

        await appendBookingRowToSheet(baseBookingRow);

        expect(mockSpreadsheetsGet).toHaveBeenCalledTimes(1);
        expect(mockValuesGet.mock.calls.map(([args]) => args.range)).toEqual([
            "'January 2026 — lofty-wuye-01'!J:J",
            "'February 2026 — lofty-wuye-01'!J:J",
        ]);
        expect(mockValuesAppend).toHaveBeenCalledWith(
            expect.objectContaining({
                range: "'February 2026 — lofty-wuye-01'!B5:J",
            }),
        );
    });

    it("does not scan fallback tabs or append when the invoice is found first", async () => {
        mockSpreadsheetsGet.mockResolvedValueOnce(
            sheetTitleResponse([
                "February 2026 — lofty-wuye-01",
                "January 2026 — lofty-wuye-01",
            ]),
        );
        mockValuesGet.mockResolvedValueOnce({
            data: { values: [[""], ["LXH-260105-ABCDEF"]] },
        });

        await appendBookingRowToSheet(baseBookingRow);

        expect(mockValuesGet).toHaveBeenCalledTimes(1);
        expect(mockValuesGet).toHaveBeenCalledWith(
            expect.objectContaining({
                range: "'January 2026 — lofty-wuye-01'!J:J",
            }),
        );
        expect(mockValuesAppend).not.toHaveBeenCalled();
    });

    it("checks compound invoice-month tabs first when updating stayed status", async () => {
        mockSpreadsheetsGet.mockResolvedValueOnce(
            sheetTitleResponse([
                "February 2026 — lofty-wuye-01",
                "January 2026 — lofty-wuye-01",
            ]),
        );
        mockValuesGet.mockResolvedValueOnce({
            data: { values: [[""], ["LXH-260105-ABCDEF"]] },
        });

        const result = await setStayedByInvoiceId({
            invoiceId: "LXH-260105-ABCDEF",
            stayed: false,
        });

        expect(mockSpreadsheetsGet).toHaveBeenCalledTimes(1);
        expect(mockValuesGet).toHaveBeenCalledTimes(1);
        expect(mockValuesUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                range: "'January 2026 — lofty-wuye-01'!I2",
                requestBody: { values: [[false]] },
            }),
        );
        expect(result).toEqual({
            sheetTitle: "January 2026 — lofty-wuye-01",
            rowNumber: 2,
        });
    });

    it("uses service account JSON env credentials in production-style environments", async () => {
        process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON = JSON.stringify({
            client_email: "sheets-writer@example.iam.gserviceaccount.com",
            private_key: "-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n",
        });
        mockSpreadsheetsGet.mockResolvedValueOnce(
            sheetTitleResponse(["February 2026 — lofty-wuye-01"]),
        );
        mockValuesGet.mockResolvedValue({ data: { values: [] } });

        await appendBookingRowToSheet(baseBookingRow);

        expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
            expect.objectContaining({
                credentials: expect.objectContaining({
                    client_email: "sheets-writer@example.iam.gserviceaccount.com",
                    private_key:
                        "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n",
                }),
                scopes: ["https://www.googleapis.com/auth/spreadsheets"],
            }),
        );
        expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
            expect.not.objectContaining({ keyFile: expect.any(String) }),
        );
    });

    it("parses JSON accidentally placed in file-path credential env vars", async () => {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = JSON.stringify({
            client_email: "fallback@example.iam.gserviceaccount.com",
            private_key: "-----BEGIN PRIVATE KEY-----\\nxyz\\n-----END PRIVATE KEY-----\\n",
        });
        mockSpreadsheetsGet.mockResolvedValueOnce(
            sheetTitleResponse(["February 2026 — lofty-wuye-01"]),
        );
        mockValuesGet.mockResolvedValue({ data: { values: [] } });

        await appendBookingRowToSheet(baseBookingRow);

        expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
            expect.objectContaining({
                credentials: expect.objectContaining({
                    client_email: "fallback@example.iam.gserviceaccount.com",
                    private_key:
                        "-----BEGIN PRIVATE KEY-----\nxyz\n-----END PRIVATE KEY-----\n",
                }),
            }),
        );
    });
});
