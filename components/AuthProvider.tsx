"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  clampNow,
  computeSessionExpiry,
  isMissingAuthSessionError,
  isProtectedAuthRoute,
  readSessionTimestamps,
  safeParseMs,
  SESSION_POLICIES,
  SESSION_STORAGE_KEYS,
  writeSessionTimestamps,
  type SessionPolicyId,
} from "@/lib/auth/sessionPolicy";

const SESSION_INIT_ERROR =
  "We couldn't verify your sign-in status. Check your connection and try again.";
const SESSION_EXPIRED_ERROR = "Your session expired. Please sign in again.";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [policyId, setPolicyId] = useState<SessionPolicyId>("customer");
  const router = useRouter();
  const pathname = usePathname();
  const isSigningOutRef = useRef(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const policy = useMemo(() => SESSION_POLICIES[policyId], [policyId]);

  const clearSessionTimeoutStorage = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEYS.sessionStartMs);
      localStorage.removeItem(SESSION_STORAGE_KEYS.lastActivityMs);
      localStorage.removeItem(SESSION_STORAGE_KEYS.policyId);
      localStorage.removeItem(SESSION_STORAGE_KEYS.userId);
    } catch {
      // ignore
    }
  }, []);

  const ensureSessionTimeoutStorageInitialized = useCallback(
    (nextUserId: string, opts?: { forceReset?: boolean }) => {
      const nowMs = Date.now();
      try {
        const storedUserId = localStorage.getItem(SESSION_STORAGE_KEYS.userId);

        if (opts?.forceReset || storedUserId !== nextUserId) {
          writeSessionTimestamps(nextUserId, policyId, nowMs);
          return;
        }

        const timestamps = readSessionTimestamps();
        const expiry = computeSessionExpiry({ nowMs, policy, timestamps });

        // Supabase still trusts this session — refresh stale client-side timers
        // instead of treating a return visit as an immediate timeout.
        if (expiry.expired) {
          writeSessionTimestamps(nextUserId, policyId, nowMs);
          return;
        }

        if (!timestamps.sessionStartMs) {
          localStorage.setItem(
            SESSION_STORAGE_KEYS.sessionStartMs,
            String(nowMs),
          );
        }
        if (!timestamps.lastActivityMs) {
          localStorage.setItem(
            SESSION_STORAGE_KEYS.lastActivityMs,
            String(nowMs),
          );
        }
      } catch {
        // ignore
      }
    },
    [policy, policyId],
  );

  const bumpLastActivity = useCallback(() => {
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEYS.lastActivityMs,
        String(Date.now()),
      );
    } catch {
      // ignore
    }
  }, []);

  const signOutInternal = useCallback(
    async (opts?: { reason?: "expired"; redirectTo?: string }) => {
      if (isSigningOutRef.current) return;
      isSigningOutRef.current = true;

      const supabase = getSupabaseClient();
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      } finally {
        setUser(null);
        setSession(null);
        clearSessionTimeoutStorage();
        isSigningOutRef.current = false;
      }

      if (opts?.reason === "expired") {
        setAuthError(SESSION_EXPIRED_ERROR);
      }

      if (opts?.redirectTo) {
        router.push(opts.redirectTo);
      }
    },
    [clearSessionTimeoutStorage, router],
  );

  const enforceSessionExpiry = useCallback(() => {
    if (!user?.id || !session?.access_token) return false;

    const nowMs = clampNow(Date.now());
    const expiry = computeSessionExpiry({
      nowMs,
      policy,
      timestamps: readSessionTimestamps(),
    });

    if (!expiry.expired) return false;

    const protectedRoute = isProtectedAuthRoute(pathname);
    void signOutInternal({
      reason: protectedRoute ? "expired" : undefined,
      redirectTo: protectedRoute
        ? `/login?redirect=${encodeURIComponent(pathname || "/")}`
        : undefined,
    });
    return true;
  }, [pathname, policy, session?.access_token, signOutInternal, user?.id]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    const loadInitialSession = async () => {
      try {
        const {
          data: { user: initialUser },
          error,
        } = await supabase.auth.getUser();
        if (cancelled) return;

        if (error) {
          if (isMissingAuthSessionError(error)) {
            setSession(null);
            setUser(null);
            return;
          }
          throw error;
        }

        const initialSession = initialUser
          ? (await supabase.auth.getSession()).data.session
          : null;
        setSession(initialSession);
        setUser(initialUser ?? null);
        if (initialUser?.id) {
          ensureSessionTimeoutStorageInitialized(initialUser.id);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("AuthProvider: getSession failed", err);
        setAuthError(SESSION_INIT_ERROR);
        setSession(null);
        setUser(null);
        clearSessionTimeoutStorage();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
      if (nextSession) setAuthError(null);
      if (!nextSession?.user?.id) {
        clearSessionTimeoutStorage();
      } else {
        ensureSessionTimeoutStorageInitialized(nextSession.user.id, {
          forceReset: event === "SIGNED_IN",
        });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [clearSessionTimeoutStorage, ensureSessionTimeoutStorageInitialized]);

  // Customer policy on public routes; staff policy only applies under /admin.
  useEffect(() => {
    if (!pathname?.startsWith("/admin")) {
      setPolicyId("customer");
    }
  }, [pathname]);

  // Track user activity for idle timeout. (Only when logged in.)
  useEffect(() => {
    if (!user?.id) return;

    const onActivity = () => bumpLastActivity();
    const onVisibility = () => {
      if (!document.hidden) bumpLastActivity();
    };

    window.addEventListener("click", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("focus", onActivity);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("focus", onActivity);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [bumpLastActivity, user?.id]);

  // Enforce idle + absolute timeouts (best-effort, client-side).
  useEffect(() => {
    if (!user?.id || !session?.access_token) return;

    enforceSessionExpiry();

    const interval = window.setInterval(() => {
      enforceSessionExpiry();
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [enforceSessionExpiry, session?.access_token, user?.id]);

  // If the user is accessing /admin and is confirmed staff, enforce staff-level timeouts.
  useEffect(() => {
    if (!user?.id || !session?.access_token) return;
    if (!pathname?.startsWith("/admin")) return;

    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/admin/me", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as
          | { ok: true; role: "admin" | "receptionist"; email: string }
          | { ok: false; error: string };
        if (cancelled) return;
        if (json.ok === true) {
          setPolicyId("staff");
          try {
            writeSessionTimestamps(user.id, "staff");
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore (keep customer policy)
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, session?.access_token, user?.id]);

  // Link bookings to userId after login (best-effort).
  useEffect(() => {
    if (!session?.access_token || !user?.email || !user?.id) return;
    void fetch("/api/link-bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {
      // ignore
    });
  }, [session?.access_token, user?.email, user?.id]);

  const signOut = async () => {
    clearAuthError();
    await signOutInternal({ redirectTo: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        authError,
        clearAuthError,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
