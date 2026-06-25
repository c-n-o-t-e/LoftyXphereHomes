import { render, screen, waitFor } from "@testing-library/react";
import MyBookingsPage from "@/app/my-bookings/page";
import { renderWithQueryClient } from "@/lib/testing/render-with-query-client";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn() }),
    usePathname: () => "/my-bookings",
    useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/components/AuthProvider", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@/lib/supabase/client", () => ({
    getSupabaseClient: jest.fn(),
}));

const { useAuth } = require("@/components/AuthProvider");
const { getSupabaseClient } = require("@/lib/supabase/client");

describe("MyBookingsPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { access_token: "token_user" } },
                }),
            },
        });
    });

    it("redirects unauthenticated users to login", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
        });

        renderWithQueryClient(<MyBookingsPage />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login?redirect=/my-bookings");
        });
    });

    it("renders empty state for authenticated users with no bookings", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: "user_1", email: "guest@example.com" },
            isLoading: false,
        });

        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ bookings: [], nextCursor: null }),
        } as Response);

        renderWithQueryClient(<MyBookingsPage />);

        expect(await screen.findByText(/no bookings yet/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /browse apartments/i })).toHaveAttribute(
            "href",
            "/apartments",
        );
    });

    it("renders upcoming bookings from the API", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: "user_1", email: "guest@example.com" },
            isLoading: false,
        });

        const futureCheckIn = new Date();
        futureCheckIn.setDate(futureCheckIn.getDate() + 14);
        const futureCheckOut = new Date(futureCheckIn);
        futureCheckOut.setDate(futureCheckOut.getDate() + 3);

        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                bookings: [
                    {
                        id: "bk_1",
                        reference: "ref_1",
                        apartmentId: "lofty-horizon-suite",
                        checkIn: futureCheckIn.toISOString().slice(0, 10),
                        checkOut: futureCheckOut.toISOString().slice(0, 10),
                        nights: 3,
                        amountPaid: 300_000,
                        status: "PAID",
                        bookerName: "Jane Doe",
                        createdAt: new Date().toISOString(),
                        invoiceReady: false,
                    },
                ],
                nextCursor: null,
            }),
        } as Response);

        renderWithQueryClient(<MyBookingsPage />);

        expect(await screen.findByText(/upcoming bookings/i)).toBeInTheDocument();
        expect(screen.getByText(/horizon suite/i)).toBeInTheDocument();
        expect(screen.getByText(/ref_1/i)).toBeInTheDocument();
    });
});
