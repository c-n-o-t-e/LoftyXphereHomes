"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AnalyticsConsentStatus,
  type AnalyticsConsentValue,
  consentRequiresBanner,
  isAnalyticsAllowedByConsent,
  isMarketingAllowedByConsent,
  parseAnalyticsConsent,
  persistAnalyticsConsent,
  clearAnalyticsConsent,
} from "@/lib/analytics/consent";

type CookieConsentContextValue = {
  consentRequired: boolean;
  consent: AnalyticsConsentStatus;
  showBanner: boolean;
  analyticsEnabled: boolean;
  marketingEnabled: boolean;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  reopenPreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null,
);

type CookieConsentProviderProps = {
  children: ReactNode;
  consentRequired: boolean;
  initialConsent?: AnalyticsConsentStatus;
};

export function CookieConsentProvider({
  children,
  consentRequired,
  initialConsent = "pending",
}: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<AnalyticsConsentStatus>(initialConsent);
  const [showPreferences, setShowPreferences] = useState(false);

  const applyConsent = useCallback((value: AnalyticsConsentValue) => {
    persistAnalyticsConsent(value);
    setConsent(value);
    setShowPreferences(false);
  }, []);

  const acceptAnalytics = useCallback(() => {
    applyConsent("granted");
  }, [applyConsent]);

  const rejectAnalytics = useCallback(() => {
    applyConsent("denied");
  }, [applyConsent]);

  const reopenPreferences = useCallback(() => {
    clearAnalyticsConsent();
    setConsent("pending");
    setShowPreferences(true);
  }, []);

  const showBanner =
    showPreferences ||
    consentRequiresBanner(consentRequired, consent);

  const analyticsEnabled = isAnalyticsAllowedByConsent(
    consentRequired,
    consent,
  );

  const marketingEnabled = isMarketingAllowedByConsent(
    consentRequired,
    consent,
  );

  const value = useMemo(
    () => ({
      consentRequired,
      consent,
      showBanner,
      analyticsEnabled,
      marketingEnabled,
      acceptAnalytics,
      rejectAnalytics,
      reopenPreferences,
    }),
    [
      consentRequired,
      consent,
      showBanner,
      analyticsEnabled,
      marketingEnabled,
      acceptAnalytics,
      rejectAnalytics,
      reopenPreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}

export function useOptionalCookieConsent(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext);
}
