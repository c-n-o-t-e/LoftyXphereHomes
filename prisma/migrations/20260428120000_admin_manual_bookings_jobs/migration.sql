-- Add enums
CREATE TYPE "BookingSource" AS ENUM ('WEBSITE', 'MANUAL');
CREATE TYPE "BookingJobType" AS ENUM ('INVOICE_PDF', 'GOOGLE_SHEETS');
CREATE TYPE "BookingJobStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "AdminRole" AS ENUM ('admin', 'receptionist');

-- Alter Booking
ALTER TABLE "Booking"
  ADD COLUMN "source" "BookingSource" NOT NULL DEFAULT 'WEBSITE',
  ADD COLUMN "manualPaymentMethod" TEXT,
  ADD COLUMN "manualPaymentReference" TEXT,
  ADD COLUMN "invoiceId" TEXT,
  ADD COLUMN "invoicePdfPath" TEXT;

ALTER TABLE "Booking"
  ALTER COLUMN "bookerEmail" DROP NOT NULL;

-- Create BookingJob
CREATE TABLE "BookingJob" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "type" "BookingJobType" NOT NULL,
  "status" "BookingJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "nextRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookingJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BookingJob_bookingId_type_key" ON "BookingJob"("bookingId", "type");
CREATE INDEX "BookingJob_status_nextRunAt_idx" ON "BookingJob"("status", "nextRunAt");
CREATE INDEX "BookingJob_bookingId_idx" ON "BookingJob"("bookingId");

ALTER TABLE "BookingJob"
  ADD CONSTRAINT "BookingJob_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Create AdminUser
CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "supabaseUserId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_supabaseUserId_key" ON "AdminUser"("supabaseUserId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_role_idx" ON "AdminUser"("role");

