import { render, screen, waitFor } from "@testing-library/react";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
    usePathname: () => "/admin/bookings",
}));

jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: { alt?: string }) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img alt={props.alt ?? ""} />;
    },
}));

jest.mock("@/components/AuthProvider", () => ({
    useAuth: jest.fn(),
}));

jest.mock("@/hooks/useAdminMe", () => ({
    useAdminMe: jest.fn(),
}));

const { useAuth } = require("@/components/AuthProvider");
const { useAdminMe } = require("@/hooks/useAdminMe");

describe("AdminAuthGate", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects unauthenticated users to login", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            isLoading: false,
        });
        (useAdminMe as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        render(
            <AdminAuthGate>
                <div>Secret admin content</div>
            </AdminAuthGate>,
        );

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(
                "/login?redirect=%2Fadmin%2Fbookings",
            );
        });
        expect(screen.queryByText("Secret admin content")).not.toBeInTheDocument();
    });

    it("shows access required when signed in but not staff", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: "u1", email: "guest@example.com" },
            isLoading: false,
        });
        (useAdminMe as jest.Mock).mockReturnValue({
            data: { ok: false, error: "Forbidden" },
            isLoading: false,
        });

        render(
            <AdminAuthGate>
                <div>Secret admin content</div>
            </AdminAuthGate>,
        );

        expect(
            await screen.findByText(/admin access required/i),
        ).toBeInTheDocument();
    });

    it("renders children for authorized staff", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: "u1", email: "admin@example.com" },
            isLoading: false,
            signOut: jest.fn(),
        });
        (useAdminMe as jest.Mock).mockReturnValue({
            data: { ok: true, role: "admin", email: "admin@example.com" },
            isLoading: false,
        });

        render(
            <AdminAuthGate>
                <div>Secret admin content</div>
            </AdminAuthGate>,
        );

        expect(await screen.findByText("Secret admin content")).toBeInTheDocument();
    });

    it("blocks receptionists from admin-only areas", async () => {
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: "u1", email: "desk@example.com" },
            isLoading: false,
        });
        (useAdminMe as jest.Mock).mockReturnValue({
            data: { ok: true, role: "receptionist", email: "desk@example.com" },
            isLoading: false,
        });

        render(
            <AdminAuthGate allowedRoles={["admin"]}>
                <div>Admin-only content</div>
            </AdminAuthGate>,
        );

        expect(
            await screen.findByText(/insufficient permissions/i),
        ).toBeInTheDocument();
    });
});
