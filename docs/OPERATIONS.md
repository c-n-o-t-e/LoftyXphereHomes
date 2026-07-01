# Operations, backups, and disaster recovery

This document describes how LoftyXphereHomes is operated in production and what to do when things fail.

## Platform dependencies

| System | Responsibility |
|--------|----------------|
| **Vercel** | Next.js hosting, cron (`vercel.json`), env vars |
| **Supabase Postgres** | Bookings, jobs, admin users, images metadata, rate limits |
| **Supabase Auth** | Customer + staff login (magic links) |
| **Supabase Storage** | Apartment images, hero video, invoices |
| **Paystack** | Card payments + webhooks |
| **Flutterwave** | Card payments + webhooks (optional second provider) |
| **Resend** | Transactional email |
| **Google Sheets** | Ops ledger (secondary to Postgres) |

## Backups

### Database (Supabase)

- Enable **Point-in-Time Recovery (PITR)** on the Supabase project (Pro plan).
- Take periodic logical backups via `pg_dump` against the **session pooler** `DIRECT_URL` before major migrations.
- Store dumps off-platform (encrypted S3 / GCS), retention ≥ 30 days.

### Storage (Supabase)

- Buckets: apartment images, hero video, invoices — enable bucket versioning if available.
- Export critical invoice PDFs monthly to cold storage for finance compliance.

### Google Sheets

- Version history is enabled by default; export monthly CSV snapshots.

## Cron and background jobs

- **Booking jobs** (`/api/internal/booking-jobs/process`) run every **15 minutes** via Vercel Cron.
- Protect with `BOOKING_JOBS_SECRET` / `CRON_SECRET`.
- Manual re-drive: `npm run process-booking-jobs` or `?immediate=1` with auth header.

## Monitoring

- **Logs:** Vercel function logs + structured JSON from `lib/observability/logger.ts`.
- **Alerts:** Configure `RESEND_API_KEY` + `ADMIN_ALERT_EMAIL` for booking/job failures.
- **Recommended:** Add Sentry (or similar) and uptime checks on `/` and `/api/availability`.

## Disaster recovery runbook

### Paystack webhook missed

1. Guest lands on `/booking/success?reference=…` — backup path upserts booking and enqueues jobs.
2. If still missing, verify transaction in Paystack dashboard and re-post webhook or create manual booking in admin.

### Flutterwave webhook missed

1. Same success-page backup path applies (`/booking/success?reference=…`).
2. Verify in Flutterwave dashboard, then re-post `charge.completed` to `https://<site>/api/flutterwave/webhook`.
3. Webhook requests must include valid `verif-hash` header matching `FLUTTERWAVE_SECRET_HASH`.
4. Webhook handler **API-verifies** the transaction by `tx_ref` before confirming (same defense-in-depth as Paystack).

### Database unavailable

- Site shows 503 on booking/contact; do **not** take payments until DB is healthy.
- Restore from latest Supabase backup or PITR.

### Invoice job stuck

1. Check `BookingJob` rows in Supabase Table Editor.
2. Call `POST /api/internal/booking-jobs/process?immediate=1&bookingId=<id>` with secret header.

### Double-booking concern

- Checkout uses **PENDING holds** + advisory locks (`lib/booking/conflict.ts`).
- Webhook confirmation re-checks overlap and can refund on conflict (`lib/booking.ts`).

## Environment checklist (production)

See `.env.example`. Required for full operation:

- `DIRECT_URL`, Supabase keys, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`
- `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_SECRET_HASH` (if offering Flutterwave at checkout)
- `BOOKING_JOBS_SECRET` / `CRON_SECRET`
- `RESEND_API_KEY`, `ADMIN_ALERT_EMAIL`
- Google Sheets credentials (if ops sync enabled)

## Staff session policy

Staff idle/absolute timeouts are enforced **client-side** in `AuthProvider` when `/admin` is accessed. Supabase JWT expiry remains the server-side ceiling. For stricter staff policy, shorten Supabase session lifetime in the dashboard.
