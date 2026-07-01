import { buildBookingSuccessCallbackUrl } from "@/lib/payments/successCallbackUrl";

describe("buildBookingSuccessCallbackUrl", () => {
    it("includes reference and provider query params", () => {
        expect(
            buildBookingSuccessCallbackUrl(
                "https://example.com",
                "ref_fw_123",
                "flutterwave",
            ),
        ).toBe(
            "https://example.com/booking/success?reference=ref_fw_123&provider=flutterwave",
        );
    });

    it("strips trailing slash from base URL", () => {
        expect(
            buildBookingSuccessCallbackUrl(
                "https://example.com/",
                "ref_1",
                "paystack",
            ),
        ).toBe(
            "https://example.com/booking/success?reference=ref_1&provider=paystack",
        );
    });
});
