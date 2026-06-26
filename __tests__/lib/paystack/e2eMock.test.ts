import {
    buildE2ePaystackReference,
    buildE2ePaystackVerifyResponse,
    isE2ePaystackMockEnabled,
    parseE2ePaystackReference,
} from "@/lib/paystack/e2eMock";

describe("paystack e2e mock", () => {
    const payload = {
        apartmentId: "horizon-suite",
        checkIn: "2026-12-15",
        checkOut: "2026-12-18",
    };

    it("builds and parses e2e references", () => {
        const reference = buildE2ePaystackReference(payload);
        expect(reference).toBe(
            "e2e:horizon-suite:2026-12-15:2026-12-18",
        );
        expect(parseE2ePaystackReference(reference)).toEqual(payload);
    });

    it("returns null for non-e2e references", () => {
        expect(parseE2ePaystackReference("ref_live_123")).toBeNull();
    });

    it("builds verify payload with server-computed amount", () => {
        const reference = buildE2ePaystackReference(payload);
        const response = buildE2ePaystackVerifyResponse(reference);

        expect(response?.status).toBe(true);
        expect(response?.data?.status).toBe("success");
        expect(response?.data?.metadata).toEqual(
            expect.objectContaining({
                apartment_id: payload.apartmentId,
                check_in: payload.checkIn,
                check_out: payload.checkOut,
            }),
        );
        expect(response?.data?.amount).toBeGreaterThan(0);
    });

    it("is disabled unless E2E_MOCK_PAYSTACK=true", () => {
        const previous = process.env.E2E_MOCK_PAYSTACK;
        delete process.env.E2E_MOCK_PAYSTACK;
        expect(isE2ePaystackMockEnabled()).toBe(false);
        process.env.E2E_MOCK_PAYSTACK = "true";
        expect(isE2ePaystackMockEnabled()).toBe(true);
        process.env.E2E_MOCK_PAYSTACK = previous;
    });
});
