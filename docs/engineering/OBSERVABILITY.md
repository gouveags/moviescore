# Observability and Logs

## Logging Standard

Backend HTTP requests must emit structured JSON logs to stdout with at least:

- `event`
- `method`
- `path`
- `status`
- `durationMs`
- `timestamp`

Current implementation:

- `apps/backend/src/platform/observability/request-logger.ts`

## Local Development Logs

Use the harness to keep logs persisted by worktree:

- backend: `<worktree>/.harness/logs/backend.log`
- frontend: `<worktree>/.harness/logs/frontend.log`

Optional free/open-source log viewer:

- `lnav` (local terminal log exploration)

## Production Logs

### Backend (Cloudflare Workers)

Use Wrangler tail to stream worker logs:

```bash
pnpm --filter @moviescore/backend exec wrangler tail --format json
```

Required credentials:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Frontend (Vercel)

Use Vercel CLI logs:

```bash
vercel logs <deployment-url-or-name> --token "$VERCEL_TOKEN"
```

Required credentials:

- `VERCEL_TOKEN`

## Credential Setup

- Local shell: export credentials as environment variables before running log commands.
- CI/CD: store credentials in GitHub Actions repository secrets.
- Use least-privilege tokens and rotate periodically.
