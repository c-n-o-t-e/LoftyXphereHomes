import { verifyWebhookHash } from "@/lib/flutterwave";

describe("flutterwave client", () => {
  const originalHash = process.env.FLUTTERWAVE_SECRET_HASH;

  afterEach(() => {
    process.env.FLUTTERWAVE_SECRET_HASH = originalHash;
  });

  it("verifyWebhookHash returns true for matching hash", () => {
    process.env.FLUTTERWAVE_SECRET_HASH = "test-secret-hash";
    expect(verifyWebhookHash("test-secret-hash")).toBe(true);
  });

  it("verifyWebhookHash returns false for mismatched hash", () => {
    process.env.FLUTTERWAVE_SECRET_HASH = "test-secret-hash";
    expect(verifyWebhookHash("wrong-hash")).toBe(false);
  });

  it("verifyWebhookHash returns false when secret is missing", () => {
    delete process.env.FLUTTERWAVE_SECRET_HASH;
    expect(verifyWebhookHash("anything")).toBe(false);
  });
});
