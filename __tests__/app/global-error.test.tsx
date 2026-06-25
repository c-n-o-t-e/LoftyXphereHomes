import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "@/app/global-error";

jest.mock("next/link", () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

jest.mock("@/lib/observability/logger", () => ({
    logger: {
        error: jest.fn(),
    },
}));

const { logger } = require("@/lib/observability/logger");

describe("GlobalError", () => {
    it("renders critical failure UI with recovery actions", () => {
        const reset = jest.fn();
        const error = Object.assign(new Error("root layout crashed"), {
            digest: "digest_123",
        });

        render(<GlobalError error={error} reset={reset} />);

        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
        expect(
            screen.getByText(/critical error occurred/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /go home/i })).toHaveAttribute(
            "href",
            "/",
        );

        fireEvent.click(screen.getByRole("button", { name: /try again/i }));
        expect(reset).toHaveBeenCalled();
    });

    it("logs the error with digest metadata", () => {
        const error = Object.assign(new Error("boom"), { digest: "digest_abc" });

        render(<GlobalError error={error} reset={jest.fn()} />);

        expect(logger.error).toHaveBeenCalledWith(
            "Global error boundary",
            error,
            { digest: "digest_abc" },
        );
    });
});
