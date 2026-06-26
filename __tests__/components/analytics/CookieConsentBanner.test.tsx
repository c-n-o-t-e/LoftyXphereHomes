import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsentBanner } from "@/components/analytics/CookieConsentBanner";
import { CookieConsentProvider } from "@/components/analytics/CookieConsentContext";

function renderBanner(initialConsent: "pending" | "granted" | "denied" = "pending") {
  return render(
    <CookieConsentProvider consentRequired initialConsent={initialConsent}>
      <CookieConsentBanner />
    </CookieConsentProvider>,
  );
}

describe("CookieConsentBanner", () => {
  it("shows for EEA visitors without a prior choice", () => {
    renderBanner("pending");

    expect(
      screen.getByRole("dialog", { name: /cookies & analytics/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reject analytics/i })).toBeInTheDocument();
  });

  it("hides after accepting analytics", async () => {
    const user = userEvent.setup();
    renderBanner("pending");

    await user.click(screen.getByRole("button", { name: /accept analytics/i }));

    expect(
      screen.queryByRole("dialog", { name: /cookies & analytics/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show when consent was already denied", () => {
    renderBanner("denied");

    expect(
      screen.queryByRole("dialog", { name: /cookies & analytics/i }),
    ).not.toBeInTheDocument();
  });
});
