# Store guest/booking data in Supabase after Paystack payment

This guide walks you through setting up Supabase so that when a guest completes Paystack payment, their booking and guest data are saved to your Supabase database.

---

## Overview

After payment, the app:

1. Verifies the transaction with Paystack.
2. Reads booking data (apartment, dates, amount, customer email) from Paystack.
3. Writes one row into the **`Booking`** table in **Supabase PostgreSQL** via **Prisma**.

So you need: a Supabase project, a Postgres connection string, Prisma pointed at it, and the `Booking` table created there.

---

## Part 1: Supabase setup

### Step 1: Create a Supabase project (if you don’t have one)

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose **Organization** and **Project name** (e.g. `loftyxpherehomes`).
4. Set a strong **Database password** and save it (you’ll need it for `DATABASE_URL`).
5. Pick a **Region** (e.g. closest to your users).
6. Click **Create new project** and wait until the project is ready.

### Step 2: Get the database connection string

1. In the Supabase dashboard, open **Project Settings** (gear icon).
2. Go to **Database**.
3. Scroll to **Connection string**.
4. Select the **URI** tab.
5. Choose **Transaction** (recommended for Prisma; uses port **6543** and connection pooling).
6. Copy the URI. It will look like:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. Replace `[YOUR-PASSWORD]` with the database password you set in Step 1.

You will use this as `DATABASE_URL` in your app. Prisma uses it to connect to Supabase and to create/update the `Booking` table and rows.

### Step 3: (Optional) Restrict access with Row Level Security

By default Supabase allows access based on your connection string (service role / direct Postgres). If you later use Supabase’s API or Auth, you can add RLS so only allowed roles can read/write `Booking`. For “store after payment” you don’t have to do this now; your Next.js app uses Prisma with `DATABASE_URL` only.

---

## Part 2: Your project – files and configuration

### Files that matter for “after payment → store in Supabase”

| File | Role |
|------|------|
| **`.env`** | Holds `DATABASE_URL` (Supabase Postgres URI). Must be set so the app and Prisma can talk to Supabase. |
| **`prisma/schema.prisma`** | Defines the `Booking` model (guest/booking fields). Prisma creates/updates the table in Supabase from this. |
| **`prisma.config.ts`** | Tells Prisma CLI where the schema and `DATABASE_URL` are (for migrate/generate). |
| **`lib/db.ts`** | Exports a single `PrismaClient` instance that connects using `DATABASE_URL`. |
| **`lib/paystack.ts`** | `verifyTransaction(reference)` – calls Paystack API to get transaction (and customer) data. |
| **`lib/booking.ts`** | `upsertBookingFromPaystack(data)` – maps Paystack data to `Booking` and calls `prisma.booking.upsert()` so guest/booking data is stored in Supabase. |
| **`app/booking/success/page.tsx`** | After redirect from Paystack: verifies payment, then calls `upsertBookingFromPaystack()` so the booking is saved. |
| **`app/api/paystack/webhook/route.ts`** | Paystack webhook: on `charge.success`, verifies and calls `upsertBookingFromPaystack()` so booking is saved even if the user closes the browser. |

So: **Supabase** is used as the PostgreSQL database. **Prisma** is what actually writes the `Booking` row into Supabase. The “guest data” after payment is the row in the `Booking` table (booker email, name, phone, dates, amount, etc.).

---

## Part 3: Step-by-step in your repo

### 1. Set `DATABASE_URL` in `.env`

In the project root, create or edit `.env`:

```env
# Supabase PostgreSQL – required for saving bookings after Paystack payment
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

- Replace `[PROJECT-REF]`, `[YOUR-PASSWORD]`, and `[REGION]` with the values from the Supabase **Database → Connection string (URI)**.
- No quotes are required unless the password contains special characters; if it does, keep the value in double quotes.

### 2. Ensure `prisma.config.ts` loads env and passes the URL

Your `prisma.config.ts` should load `.env` and pass `DATABASE_URL` to the Prisma CLI, for example:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

This is used when you run `prisma migrate dev` or `prisma generate`. Your app at runtime reads `DATABASE_URL` from the environment (e.g. Next.js loads `.env` automatically).

### 3. Create/update the `Booking` table in Supabase (Prisma migrations)

From the project root:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

- **`prisma generate`** – generates the Prisma client (uses `prisma/schema.prisma`).
- **`prisma migrate dev`** – applies migrations to the database pointed at by `DATABASE_URL` (Supabase). This creates (or updates) the `Booking` table and `BookingStatus` enum in your Supabase public schema.

If you prefer to sync the schema without migration history (e.g. early prototyping):

```bash
npx prisma db push
```

After this, in Supabase **Table Editor** you should see the **`Booking`** table with columns matching your Prisma schema (e.g. `id`, `reference`, `apartmentId`, `checkIn`, `checkOut`, `nights`, `amountPaid`, `bookerEmail`, `bookerName`, `bookerPhone`, `status`, `createdAt`, `updatedAt`).

### 4. No code changes required in these files if already set up

- **`lib/db.ts`** – Should instantiate `PrismaClient` (and optionally pass `datasources.db.url` from `process.env.DATABASE_URL` if you’re not reading it from the schema). No Supabase-specific code here; Prisma uses `DATABASE_URL` to connect to Supabase Postgres.
- **`lib/booking.ts`** – Already uses `prisma.booking.upsert()` to write guest/booking data; that write goes to whatever DB `DATABASE_URL` points to (Supabase).
- **`app/booking/success/page.tsx`** – Already verifies Paystack and calls `upsertBookingFromPaystack()`.
- **`app/api/paystack/webhook/route.ts`** – Already handles `charge.success` and calls `upsertBookingFromPaystack()`.

So “properly set up Supabase” here means: **correct `DATABASE_URL`, Prisma client generated, and `Booking` table created in Supabase**. The code path “after payment → guest data stored” is already implemented.

### 5. (Recommended) Configure Paystack webhook

So bookings are stored even if the user never loads the success page:

1. In [Paystack Dashboard](https://dashboard.paystack.com) go to **Settings → Webhooks**.
2. Set **Webhook URL** to: `https://your-domain.com/api/paystack/webhook`.
3. Subscribe to **`charge.success`** (and any other events you need).
4. Save. Paystack will send a POST to that URL; your route verifies the event and calls `upsertBookingFromPaystack()`.

Use your real production URL; for local testing you’d need a tunnel (e.g. ngrok) and a test webhook URL.

---

## Part 4: Verify guest data is stored in Supabase

1. **Do a test payment** (Paystack test mode): complete a booking flow and pay; get redirected to `/booking/success?reference=...`.
2. In **Supabase Dashboard** open **Table Editor** and select the **`Booking`** table.
3. You should see a new row with:
   - `reference` (Paystack reference)
   - `apartmentId`, `checkIn`, `checkOut`, `nights`, `amountPaid`
   - `bookerEmail` (and optionally `bookerName`, `bookerPhone` if you pass them in metadata)
   - `status` (e.g. `PAID`)

If the row appears, guest/booking data is being stored in Supabase after payment.

---

## Checklist

- [ ] Supabase project created; database password saved.
- [ ] **Database → Connection string (URI)** copied; **Transaction** pooler (port 6543); password replaced.
- [ ] **`.env`** has `DATABASE_URL` set to that URI.
- [ ] **`prisma.config.ts`** loads `dotenv` and passes `env("DATABASE_URL")` to `defineConfig`.
- [ ] **`npx prisma generate`** and **`npx prisma migrate dev`** (or **`db push`**) run; **`Booking`** table exists in Supabase.
- [ ] Test payment completes and a row appears in **Supabase → Table Editor → Booking**.
- [ ] (Optional) Paystack webhook URL set; **`charge.success`** triggers the webhook and a booking is still created if the user doesn’t hit the success page.

---

## Summary

- **Supabase** = your PostgreSQL database (hosted by Supabase).
- **Prisma** = writes the **`Booking`** row (guest + booking data) to Supabase using **`DATABASE_URL`**.
- You **configure** Supabase by creating the project and putting the correct **`DATABASE_URL`** in **`.env`**.
- You **create the table** by running **Prisma migrations** (or **`db push`**) so the **`Booking`** model exists in Supabase.
- The **files you work on** are mainly **`.env`**, **`prisma.config.ts`**, and **`prisma/schema.prisma`**; the rest of the “after payment → store in DB” flow is already in **`lib/booking.ts`**, **`lib/db.ts`**, **`app/booking/success/page.tsx`**, and **`app/api/paystack/webhook/route.ts`**.
