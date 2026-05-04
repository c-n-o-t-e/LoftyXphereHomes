# Backend & Google Sheets — booking ops contract

This documents the **Next.js** implementation (see [`lib/ops/googleSheets.ts`](../lib/ops/googleSheets.ts), [`lib/ops/bookingJobs.ts`](../lib/ops/bookingJobs.ts), [`app/api/admin/bookings/cancel/route.ts`](../app/api/admin/bookings/cancel/route.ts)).

## Booking tabs (month + apartment)

Google Sheets does not support nested or grouped tabs. Each logical “month bucket” is split into **one tab per apartment**: compound titles like **`May 2026 — lofty-wuye-01`**.

- **Month segment:** `{Month} {Year}` in English (same as `formatMonthTabTitle`) from the calendar month of **check-in** (with legacy-style `deriveStayStartDate` for year-less strings), else booking `createdAt` month — `sheetMonthDateForBooking` in [`lib/ops/dates.ts`](../lib/ops/dates.ts).
- **Apartment segment:** booking `apartmentId` (same value as column **Room Code**), passed through `sanitizeSheetTitleApartmentSegment` (removes characters invalid in sheet names) and truncated so the full title stays within **100** characters — `formatMonthApartmentTabTitle`.

**Legacy tabs:** Older spreadsheets may still have single tabs named only `August 2026` (all units mixed). Those are **not** migrated automatically; new bookings create new per-apartment tabs. Staff can move historical rows manually if they want one convention.

**Cancel / stayed updates:** Still locate the row by scanning **all** tabs for `invoiceId` in column **J** (unchanged).

## Layout (new tabs only)

- Branding `B1:B2`, header `B4:J4`, monthly total helper `K1:K3` with `=SUMIFS(G:G,I:I,TRUE)`.
- Data appended to **`B5:J`** with `USER_ENTERED`.
- Full styling (freeze, merges, column widths, number formats, filters, conditional strike-through when `Stayed` is FALSE) applied once when the tab is created.

## Create booking

- Website and manual flows enqueue `INVOICE_PDF` then `GOOGLE_SHEETS` jobs.
- Append is **idempotent** on `invoiceId` (scans all tabs for column **J** before inserting).

## Cancel booking

- Authenticated admin: `POST /api/admin/bookings/cancel` with JSON `{ "invoiceId": "<id or free text>" }`.
- Resolves `LXH-…` via `resolveInvoiceIdFromFormInput` in [`lib/ops/invoiceId.ts`](../lib/ops/invoiceId.ts).
- Sets `Booking.status` to `CANCELLED` and updates sheet column **I** (`Stayed`) to `FALSE` when the row exists.

## Environment

- Spreadsheet: `GOOGLE_SHEETS_SPREADSHEET_ID` or `SHEET_ID`.
- Credentials: `GOOGLE_APPLICATION_CREDENTIALS` or `GOOGLE_SHEETS_CREDENTIALS_PATH` (or `credentials.json` fallback).
