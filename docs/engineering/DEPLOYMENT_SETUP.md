# Deployment Setup

This repository runs CI and deploys both apps when a GitHub Release is published.

## Frontend (Vercel)

Workflow: `.github/workflows/deploy-frontend.yml`

Release deploy pipeline quality gates (run before deploy):

- `format:check`
- `lint`
- `test`
- `build`

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

Release deploy pipeline quality gates (run before deploy):

- `format:check`
- `lint`
- `test`
- `build`

Required GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DATABASE_URL`

CLI commands:

- `npm i -g wrangler`
- `wrangler login`
- `wrangler whoami`

## Database (Neon)

Recommended free setup:

1. Create Neon project and database.
2. Copy connection string.
3. Set it in backend runtime env (`DATABASE_URL`) and GitHub secrets as needed.

Backend database runtime selection:

- Local development: no env required, defaults to SQLite (`./.data/moviescore.db`)
- Production deploy pipeline: `DB_CLIENT=postgres` and `DATABASE_URL` from GitHub Actions secret
