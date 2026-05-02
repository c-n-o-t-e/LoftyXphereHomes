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

