import {
    parseInvoiceIdFromText,
    resolveInvoiceIdFromFormInput,
} from "@/lib/ops/invoiceId";

describe("invoiceId resolve (cancel form parity)", () => {
    it("parseInvoiceIdFromText finds embedded LXH id", () => {
        expect(
            parseInvoiceIdFromText("Please see invoice LXH-260414-7K3P9D thanks"),
        ).toBe("LXH-260414-7K3P9D");
    });

    it("resolveInvoiceIdFromFormInput accepts labeled text", () => {
        expect(
            resolveInvoiceIdFromFormInput("Invoice ID: LXH-260101-ABCDEF"),
        ).toBe("LXH-260101-ABCDEF");
    });

    it("resolveInvoiceIdFromFormInput returns null for garbage", () => {
        expect(resolveInvoiceIdFromFormInput("no id here")).toBeNull();
    });
});
