import { render, screen, waitFor } from "@testing-library/react";
import { HeroVideoManager } from "@/components/admin/HeroVideoManager";

jest.mock("@/lib/supabase/client", () => ({
    getSupabaseClient: jest.fn(),
}));

jest.mock("@/lib/videos/directUploadClient", () => ({
    uploadHeroVideoDirect: jest.fn(),
}));

const { getSupabaseClient } = require("@/lib/supabase/client");

describe("HeroVideoManager", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { access_token: "token_admin" } },
                }),
            },
        });
    });

    it("renders empty state when no hero video is configured", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({ heroVideo: null }),
        } as Response);

        render(<HeroVideoManager />);

        expect(await screen.findByText(/no hero video yet/i)).toBeInTheDocument();
    });

    it("shows configured hero video details", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                heroVideo: {
                    id: "hv_1",
                    mobileMp4Url: "https://example.supabase.co/mobile.mp4",
                    desktopMp4Url: "https://example.supabase.co/desktop.mp4",
                    posterUrl: "https://example.supabase.co/poster.webp",
                    storageKeyBase: "hero/base",
                    isActive: true,
                    updatedAt: "2026-06-01T12:00:00.000Z",
                },
            }),
        } as Response);

        render(<HeroVideoManager />);

        expect(
            await screen.findByRole("heading", { name: /^current hero$/i }),
        ).toBeInTheDocument();
        expect(await screen.findByRole("button", { name: /replace hero video/i })).toBeInTheDocument();
    });

    it("surfaces load errors from the admin API", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "Forbidden" }),
        } as Response);

        render(<HeroVideoManager />);

        expect(await screen.findByText(/forbidden/i)).toBeInTheDocument();
    });
});
