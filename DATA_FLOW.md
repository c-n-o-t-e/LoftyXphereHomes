# LoftyXphereHomes – Supabase & Prisma Data Flow

## Yes: Supabase is the database

Supabase hosts a **PostgreSQL** database. Your app reaches it in two different ways:

| Path | Client | Table(s) | Used by |
|------|--------|----------|---------|
| **1** | Supabase JS client | `guests` | BookingInquiryForm |
| **2** | Prisma (connects to Supabase Postgres) | `Booking` | Paystack booking flow |

Both paths talk to the **same** Supabase PostgreSQL database. They use different clients but write to the same project.

---

## How Prisma and Supabase work together

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE PROJECT                                     │
│  (One PostgreSQL database: db.liksmvjgvphkfogweezi.supabase.co)              │
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   guests     │    │   Booking    │    │  (others)    │                   │
│  │   table      │    │   table      │    │              │                   │
│  └──────▲───────┘    └──────▲───────┘    └──────────────┘                   │
│         │                   │                                                │
└─────────┼───────────────────┼────────────────────────────────────────────────┘
          │                   │
          │                   │  DATABASE_URL
          │                   │  (PostgreSQL connection string)
          │                   │
          │                   ▼
          │            ┌──────────────┐
          │            │   PRISMA     │
          │            │   ORM        │
          │            │  (lib/db.ts) │
          │            └──────▲───────┘
          │                   │
          │  NEXT_PUBLIC_     │  prisma.booking.upsert()
          │  SUPABASE_*       │
          │                   │
          ▼                   │
   ┌──────────────┐           │
   │  Supabase    │           │
   │  JS Client   │           │
   │  (REST API)  │           │
   └──────▲───────┘           │
          │                   │
          │                   │
   supabase.from("guests")    lib/booking.ts
   .insert(...)                    │
          │                        │
          │                        │
   ┌──────┴───────────────────────┴──────┐
   │         YOUR NEXT.JS APP            │
   └─────────────────────────────────────┘
```

---

## Path 1: Supabase JS client → `guests` table

```
User fills Booking Inquiry form
         │
         ▼
┌─────────────────────┐
│ BookingInquiryForm  │
│ (apartment page)    │
└─────────┬───────────┘
          │
          │ supabase.from("guests").insert({ name, email, phone, ... })
          │
          ▼
┌─────────────────────┐      HTTP/REST       ┌─────────────────┐
│  supabase-client.js │ ──────────────────►  │  Supabase API   │
│  (NEXT_PUBLIC_*)    │                      │  → Postgres     │
└─────────────────────┘                      └────────┬────────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │ guests table  │
                                              └───────────────┘
```

---

## Path 2: Prisma → `Booking` table (Paystack flow)

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
| Booking inquiry form | Supabase `guests` table | Supabase JS client |
| Paystack booking (after payment) | Supabase `Booking` table | Prisma → Supabase Postgres |

Both end up in the same Supabase project’s database.
