-- Allow atomic job claims so concurrent workers do not double-process the same row.

ALTER TYPE "BookingJobStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
