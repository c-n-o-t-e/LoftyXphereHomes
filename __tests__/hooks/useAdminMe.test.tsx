import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminMe } from "@/hooks/useAdminMe";

jest.mock("@/lib/supabase/client", () => ({
    getSupabaseClient: jest.fn(),
}));

const { getSupabaseClient } = require("@/lib/supabase/client");

function wrapper({ children }: { children: React.ReactNode }) {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useAdminMe", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns admin profile when /api/admin/me succeeds", async () => {
        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { access_token: "token_admin" } },
                }),
            },
        });

        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                ok: true,
                role: "admin",
                email: "admin@example.com",
            }),
        } as Response);

        const { result } = renderHook(
            () => useAdminMe(true, "user_123"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(globalThis.fetch).toHaveBeenCalledWith("/api/admin/me", {
            headers: { Authorization: "Bearer token_admin" },
        });
        expect(result.current.data).toEqual({
            ok: true,
            role: "admin",
            email: "admin@example.com",
        });
    });

    it("returns unauthorized when there is no session token", async () => {
        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: null },
                }),
            },
        });

        const fetchSpy = jest.spyOn(globalThis, "fetch");

        const { result } = renderHook(
            () => useAdminMe(true, "user_123"),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(fetchSpy).not.toHaveBeenCalled();
        expect(result.current.data).toEqual({
            ok: false,
            error: "Unauthorized",
        });
    });

    it("does not run when disabled", () => {
        const fetchSpy = jest.spyOn(globalThis, "fetch");

        renderHook(() => useAdminMe(false, "user_123"), { wrapper });

        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
