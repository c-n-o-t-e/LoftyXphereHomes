import {
  availableApartmentsQuerySchema,
  bookingVerifyQuerySchema,
  paystackInitializeBodySchema,
  paystackWebhookPayloadSchema,
} from "@/lib/validation/schemas";

describe("validation schemas", () => {
  describe("paystackInitializeBodySchema", () => {
    it("accepts a valid payload", () => {
      const result = paystackInitializeBodySchema.safeParse({
        email: "Guest@Email.com ",
        name: "  John Doe ",
        phone: " 08031234567 ",
        amount: 25000,
        apartmentId: "apt_happy",
        checkIn: "2026-03-20",
        checkOut: "2026-03-24",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.email).toBe("guest@email.com");
      expect(result.data.name).toBe("John Doe");
      expect(result.data.phone).toBe("08031234567");
    });

    it("rejects missing name or phone", () => {
      expect(
        paystackInitializeBodySchema.safeParse({
          email: "guest@example.com",
          amount: 25000,
          apartmentId: "apt_happy",
          checkIn: "2026-03-20",
          checkOut: "2026-03-24",
        }).success
      ).toBe(false);
      expect(
        paystackInitializeBodySchema.safeParse({
          email: "guest@example.com",
          name: "Jane",
          amount: 25000,
          apartmentId: "apt_happy",
          checkIn: "2026-03-20",
          checkOut: "2026-03-24",
        }).success
      ).toBe(false);
    });

    it("rejects invalid date formats", () => {
      const result = paystackInitializeBodySchema.safeParse({
        email: "guest@example.com",
        name: "Jane",
        phone: "08012345678",
        amount: 25000,
        apartmentId: "apt_happy",
        checkIn: "03/20/2026",
        checkOut: "2026-03-24",
      });

      expect(result.success).toBe(false);
    });

    it("rejects checkOut on or before checkIn", () => {
      const result = paystackInitializeBodySchema.safeParse({
        email: "guest@example.com",
        name: "Jane",
        phone: "08012345678",
        amount: 25000,
        apartmentId: "apt_happy",
        checkIn: "2026-03-24",
        checkOut: "2026-03-24",
      });

      expect(result.success).toBe(false);
    });

    it("rejects malformed amount", () => {
      const result = paystackInitializeBodySchema.safeParse({
        email: "guest@example.com",
        name: "Jane",
        phone: "08012345678",
        amount: "25000",
        apartmentId: "apt_happy",
        checkIn: "2026-03-20",
        checkOut: "2026-03-24",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("paystackWebhookPayloadSchema", () => {
    it("allows non-charge.success events without reference", () => {
      const result = paystackWebhookPayloadSchema.safeParse({
        event: "charge.failed",
        data: {},
      });

      expect(result.success).toBe(true);
    });

    it("rejects charge.success without reference", () => {
      const result = paystackWebhookPayloadSchema.safeParse({
        event: "charge.success",
        data: {},
      });

      expect(result.success).toBe(false);
    });
  });

  describe("query schemas", () => {
    it("accepts valid available apartments query with all required fields", () => {
      const result = availableApartmentsQuerySchema.safeParse({
        checkIn: "2026-03-20",
        checkOut: "2026-03-24",
        guests: "2",
      });
      expect(result.success).toBe(true);
    });

    it("rejects available apartments query with missing or invalid fields", () => {
      expect(
        availableApartmentsQuerySchema.safeParse({ guests: "abc" }).success
      ).toBe(false);
      expect(
        availableApartmentsQuerySchema.safeParse({
          checkIn: "2026-03-20",
          checkOut: "2026-03-24",
        }).success
      ).toBe(false);
      expect(
        availableApartmentsQuerySchema.safeParse({
          checkIn: "2026-03-20",
          checkOut: "2026-03-24",
          guests: "0",
        }).success
      ).toBe(false);
    });

    it("accepts valid booking verify query", () => {
      const result = bookingVerifyQuerySchema.safeParse({ reference: "ref_123456" });
      expect(result.success).toBe(true);
    });
  });
});
