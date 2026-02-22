# AGENTS.md

This file defines default instructions for coding agents working in `moviescore`.

## Project Context

MovieScore is an open-source decision engine for choosing what to watch next using expectation-vs-reality signals.

## Monorepo Layout

- `apps/frontend` - Web client application
- `apps/backend` - API and domain services
- `packages/shared` - Shared types, utilities, and contracts
- `docs` - Product and engineering documentation

## Documentation Index

Read this index before making changes. Keep docs in sync with code changes.

### Product & Vision

- `docs/product/PRODUCT_OVERVIEW.md`
- `docs/product/MVP_SCOPE.md`
- `docs/ROADMAP.md`

### Architecture

- `docs/engineering/MONOREPO_ARCHITECTURE.md`
- `docs/frontend/FRONTEND_ARCHITECTURE.md`
- `docs/frontend/FRONTEND_DESIGN_GUIDELINES.md`
- `docs/backend/BACKEND_ARCHITECTURE.md`

### Engineering Standards

- `docs/engineering/ENGINEERING_STANDARDS.md`
- `docs/engineering/TESTING_STRATEGY.md`
- `docs/engineering/DOCUMENTATION_POLICY.md`
- `docs/engineering/DECISION_LOG.md`
- `docs/engineering/GIT_WORKFLOW.md`
- `docs/engineering/DEPLOYMENT_SETUP.md`
- `docs/engineering/AI_HARNESS.md`
- `docs/engineering/OBSERVABILITY.md`
- `docs/engineering/HARNESS_AUTONOMY_RUNBOOK.md`
- `docs/engineering/HARNESS_SCORECARD.md`

## Core Engineering Rules

1. TDD is mandatory.
2. Tests must be written before production code.
3. Follow Red -> Green -> Refactor.
4. No feature is complete with failing tests.
5. Apply the Boy Scout Rule: always leave touched code cleaner.
6. Keep code DRY: remove duplication through clear abstractions.
7. Prefer clean architecture boundaries:
   - Domain logic must not depend on UI frameworks.
   - Infrastructure details should be replaceable.
8. Prefer small, focused modules and functions.
9. Use explicit naming and avoid hidden behavior.
10. Every code or product decision must be documented.
11. Every change must include corresponding documentation updates.
12. Keep docs updated when behavior or architecture changes.
13. Prefer feature branches and pull requests for all meaningful changes.

## Working Agreement for Agents

- Read relevant docs first, then implement.
- For monorepo work, prefer scoped changes to the impacted app/package.
- If behavior changes, update tests first, then code, then docs.
- For every decision made, add/update an entry in `docs/engineering/DECISION_LOG.md`.
- Do not finalize a change set until related docs are updated.
- If a command/test cannot run in current environment, document the gap clearly.
- Use `docs/engineering/AI_HARNESS.md` harness commands for non-trivial coding sessions.
- Ensure production-impacting backend changes include structured logging and observability doc updates.
- Run `pnpm policy:check` before opening PRs that touch harness, logging, hooks, or workflow policy.
- Produce `pnpm harness -- report <worktree-path>` output for long-running debugging sessions.

## AGENTS.md in Subprojects

Use nearest-file precedence:

- Root rules here apply by default.
- `apps/frontend/AGENTS.md` adds frontend-specific constraints.
- `apps/backend/AGENTS.md` adds backend-specific constraints.

When rules conflict, follow the nearest `AGENTS.md` to the file being edited.
