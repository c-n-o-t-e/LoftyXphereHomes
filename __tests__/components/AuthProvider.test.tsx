import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGetUser = jest.fn();
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChange = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    usePathname: () => "/",
}));

jest.mock("@/lib/supabase/client", () => ({
    getSupabaseClient: jest.fn(),
}));

const { getSupabaseClient } = require("@/lib/supabase/client");

function AuthProbe() {
    const { user, isLoading, authError } = useAuth();
    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="user">{user?.email ?? "none"}</span>
            <span data-testid="error">{authError ?? "none"}</span>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();

        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
        });

        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getUser: mockGetUser,
                getSession: mockGetSession,
                signOut: mockSignOut,
                onAuthStateChange: mockOnAuthStateChange,
            },
        });
    });

    it("exposes the signed-in user after initial session load", async () => {
        mockGetUser.mockResolvedValue({
            data: { user: { id: "u1", email: "guest@example.com" } },
            error: null,
        });
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: "token_1" } },
        });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("false");
        });

        expect(screen.getByTestId("user")).toHaveTextContent("guest@example.com");
        expect(screen.getByTestId("error")).toHaveTextContent("none");
    });

    it("sets auth error when initial session load fails", async () => {
        mockGetUser.mockResolvedValue({
            data: { user: null },
            error: new Error("network down"),
        });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("error")).toHaveTextContent(
                /couldn't verify your sign-in status/i,
            );
        });
    });

    it("does not set auth error when no session exists (logged out visitor)", async () => {
        mockGetUser.mockResolvedValue({
            data: { user: null },
            error: { name: "AuthSessionMissingError", message: "Auth session missing!" },
        });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("false");
        });

        expect(screen.getByTestId("user")).toHaveTextContent("none");
        expect(screen.getByTestId("error")).toHaveTextContent("none");
    });

    it("refreshes stale client timestamps instead of expiring immediately", async () => {
        const staleStart = String(Date.now() - 7 * 24 * 60 * 60 * 1000);
        localStorage.setItem("lxh:auth:user_id", "u1");
        localStorage.setItem("lxh:auth:session_start_ms", staleStart);
        localStorage.setItem("lxh:auth:last_activity_ms", staleStart);

        mockGetUser.mockResolvedValue({
            data: { user: { id: "u1", email: "guest@example.com" } },
            error: null,
        });
        mockGetSession.mockResolvedValue({
            data: { session: { access_token: "token_1" } },
        });

        render(
            <AuthProvider>
                <AuthProbe />
            </AuthProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("false");
        });

        expect(screen.getByTestId("user")).toHaveTextContent("guest@example.com");
        expect(screen.getByTestId("error")).toHaveTextContent("none");
        expect(Number(localStorage.getItem("lxh:auth:last_activity_ms"))).toBeGreaterThan(
            Number(staleStart),
        );
        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it("throws when useAuth is used outside AuthProvider", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<AuthProbe />)).toThrow(
            /must be used within an AuthProvider/i,
        );

        consoleSpy.mockRestore();
    });
});
