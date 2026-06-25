import { render, screen } from "@testing-library/react";
import AppLoading from "@/app/loading";
import ApartmentsLoading from "@/app/apartments/loading";
import MyBookingsLoading from "@/app/my-bookings/loading";

describe("App router loading UIs", () => {
  it("renders no app-level skeleton (intentionally null)", () => {
    const { container } = render(<AppLoading />);
    expect(container.firstChild).toBeNull();
  });

  it("renders apartments loading skeleton", () => {
    const { container } = render(<ApartmentsLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders my-bookings loading skeleton", () => {
    const { container } = render(<MyBookingsLoading />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

