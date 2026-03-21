# LoftyXphereHomes – Supabase & Prisma Data Flow

## Yes: Supabase is the database

Supabase hosts a **PostgreSQL** database. Your app reaches it in two different ways:

| Path | Client | Table(s) | Used by |
|------|--------|----------|---------|
| **1** | Prisma (connects to Supabase Postgres) | `Booking` | Paystack booking flow |

Supabase Auth (JS client) is also used for **login/session**; booking records are persisted via Prisma to the same Supabase PostgreSQL database.

---

## How Prisma and Supabase work together

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE PROJECT                                     │
│  (One PostgreSQL database: db.liksmvjgvphkfogweezi.supabase.co)              │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐                                        │
│  │   Booking    │    │  (others)    │                                        │
│  │   table      │    │              │                                        │
│  └──────▲───────┘    └──────────────┘                                        │
│         │                                                                     │
└─────────┼─────────────────────────────────────────────────────────────────────┘
          │
          │  DATABASE_URL (PostgreSQL connection string)
          │
          ▼
   ┌──────────────┐
   │   PRISMA     │
   │   ORM        │
   │  (lib/db.ts) │
   └──────▲───────┘
          │
          │  prisma.booking.*  +  lib/booking.ts
          │
   ┌──────┴──────────────────────────────────┐
   │         YOUR NEXT.JS APP                 │
   │  (+ Supabase JS client for Auth/session) │
   └──────────────────────────────────────────┘
```

---

## Prisma → `Booking` table (Paystack flow)

```
User pays via Paystack
         │
         ▼
Paystack redirects to /booking/success?reference=xxx
         │
         ▼
┌─────────────────────────┐
│ booking/success/page    │
│ (or Paystack webhook)   │
└───────────┬─────────────┘
            │
            │ 1. verifyTransaction(reference)  →  Paystack API
            │ 2. upsertBookingFromPaystack(data)
            │
            ▼
┌─────────────────────────┐
│ lib/booking.ts          │
│ upsertBookingFromPaystack()
└───────────┬─────────────┘
            │
            │ prisma.booking.upsert({ ... })
            │
            ▼
┌─────────────────────────┐     DATABASE_URL      ┌─────────────────┐
│ lib/db.ts               │ ──────────────────►   │  Supabase       │
│ PrismaClient            │   (Postgres conn)     │  PostgreSQL     │
└─────────────────────────┘                       └────────┬────────┘
                                                           │
                                                           ▼
                                                   ┌───────────────┐
                                                   │ Booking table │
                                                   └───────────────┘
```

---

## Is `lib/booking.ts` saved to Supabase?

Yes. The `prisma.booking.upsert()` call in `lib/booking.ts` writes to the Supabase PostgreSQL database.

Prisma uses `DATABASE_URL`, which points at Supabase:

```
DATABASE_URL → Supabase Postgres (db.liksmvjgvphkfogweezi.supabase.co)
```

So:

- `prisma.booking.upsert()` → Supabase PostgreSQL → `Booking` table

You can confirm in Supabase Dashboard → Table Editor → `Booking`.

---

## Summary table

| What | Where it goes | How |
|------|----------------|-----|
| Paystack booking (after payment) | Supabase `Booking` table | Prisma → Supabase Postgres |
| User login / session | Supabase Auth | Supabase JS client (`NEXT_PUBLIC_*`) |
