# Monorepo Architecture

## Repository Strategy

Single monorepo containing frontend, backend, and shared packages.

## Planned Structure

- `apps/frontend`
- `apps/backend`
- `packages/shared`
- `docs`

## Why Monorepo

- Shared types/contracts without duplication
- Atomic changes across frontend/backend/shared code
- Unified tooling for lint, test, and CI
- Easier architectural consistency

## Dependency Direction

- `apps/frontend` can depend on `packages/shared`
- `apps/backend` can depend on `packages/shared`
- `packages/shared` must not depend on app code

## Future Tooling

- Workspace package manager (pnpm)
- Task runner for selective builds/tests
- CI with changed-package targeting
