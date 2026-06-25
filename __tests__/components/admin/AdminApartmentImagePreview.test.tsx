import { render, screen, waitFor } from "@testing-library/react";
import { AdminApartmentImagePreview } from "@/components/admin/AdminApartmentImagePreview";

jest.mock("@/lib/supabase/client", () => ({
    getSupabaseClient: jest.fn(),
}));

const { getSupabaseClient } = require("@/lib/supabase/client");

describe("AdminApartmentImagePreview", () => {
    beforeAll(() => {
        if (typeof URL.createObjectURL !== "function") {
            URL.createObjectURL = jest.fn(() => "blob:preview");
        }
        if (typeof URL.revokeObjectURL !== "function") {
            URL.revokeObjectURL = jest.fn();
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
        jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
        (getSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                getSession: jest.fn().mockResolvedValue({
                    data: { session: { access_token: "token_admin" } },
                }),
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("loads preview image from the admin preview API", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: true,
            blob: async () => new Blob(["img"], { type: "image/webp" }),
        } as Response);

        render(
            <AdminApartmentImagePreview
                apartmentId="lofty-horizon-suite"
                imageId="img_1"
                alt="Suite photo"
            />,
        );

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "/api/admin/apartments/lofty-horizon-suite/images/img_1/preview?variant=medium",
                { headers: { Authorization: "Bearer token_admin" } },
            );
        });

        expect(await screen.findByRole("img", { name: "Suite photo" })).toHaveAttribute(
            "src",
            "blob:preview",
        );
    });

    it("shows fallback when preview cannot be loaded", async () => {
        jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
            ok: false,
            status: 404,
        } as Response);

        render(
            <AdminApartmentImagePreview
                apartmentId="lofty-horizon-suite"
                imageId="img_missing"
                alt="Missing photo"
            />,
        );

        expect(
            await screen.findByText(/preview unavailable — delete and re-upload/i),
        ).toBeInTheDocument();
    });
});
