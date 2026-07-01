import {
    isValidBookerEmail,
    resolveBookerEmail,
    sanitizePaymentCustomerEmail,
} from "@/lib/booking/email";

describe("booker email resolution", () => {
    it("sanitizes Flutterwave-style prefixed customer email", () => {
        expect(
            sanitizePaymentCustomerEmail(
                "ravesb_7934ae3a184c596908ba_nwagbogwuchukwudi@gmail.com",
            ),
        ).toBe("nwagbogwuchukwudi@gmail.com");
    });

    it("leaves normal emails unchanged", () => {
        expect(sanitizePaymentCustomerEmail("guest@example.com")).toBe(
            "guest@example.com",
        );
    });

    it("prefers checkout hold email over payment provider email", () => {
        expect(
            resolveBookerEmail({
                holdEmail: "checkout@example.com",
                paymentEmail: "ravesb_abc_checkout@example.com",
            }),
        ).toBe("checkout@example.com");
    });

    it("falls back to sanitized payment email when hold is missing", () => {
        expect(
            resolveBookerEmail({
                paymentEmail: "ravesb_7934ae3a184c596908ba_nwagbogwuchukwudi@gmail.com",
            }),
        ).toBe("nwagbogwuchukwudi@gmail.com");
    });

    it("validates email shape", () => {
        expect(isValidBookerEmail("a@b.co")).toBe(true);
        expect(isValidBookerEmail("not-an-email")).toBe(false);
    });
});
