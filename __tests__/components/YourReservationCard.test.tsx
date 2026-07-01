import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YourReservationCard } from "@/components/YourReservationCard";
import { renderWithQueryClient } from "@/lib/testing/render-with-query-client";

describe("YourReservationCard", () => {
    const defaultProps = {
        apartmentId: "horizon-suite",
        pricePerNight: 100_000,
        capacity: 2,
        beds: 1,
        baths: 1,
        bookingUrl: null as string | null,
    };

    beforeEach(() => {
        jest.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
            const url = String(input);
            if (url.includes("/api/payments/available")) {
                return {
                    ok: true,
                    json: async () => ({ providers: ["paystack"] }),
                } as Response;
            }
            return {
                ok: true,
                json: async () => ({ blockedDates: [], bookingRanges: [] }),
            } as Response;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders coming soon state when not bookable", () => {
        renderWithQueryClient(
            <YourReservationCard
                {...defaultProps}
                bookable={false}
                apartmentName="Horizon Suite"
            />,
        );

        expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /register interest/i })).toHaveAttribute(
            "href",
            expect.stringContaining("/contact?category=booking"),
        );
    });

    it("renders external booking link when bookingUrl is set", () => {
        renderWithQueryClient(
            <YourReservationCard {...defaultProps} bookingUrl="https://booking.example.com" />,
        );

        expect(screen.getByRole("link", { name: /book apartment/i })).toHaveAttribute(
            "href",
            "https://booking.example.com",
        );
    });

    it("shows validation when checkout is opened before check-in", async () => {
        renderWithQueryClient(<YourReservationCard {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /check-out/i }));

        expect(
            await screen.findByRole("alert"),
        ).toHaveTextContent(/select a check-in date first/i);
    });

    it("shows validation error for invalid email on checkout", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 1));

        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        renderWithQueryClient(<YourReservationCard {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /check-in/i }));
        const dayButtons = screen.getAllByRole("button", { name: "10" });
        fireEvent.click(dayButtons.find((b) => !b.hasAttribute("disabled"))!);

        await act(async () => {
            jest.advanceTimersByTime(200);
        });

        const checkoutButtons = screen.getAllByRole("button", { name: "12" });
        fireEvent.click(checkoutButtons.find((b) => !b.hasAttribute("disabled"))!);

        await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email address/i), "not-an-email");
        await user.type(screen.getByLabelText(/phone number/i), "+2348000000000");

        fireEvent.click(screen.getByRole("button", { name: /book apartment/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /valid email address/i,
        );

        jest.useRealTimers();
    });

    it("redirects to Paystack when initialize succeeds", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 1));

        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        const fetchMock = jest.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
            const url = String(input);
            if (url.includes("/api/payments/available")) {
                return {
                    ok: true,
                    json: async () => ({ providers: ["paystack"] }),
                } as Response;
            }
            if (url.includes("/api/availability")) {
                return {
                    ok: true,
                    json: async () => ({ blockedDates: [], bookingRanges: [] }),
                } as Response;
            }
            if (url.includes("/api/paystack/initialize")) {
                return {
                    ok: true,
                    json: async () => ({
                        authorization_url: "https://checkout.paystack.com/test",
                    }),
                } as Response;
            }
            throw new Error(`Unexpected fetch: ${url}`);
        });

        renderWithQueryClient(<YourReservationCard {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /check-in/i }));
        fireEvent.click(
            screen.getAllByRole("button", { name: "10" }).find((b) => !b.hasAttribute("disabled"))!,
        );

        await act(async () => {
            jest.advanceTimersByTime(200);
        });

        fireEvent.click(
            screen.getAllByRole("button", { name: "12" }).find((b) => !b.hasAttribute("disabled"))!,
        );

        await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
        await user.type(screen.getByLabelText(/phone number/i), "+2348000000000");

        fireEvent.click(screen.getByRole("button", { name: /book apartment/i }));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(
                "/api/paystack/initialize",
                expect.objectContaining({
                    method: "POST",
                    body: expect.stringContaining("jane@example.com"),
                }),
            );
        });

        jest.useRealTimers();
    });

    it("surfaces API validation errors and clears dates on 409 conflict", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 1));

        const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
        });

        jest.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
            const url = String(input);
            if (url.includes("/api/payments/available")) {
                return {
                    ok: true,
                    json: async () => ({ providers: ["paystack"] }),
                } as Response;
            }
            if (url.includes("/api/availability")) {
                return {
                    ok: true,
                    json: async () => ({ blockedDates: [], bookingRanges: [] }),
                } as Response;
            }
            if (url.includes("/api/paystack/initialize")) {
                return {
                    ok: false,
                    status: 409,
                    json: async () => ({
                        error: "Validation failed",
                        details: [{ message: "Dates are no longer available" }],
                    }),
                } as Response;
            }
            throw new Error(`Unexpected fetch: ${url}`);
        });

        renderWithQueryClient(<YourReservationCard {...defaultProps} />);

        fireEvent.click(screen.getByRole("button", { name: /check-in/i }));
        fireEvent.click(
            screen.getAllByRole("button", { name: "10" }).find((b) => !b.hasAttribute("disabled"))!,
        );

        await act(async () => {
            jest.advanceTimersByTime(200);
        });

        fireEvent.click(
            screen.getAllByRole("button", { name: "12" }).find((b) => !b.hasAttribute("disabled"))!,
        );

        await user.type(screen.getByLabelText(/full name/i), "Jane Doe");
        await user.type(screen.getByLabelText(/email address/i), "jane@example.com");
        await user.type(screen.getByLabelText(/phone number/i), "+2348000000000");

        fireEvent.click(screen.getByRole("button", { name: /book apartment/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            /dates are no longer available/i,
        );
        expect(screen.getByText(/select check-in date/i)).toBeInTheDocument();

        jest.useRealTimers();
    });
});
