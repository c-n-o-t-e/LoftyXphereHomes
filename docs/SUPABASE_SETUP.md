# Supabase Integration Guide – LoftyXphereHomes

This guide outlines where Supabase is used and how to set it up.

---

## Current Supabase Usage in the Codebase

| Location | Purpose |
|----------|---------|
| `lib/supabase/client.ts` (and related) | **Auth** – login, session, `getSession` for API calls |
| `lib/db.ts` + Prisma | **Bookings** – Supabase **PostgreSQL** via `DATABASE_URL` after Paystack payment |

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Name the project (e.g. `loftyxpherehomes`).
4. Set a database password and region.
5. Wait for the project to be created.

---

## Step 2: Get Supabase Credentials

### For the Supabase JS client (Auth)

1. In Supabase Dashboard: **Project Settings** → **API**.
2. Note:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (safe for client-side use)

### For Prisma / PostgreSQL (Paystack bookings)

1. In Supabase Dashboard: **Project Settings** → **Database**.
2. Under **Connection string**, choose **URI**.
3. Choose **Transaction** pooler (port 6543) for Prisma.
4. Copy the URI and replace `[YOUR-PASSWORD]` with your database password.

---

## Step 3: Add Environment Variables

Add to `.env` (or `.env.local`):

```env
# Supabase (JS client – Auth / session)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase PostgreSQL (used by Prisma for Paystack bookings)
DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

If you use **server-side** user management (e.g. invites), you may also set a **service role** key where documented in code—never expose it to the client.

---

## Step 4: Create the `Booking` Table (Prisma)

Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Or push the schema without migrations:

```bash
npx prisma db push
```

This creates the `Booking` table (and `BookingStatus` enum) from `prisma/schema.prisma`.

---

## Step 5: Verify Integration

### Paystack bookings (`Booking` table)

1. Complete a Paystack payment.
2. You should be redirected to `/booking/success`.
3. In Supabase: **Table Editor** → `Booking` – check for the new booking.

### Auth

1. Sign up / log in via your login page.
2. Confirm session works (e.g. **My Bookings** with a logged-in user).

---

## Summary Checklist

- [ ] Create Supabase project
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`
- [ ] Add `DATABASE_URL` (Supabase Postgres URI) to `.env`
- [ ] Run `npx prisma generate` and `npx prisma db push` (or migrate)
- [ ] Restart dev server (`npm run dev`)

---

## Optional: Update `.env.example`

Add the Supabase client vars to `.env.example` so they are documented:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
