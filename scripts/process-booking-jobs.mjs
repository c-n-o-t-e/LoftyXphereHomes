const baseUrl =
  process.env.BOOKING_JOBS_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";
const secret = process.env.BOOKING_JOBS_SECRET || process.env.CRON_SECRET;

if (!secret) {
  console.error("Missing BOOKING_JOBS_SECRET or CRON_SECRET.");
  process.exit(1);
}

const url = new URL("/api/internal/booking-jobs/process", baseUrl);

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

let body;
try {
  body = await res.json();
} catch {
  body = await res.text();
}

if (!res.ok) {
  console.error("Failed to process booking jobs:", body);
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));
