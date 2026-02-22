# Engineering Standards

## Code Quality

- Prefer clear, intention-revealing names.
- Keep functions and modules small and cohesive.
- Eliminate duplication (DRY) instead of copy/paste growth.
- Avoid premature optimization; measure first.
- Refactor continuously as part of delivery.

## Clean Code / Clean Architecture

- Separate domain logic from delivery/infrastructure concerns.
- Keep side effects at boundaries.
- Depend on abstractions where practical.
- Apply SOLID principles where they improve maintainability.
- Enforce single responsibility for modules and services.

## Boy Scout Rule

- Every change should leave related code cleaner than before.
- If you touch messy code, improve readability/testability in the same PR when safe.

## Documentation Discipline

- Any architecture or behavior change must update relevant docs.
- Avoid stale docs by updating them in the same change set.
- Every implementation decision must be documented.
- Update `docs/engineering/DECISION_LOG.md` for meaningful technical/product decisions.
- A change is not complete until docs are updated.

## Review Expectations

- Pull requests should include tests and doc updates when applicable.
- Favor small, reviewable PRs over large multi-purpose changes.
- `main` is protected: use branches + pull requests only (no direct commits).

## Maintenance Goals

- Keep automated tests fast to preserve tight feedback loops for developers.

## Agent Execution Harness

- Use isolated harness worktrees for non-trivial coding sessions.
- Use `scripts/harness/agent-harness.sh` to start/stop services and persist logs.
- Avoid ad-hoc long-running processes in the primary checkout.
- Prefer `pnpm harness -- bootstrap <name>` for new agent tasks.

## Observability

- Backend HTTP endpoints must produce structured logs.
- Production-impacting behavior must include a documented way to retrieve logs.
- Keep `docs/engineering/OBSERVABILITY.md` aligned with code behavior.

## Policy Automation

- `pnpm policy:check` must pass locally and in CI.
- Do not bypass policy checks in git hooks or workflow config.
