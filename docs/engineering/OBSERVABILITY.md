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

Optional local log aggregation stack (all open source):

- Loki
- Promtail
- Grafana

Run with:

```bash
pnpm harness -- obs-up
pnpm harness -- obs-status
```

Access Grafana at `http://localhost:3001` (`admin` / `admin`).

Stop stack:

```bash
pnpm harness -- obs-down
```

Config files:

- `ops/observability/docker-compose.yml`
- `ops/observability/loki-config.yml`
- `ops/observability/promtail-config.yml`
- `ops/observability/grafana/provisioning/datasources/loki.yml`

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

## Production Reference Flow

1. Reproduce with request IDs and timestamp ranges.
2. Pull backend logs using `wrangler tail`.
3. Pull frontend logs from Vercel CLI for same time range.
4. Add exact log command and file/reference path in incident or PR notes.
