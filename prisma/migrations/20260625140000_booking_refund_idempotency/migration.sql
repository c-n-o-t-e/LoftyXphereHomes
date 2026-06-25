-- Track Paystack refund state so webhook replays cannot double-refund on date conflicts.

CREATE TYPE "BookingRefundStatus" AS ENUM ('NONE', 'PENDING', 'REFUNDED', 'FAILED');

ALTER TABLE "Booking"
  ADD COLUMN "refundStatus" "BookingRefundStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "paystackRefundReference" TEXT,
  ADD COLUMN "refundedAt" TIMESTAMP(3);

CREATE INDEX "Booking_refundStatus_idx" ON "Booking"("refundStatus");
