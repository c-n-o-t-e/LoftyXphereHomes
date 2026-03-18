import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/app/error";
import NotFound from "@/app/not-found";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("App router error/not-found pages", () => {
  it("renders not-found page content", () => {
    render(<NotFound />);
    expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse apartments/i)).toBeInTheDocument();
  });

  it("renders error boundary and calls reset", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const reset = jest.fn();
    render(<ErrorBoundary error={new Error("boom")} reset={reset} />);
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

