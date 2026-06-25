# CI/CD

## GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Pull requests and pushes to `main` | `lint:ci`, `test`, `build` |
| [`.github/workflows/migrate.yml`](../.github/workflows/migrate.yml) | Push to `main` only | `prisma migrate deploy` against production/staging DB |

## Required GitHub secret

Add **`DIRECT_URL`** as a **repository** secret (Settings → Secrets and variables → Actions → Repository secrets), or as an environment secret if the job declares `environment: <name>` (see [`.github/workflows/migrate.yml`](../.github/workflows/migrate.yml) — default `production`; rename to match yours).

Use the same Supabase session-pooler Postgres URL as local `.env` / [`.env.example`](../.env.example) — see [`prisma.config.ts`](../prisma.config.ts).

**Important:** `npm ci` runs `prisma generate` via `postinstall`, so `DIRECT_URL` must be available for the **entire** migrate job, not only the `migrate deploy` step.

If your password contains special characters (e.g. `$`), URL-encode them (`$` → `%24`).

## Branch protection (recommended)

On `main`, require the **CI / quality** check to pass before merge:

1. GitHub → Settings → Branches → Branch protection rules → `main`
2. Enable **Require status checks to pass**
3. Select the `quality` job from the CI workflow

## Vercel

Vercel auto-deploys on push to `main`. The migrate workflow runs in parallel; keep migrations backward-compatible so new code does not depend on schema changes until migrate completes.

Set **Node.js 20** in the Vercel project settings to match [`package.json`](../package.json) `engines`.

## Local parity

```bash
npm run lint:ci
npm test
npm run build
```
