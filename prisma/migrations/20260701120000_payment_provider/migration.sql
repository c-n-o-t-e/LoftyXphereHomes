-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'FLUTTERWAVE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'PAYSTACK';
ALTER TABLE "Booking" ADD COLUMN "providerTransactionId" TEXT;

-- Rename refund reference column to be provider-neutral
ALTER TABLE "Booking" RENAME COLUMN "paystackRefundReference" TO "providerRefundReference";
