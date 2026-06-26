import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApartmentAvailability } from "@/hooks/useApartmentAvailability";

function wrapper({ children }: { children: React.ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useApartmentAvailability", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("fetches availability for the apartment id", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                blockedDates: ["2026-06-10"],
                bookingRanges: [{ checkIn: "2026-06-10", checkOut: "2026-06-12" }],
            }),
        } as Response);

        const { result } = renderHook(
            () => useApartmentAvailability("horizon-suite"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(globalThis.fetch).toHaveBeenCalledWith(
            "/api/availability?apartmentId=horizon-suite",
            { cache: "no-store" },
        );
        expect(result.current.data).toEqual({
            blockedDates: ["2026-06-10"],
            bookingRanges: [{ checkIn: "2026-06-10", checkOut: "2026-06-12" }],
        });
    });

    it("does not fetch when apartment id is empty", () => {
        const fetchSpy = jest.spyOn(globalThis, "fetch");

        renderHook(() => useApartmentAvailability(""), { wrapper });

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("surfaces errors when availability request fails", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 500,
        } as Response);

        const { result } = renderHook(
            () => useApartmentAvailability("horizon-suite"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(
            expect.objectContaining({ message: "Failed to load availability" }),
        );
    });
});
