# Backend App

Backend application for MovieScore.

## Database Setup

Local fast setup (SQLite):

1. Run `pnpm db:migrate`.
2. Run `pnpm db:check`.

Postgres mode (prod-like):

- Set `DB_CLIENT=postgres`
- Set `DATABASE_URL=postgres://...`
- Run `pnpm db:migrate`

See:

- `docs/backend/BACKEND_ARCHITECTURE.md`
- `apps/backend/AGENTS.md`
