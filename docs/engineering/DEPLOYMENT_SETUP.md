# Deployment Setup

This repository uses split automation:

- CI checks (`typecheck`, `format:check`, `lint`, `test`, `build`) run on pull requests to `main` and pushes to `main` via `.github/workflows/ci.yml`.
- Deployment workflows run only when a GitHub Release is published.

## Frontend (Vercel)

Workflow: `.github/workflows/deploy-frontend.yml`

Required GitHub secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

CLI commands to obtain values:

- `npm i -g vercel`
- `vercel login`
- `cd apps/frontend && vercel link`
- Read `.vercel/project.json` for project/org IDs.

## Backend (Cloudflare Workers)

Workflow: `.github/workflows/deploy-backend.yml`

Required GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DATABASE_URL`

CLI commands:

- `npm i -g wrangler`
- `wrangler login`
- `wrangler whoami`

## Production Log Access

Frontend logs:

- `vercel logs <deployment-url-or-name> --token "$VERCEL_TOKEN"`

Backend logs:

- `pnpm --filter @moviescore/backend exec wrangler tail --format json`

Required log-access credentials:

- `VERCEL_TOKEN`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

See `docs/engineering/OBSERVABILITY.md` for log format and operations guidance.
For local open-source aggregation, use the harness observability stack (`pnpm harness -- obs-up`).

## Database (Neon)

Recommended free setup:

1. Create Neon project and database.
2. Copy connection string.
3. Set it in backend runtime env (`DATABASE_URL`) and GitHub secrets as needed.

Backend database runtime selection:

- Local development: no env required, defaults to SQLite (`./.data/moviescore.db`)
- Production deploy pipeline: `DB_CLIENT=postgres` and `DATABASE_URL` from GitHub Actions secret
