import {
  SESSION_POLICIES,
  computeSessionExpiry,
  isMissingAuthSessionError,
  isProtectedAuthRoute,
  safeParseMs,
  writeSessionTimestamps,
} from "@/lib/auth/sessionPolicy";

describe("sessionPolicy", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("safeParseMs", () => {
    it("returns null for empty and non-numeric values", () => {
      expect(safeParseMs(null)).toBeNull();
      expect(safeParseMs("")).toBeNull();
      expect(safeParseMs("nope")).toBeNull();
    });

    it("returns null for zero/negative values", () => {
      expect(safeParseMs("0")).toBeNull();
      expect(safeParseMs("-1")).toBeNull();
    });

    it("parses a positive finite number", () => {
      expect(safeParseMs("123")).toBe(123);
      expect(safeParseMs("123.5")).toBe(123.5);
    });
  });

  describe("computeSessionExpiry", () => {
    it("does not expire when timestamps are missing", () => {
      const now = 1_000_000;
      const res = computeSessionExpiry({
        nowMs: now,
        policy: SESSION_POLICIES.staff,
        timestamps: { sessionStartMs: null, lastActivityMs: null },
      });
      expect(res).toEqual({ expired: false });
    });

    it("expires by idle timeout when idle threshold is reached", () => {
      const policy = { id: "staff" as const, idleTimeoutMs: 10, absoluteTimeoutMs: 1_000 };
      const start = 100;
      const last = 200;
      const res = computeSessionExpiry({
        nowMs: last + policy.idleTimeoutMs,
        policy,
        timestamps: { sessionStartMs: start, lastActivityMs: last },
      });
      expect(res).toEqual(
        expect.objectContaining({ expired: true, reason: "idle", expiredAtMs: 210 }),
      );
    });

    it("expires by absolute timeout even if active", () => {
      const policy = { id: "staff" as const, idleTimeoutMs: 10_000, absoluteTimeoutMs: 50 };
      const start = 100;
      const last = 140; // active, but absolute should win at 150
      const res = computeSessionExpiry({
        nowMs: 150,
        policy,
        timestamps: { sessionStartMs: start, lastActivityMs: last },
      });
      expect(res).toEqual(
        expect.objectContaining({
          expired: true,
          reason: "absolute",
          expiredAtMs: 150,
        }),
      );
    });

    it("does not expire just before thresholds", () => {
      const policy = { id: "customer" as const, idleTimeoutMs: 100, absoluteTimeoutMs: 200 };
      const start = 1_000;
      const last = 1_050;
      const res = computeSessionExpiry({
        nowMs: 1_149,
        policy,
        timestamps: { sessionStartMs: start, lastActivityMs: last },
      });
      expect(res).toEqual({ expired: false });
    });
  });

  describe("isProtectedAuthRoute", () => {
    it("treats my-bookings and admin as protected", () => {
      expect(isProtectedAuthRoute("/my-bookings")).toBe(true);
      expect(isProtectedAuthRoute("/admin/bookings")).toBe(true);
    });

    it("treats public marketing pages as unprotected", () => {
      expect(isProtectedAuthRoute("/")).toBe(false);
      expect(isProtectedAuthRoute("/apartments")).toBe(false);
      expect(isProtectedAuthRoute("/login")).toBe(false);
    });
  });

  describe("isMissingAuthSessionError", () => {
    it("detects Supabase missing-session errors", () => {
      expect(
        isMissingAuthSessionError({ name: "AuthSessionMissingError" }),
      ).toBe(true);
      expect(
        isMissingAuthSessionError(new Error("Auth session missing!")),
      ).toBe(true);
      expect(isMissingAuthSessionError(new Error("network down"))).toBe(false);
    });
  });

  describe("writeSessionTimestamps", () => {
    it("writes all session tracking keys", () => {
      writeSessionTimestamps("user-1", "customer", 5_000);
      expect(localStorage.getItem("lxh:auth:user_id")).toBe("user-1");
      expect(localStorage.getItem("lxh:auth:session_start_ms")).toBe("5000");
      expect(localStorage.getItem("lxh:auth:last_activity_ms")).toBe("5000");
      expect(localStorage.getItem("lxh:auth:policy_id")).toBe("customer");
    });
  });
});

