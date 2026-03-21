import { z } from "zod";

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnlyString = (value: string): boolean => {
  if (!DATE_ONLY_REGEX.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === value;
};

export const nonEmptyTrimmedString = z.string().trim().min(1);

export const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

export const dateStringSchema = nonEmptyTrimmedString.refine(isValidDateOnlyString, {
  message: "Invalid date format. Use YYYY-MM-DD.",
});

export const referenceSchema = nonEmptyTrimmedString.min(6).max(200);

export const apartmentIdSchema = nonEmptyTrimmedString.min(1).max(120);

export const positiveIntStringToNumberSchema = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value), {
    message: "Must be a whole number.",
  })
  .transform((value) => Number.parseInt(value, 10))
  .refine((value) => Number.isInteger(value) && value > 0, {
    message: "Must be greater than 0.",
  });

export const paystackInitializeBodySchema = z
  .object({
    email: emailSchema,
    name: nonEmptyTrimmedString,
    phone: nonEmptyTrimmedString,
    amount: z.number().finite().min(100, { message: "amount must be at least 100" }),
    apartmentId: apartmentIdSchema,
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
  })
  .strict()
  .refine(
    (data) =>
      new Date(`${data.checkOut}T00:00:00.000Z`) >
      new Date(`${data.checkIn}T00:00:00.000Z`),
    {
      message: "checkOut must be after checkIn",
      path: ["checkOut"],
    }
  )
  .transform((data) => ({
    ...data,
    name: data.name.trim(),
    phone: data.phone.trim(),
  }));

export const paystackWebhookPayloadSchema = z
  .object({
    event: nonEmptyTrimmedString,
    data: z
      .object({
        reference: z.string().trim().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .superRefine((payload, ctx) => {
    if (
      payload.event === "charge.success" &&
      !payload.data?.reference?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reference is required for charge.success events",
        path: ["data", "reference"],
      });
    }
  });

export const availableApartmentsQuerySchema = z
  .object({
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    guests: positiveIntStringToNumberSchema,
  })
  .strict()
  .superRefine((query, ctx) => {
    const checkInDate = new Date(`${query.checkIn}T00:00:00.000Z`);
    const checkOutDate = new Date(`${query.checkOut}T00:00:00.000Z`);
    if (checkOutDate <= checkInDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "checkOut must be after checkIn",
        path: ["checkOut"],
      });
    }
  });

export const availabilityQuerySchema = z
  .object({
    apartmentId: apartmentIdSchema,
  })
  .strict();

export const bookingVerifyQuerySchema = z
  .object({
    reference: referenceSchema,
  })
  .strict();

export const bearerAuthHeaderSchema = z.object({
  authorization: z
    .string()
    .trim()
    .regex(/^Bearer\s+.+$/i, {
      message: "Authorization header must be a Bearer token",
    }),
});

/** GET /api/my-bookings — optional pagination (cursor = last booking id from previous page) */
export const myBookingsQuerySchema = z
  .object({
    limit: z.string().trim().optional(),
    cursor: z.string().trim().min(1).optional(),
  })
  .strict()
  .transform((q) => {
    const parsed = q.limit ? Number.parseInt(q.limit, 10) : 50;
    const limit = Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 50;
    return { limit, cursor: q.cursor };
  });
