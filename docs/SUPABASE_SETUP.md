# Supabase Integration Guide – LoftyXphereHomes

This guide outlines where Supabase is used and how to set it up.

---

## Current Supabase Usage in the Codebase

| Location | Purpose |
|----------|---------|
| `app/supabase-client.js` | Creates the Supabase client from env vars |
| `components/BookingInquiryForm.tsx` | Inserts booking inquiries into a `guests` table |
| `lib/db.ts` + Prisma | Uses Supabase **PostgreSQL** (via `DATABASE_URL`) for bookings after Paystack payment |

So there are **two** Supabase integration paths:

1. **Supabase JS client** – BookingInquiryForm → `guests` table  
2. **Prisma + Supabase Postgres** – Paystack bookings → `Booking` model  

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Name the project (e.g. `loftyxpherehomes`).
4. Set a database password and region.
5. Wait for the project to be created.

---

## Step 2: Get Supabase Credentials

### For the Supabase JS client (BookingInquiryForm)

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
# Supabase (JS client – used by BookingInquiryForm)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase PostgreSQL (used by Prisma for Paystack bookings)
DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## Step 4: Create Tables in Supabase

### A) `guests` table (for BookingInquiryForm)

BookingInquiryForm inserts into a `guests` table with columns:  
`name`, `email`, `phone`, `check_in`, `check_out`.

**Using Supabase SQL Editor:**

1. In Supabase Dashboard: **SQL Editor** → **New query**.
2. Run:

```sql
create table if not exists public.guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  check_in date,
  check_out date,
  created_at timestamptz default now()
);

-- Optional: enable Row Level Security (RLS)
alter table public.guests enable row level security;

-- Allow inserts from the anon key (adjust policy as needed)
create policy "Allow insert from anon"
  on public.guests
  for insert
  to anon
  with check (true);
```

### B) `Booking` table (for Prisma / Paystack flow)

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

### BookingInquiryForm (guests table)

1. Open the site and go to an apartment detail page.
2. Use the **Booking Inquiry** form and submit.
3. In Supabase: **Table Editor** → `guests` – check for the new row.

### Paystack bookings (Booking table)

1. Complete a Paystack payment.
2. You should be redirected to `/booking/success`.
3. In Supabase: **Table Editor** → `Booking` – check for the new booking.

---

## Summary Checklist

- [ ] Create Supabase project
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env`
- [ ] Add `DATABASE_URL` (Supabase Postgres URI) to `.env`
- [ ] Create `guests` table (SQL above)
- [ ] Run `npx prisma generate` and `npx prisma db push` (or migrate)
- [ ] Restart dev server (`npm run dev`)

---

## Optional: Update `.env.example`

Add the Supabase client vars to `.env.example` so they are documented:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
