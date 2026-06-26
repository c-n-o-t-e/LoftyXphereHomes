"use client";

import { useOptionalCookieConsent } from "@/components/analytics/CookieConsentContext";

export function CookieSettingsLink() {
  const consent = useOptionalCookieConsent();

  if (!consent?.consentRequired) return null;

  return (
    <button
      type="button"
      onClick={consent.reopenPreferences}
      className="hover:text-[#FA5C5C] transition-colors text-sm text-white/80 text-left"
    >
      Cookie settings
    </button>
  );
}
