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
    apartmentId: apartmentIdSchema,
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    amount: z.number().finite().min(100, { message: "amount must be at least 100" }).optional(),
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
    email: data.email,
    name: data.name.trim(),
    phone: data.phone.trim(),
    apartmentId: data.apartmentId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  }));

/** Shared body for Paystack and Flutterwave initialize routes. */
export const paymentInitializeBodySchema = paystackInitializeBodySchema;

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

export const flutterwaveWebhookPayloadSchema = z
  .object({
    event: nonEmptyTrimmedString,
    data: z
      .object({
        tx_ref: z.string().trim().optional(),
        status: z.string().trim().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .superRefine((payload, ctx) => {
    if (
      payload.event === "charge.completed" &&
      !payload.data?.tx_ref?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "tx_ref is required for charge.completed events",
        path: ["data", "tx_ref"],
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

export const contactMessageBodySchema = z
  .object({
    name: nonEmptyTrimmedString.min(2, { message: "Name must be at least 2 characters" }),
    email: emailSchema,
    phone: nonEmptyTrimmedString.min(10, { message: "Please enter a valid phone number" }),
    category: z.enum(["booking", "partnership", "long-stay", "complaints"]),
    message: nonEmptyTrimmedString.min(10, { message: "Message must be at least 10 characters" }),
    // Honeypot: bots often fill hidden fields. Humans should leave empty.
    website: z.string().trim().optional(),
  })
  .strict()
  .transform((data) => ({
    name: data.name.trim(),
    email: data.email,
    phone: data.phone.trim(),
    category: data.category,
    message: data.message.trim(),
    website: data.website?.trim() || "",
  }));

export const adminCreateManualBookingBodySchema = z
  .object({
    name: nonEmptyTrimmedString.min(2),
    email: emailSchema,
    phone: nonEmptyTrimmedString.min(5),
    apartmentId: apartmentIdSchema,
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    amountNgn: z.number().finite().int().min(1),
    paymentMethod: z.string().trim().min(1).max(80).optional(),
    paymentReference: z.string().trim().min(1).max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
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
    paymentMethod: data.paymentMethod?.trim() || undefined,
    paymentReference: data.paymentReference?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
  }));

/** Invoice id or free text containing `LXH-…` (resolved server-side). */
export const adminCancelBookingBodySchema = z
  .object({
    invoiceId: nonEmptyTrimmedString.max(2000),
  })
  .strict()
  .transform((data) => ({
    invoiceInput: data.invoiceId.trim(),
  }));

export const adminStaffRoleSchema = z.enum(["admin", "receptionist"]);

export const adminUpsertStaffUserBodySchema = z
  .object({
    email: emailSchema,
    role: adminStaffRoleSchema,
  })
  .strict();

export const adminUpdateStaffRoleBodySchema = z
  .object({
    role: adminStaffRoleSchema,
  })
  .strict();

export const adminBookingsViewSchema = z.enum([
  "current",
  "upcoming",
  "past",
  "cancelled",
  "all",
]);

/** GET /api/admin/bookings — staff list/search with pagination */
export const adminBookingsQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    view: adminBookingsViewSchema.optional(),
    status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
    apartmentId: apartmentIdSchema.optional(),
    limit: z.string().trim().optional(),
    cursor: z.string().trim().min(1).optional(),
  })
  .strict()
  .transform((q) => {
    const parsed = q.limit ? Number.parseInt(q.limit, 10) : 50;
    const limit = Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 50;
    return {
      q: q.q?.trim() || undefined,
      view: q.view ?? "current",
      status: q.status,
      apartmentId: q.apartmentId,
      limit,
      cursor: q.cursor,
    };
  });

export const adminApartmentImagePatchBodySchema = z
  .object({
    altText: z.string().trim().max(200).nullable().optional(),
  })
  .strict();

export const adminApartmentImagesReorderBodySchema = z
  .object({
    imageIds: z.array(nonEmptyTrimmedString).min(1),
  })
  .strict();
