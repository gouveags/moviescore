# MovieScore

MovieScore is an open-source social platform where people can:

- Rate movies and TV series
- Share opinions with friends
- Discover personalized recommendations
- Build and showcase their watch history

## Repository Model

This project uses a monorepo approach.

- `apps/frontend` (Next.js SSR frontend)
- `apps/backend` (Hono API on Cloudflare Workers)
- `packages/shared` (shared contracts/types)
- `docs`

## Deployment Model

On every merge to `main`:

- Frontend deploy workflow: `.github/workflows/deploy-frontend.yml`
- Backend deploy workflow: `.github/workflows/deploy-backend.yml`

See `docs/engineering/DEPLOYMENT_SETUP.md` for required provider setup and secrets.

## Documentation

Start from:

- `AGENTS.md` (agent/project operating guide)
- `docs/product/PRODUCT_OVERVIEW.md`
- `docs/product/MVP_SCOPE.md`
- `docs/engineering/MONOREPO_ARCHITECTURE.md`
- `docs/engineering/ENGINEERING_STANDARDS.md`
- `docs/engineering/TESTING_STRATEGY.md`
- `docs/engineering/DOCUMENTATION_POLICY.md`
- `docs/engineering/DECISION_LOG.md`
- `docs/engineering/GIT_WORKFLOW.md`
- `docs/engineering/DEPLOYMENT_SETUP.md`
- `docs/frontend/FRONTEND_ARCHITECTURE.md`
- `docs/backend/BACKEND_ARCHITECTURE.md`

## Project Status

Bootstrap phase with deploy pipelines configured. Provider secrets and project linking are the remaining setup steps.

## Contributing

Contributions are welcome. For significant changes, open an issue first to align on product and architecture direction.

## License

MIT
