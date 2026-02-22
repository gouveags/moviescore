# MovieScore

MovieScore is an open-source decision engine that helps people choose what to watch next.

Instead of only collecting post-watch ratings, MovieScore combines:

- Pre-watch expectation scores
- Post-watch satisfaction ratings
- Delta analysis between expectation and outcome

This creates a personalized taste model that improves recommendations over time.

## Repository Model

This project uses a monorepo approach.

- `apps/frontend` (Next.js frontend)
- `apps/backend` (Hono API on Cloudflare Workers)
- `packages/shared` (shared contracts/types)
- `docs`

## Running Locally

1. Install dependencies:

```bash
pnpm install
```

1. Run frontend (Next.js):

```bash
pnpm --filter @moviescore/frontend dev
```

1. Run backend (Cloudflare Worker API):

```bash
pnpm --filter @moviescore/backend dev
```

1. Optional: run both apps in parallel from repo root:

```bash
pnpm dev
```

## Deployment Model

On every published GitHub Release:

- Frontend deploy workflow: `.github/workflows/deploy-frontend.yml`
- Backend deploy workflow: `.github/workflows/deploy-backend.yml`

See `docs/engineering/DEPLOYMENT_SETUP.md` for required provider setup and secrets.

## Documentation

Start from:

- `AGENTS.md` (agent/project operating guide)
- `docs/product/PRODUCT_OVERVIEW.md`
- `docs/product/MVP_SCOPE.md`
- `docs/ROADMAP.md`
- `docs/engineering/MONOREPO_ARCHITECTURE.md`
- `docs/engineering/ENGINEERING_STANDARDS.md`
- `docs/engineering/TESTING_STRATEGY.md`
- `docs/engineering/DOCUMENTATION_POLICY.md`
- `docs/engineering/DECISION_LOG.md`
- `docs/engineering/GIT_WORKFLOW.md`
- `docs/engineering/DEPLOYMENT_SETUP.md`
- `docs/engineering/AI_HARNESS.md`
- `docs/engineering/OBSERVABILITY.md`
- `docs/frontend/FRONTEND_ARCHITECTURE.md`
- `docs/frontend/FRONTEND_DESIGN_GUIDELINES.md`
- `docs/backend/BACKEND_ARCHITECTURE.md`

## Project Status

Early foundation stage with release-triggered CI/deploy workflows in place.

## Contributing

Contributions are welcome. For significant changes, open an issue first to align on product and architecture direction.

## License

MIT
