export type SessionPolicyId = "customer" | "staff";

export type SessionPolicy = {
  id: SessionPolicyId;
  idleTimeoutMs: number;
  absoluteTimeoutMs: number;
};

export const SESSION_POLICIES: Record<SessionPolicyId, SessionPolicy> = {
  customer: {
    id: "customer",
    idleTimeoutMs: 48 * 60 * 60 * 1000, // 48h
    absoluteTimeoutMs: 30 * 24 * 60 * 60 * 1000, // 30d
  },
  staff: {
    id: "staff",
    idleTimeoutMs: 30 * 60 * 1000, // 30m
    absoluteTimeoutMs: 12 * 60 * 60 * 1000, // 12h
  },
};

const STORAGE_PREFIX = "lxh:auth:";

export const SESSION_STORAGE_KEYS = {
  sessionStartMs: `${STORAGE_PREFIX}session_start_ms`,
  lastActivityMs: `${STORAGE_PREFIX}last_activity_ms`,
  policyId: `${STORAGE_PREFIX}policy_id`,
  userId: `${STORAGE_PREFIX}user_id`,
} as const;

export type SessionTimestamps = {
  sessionStartMs: number | null;
  lastActivityMs: number | null;
};

export type SessionExpiryReason = "idle" | "absolute";

export function computeSessionExpiry(input: {
  nowMs: number;
  policy: SessionPolicy;
  timestamps: SessionTimestamps;
}):
  | { expired: false }
  | {
      expired: true;
      reason: SessionExpiryReason;
      expiredAtMs: number;
    } {
  const { nowMs, policy, timestamps } = input;
  if (!Number.isFinite(nowMs)) return { expired: false };

  const start = timestamps.sessionStartMs;
  const last = timestamps.lastActivityMs;

  if (typeof start === "number" && Number.isFinite(start)) {
    const absExpiry = start + policy.absoluteTimeoutMs;
    if (nowMs >= absExpiry) {
      return { expired: true, reason: "absolute", expiredAtMs: absExpiry };
    }
  }

  if (typeof last === "number" && Number.isFinite(last)) {
    const idleExpiry = last + policy.idleTimeoutMs;
    if (nowMs >= idleExpiry) {
      return { expired: true, reason: "idle", expiredAtMs: idleExpiry };
    }
  }

  return { expired: false };
}

export function safeParseMs(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n;
}

export function clampNow(nowMs: number): number {
  return Number.isFinite(nowMs) ? nowMs : Date.now();
}

export function readSessionTimestamps(): SessionTimestamps {
  try {
    return {
      sessionStartMs: safeParseMs(
        localStorage.getItem(SESSION_STORAGE_KEYS.sessionStartMs),
      ),
      lastActivityMs: safeParseMs(
        localStorage.getItem(SESSION_STORAGE_KEYS.lastActivityMs),
      ),
    };
  } catch {
    return { sessionStartMs: null, lastActivityMs: null };
  }
}

export function writeSessionTimestamps(
  userId: string,
  nextPolicyId: SessionPolicyId,
  nowMs = Date.now(),
): void {
  localStorage.setItem(SESSION_STORAGE_KEYS.userId, userId);
  localStorage.setItem(SESSION_STORAGE_KEYS.sessionStartMs, String(nowMs));
  localStorage.setItem(SESSION_STORAGE_KEYS.lastActivityMs, String(nowMs));
  localStorage.setItem(SESSION_STORAGE_KEYS.policyId, nextPolicyId);
}

/** Routes where session expiry should sign the user out and show a message. */
export function isProtectedAuthRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith("/my-bookings") || pathname.startsWith("/admin")
  );
}

export function isMissingAuthSessionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";
  return (
    name === "AuthSessionMissingError" ||
    message.includes("Auth session missing")
  );
}

