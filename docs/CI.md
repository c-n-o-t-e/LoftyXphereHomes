# CI/CD

## GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | Pull requests and pushes to `main` | `lint:ci`, `test`, `build` |
| [`.github/workflows/migrate.yml`](../.github/workflows/migrate.yml) | Push to `main` only | `prisma migrate deploy` against production/staging DB |

## Required GitHub secret

Add **`DIRECT_URL`** in the repository settings (Settings → Secrets and variables → Actions).

Use the same Supabase session-pooler Postgres URL as local `.env` / [`.env.example`](../.env.example) — see [`prisma.config.ts`](../prisma.config.ts).

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
