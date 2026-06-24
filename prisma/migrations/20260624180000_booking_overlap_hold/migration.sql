-- Checkout hold expiry + exclusion constraint to prevent overlapping PAID/PENDING bookings.

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking" ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Booking_status_expiresAt_idx" ON "Booking"("status", "expiresAt");

ALTER TABLE "Booking" ADD CONSTRAINT booking_no_overlap
EXCLUDE USING gist (
  "apartmentId" WITH =,
  daterange("checkIn", "checkOut", '[)') WITH &&
) WHERE (status IN ('PAID', 'PENDING'));
