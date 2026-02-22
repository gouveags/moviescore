# Decision Log

Track meaningful product and engineering decisions here.

## 2026-02-22 - Adopt monorepo architecture

### Context

Project bootstrap for MovieScore with combined frontend/backend development.

### Decision

Use a monorepo structure with `apps/frontend`, `apps/backend`, and `packages/shared`.

### Consequences

- Shared contracts can be maintained centrally.
- Cross-layer changes can be delivered atomically.
- Tooling can be standardized across apps.

### Follow-up

- Select workspace tooling (pnpm + task runner)
- Define initial frontend/backend scaffold

## 2026-02-22 - Enforce TDD-first and docs-always-updated policy

### Context

Need consistent quality guardrails for all future work.

### Decision

Require tests before implementation and require docs updates for every meaningful change.

### Consequences

- Better reliability and reduced regression risk.
- Slower short-term throughput but better long-term maintainability.

### Follow-up

- Add CI checks for tests and documentation verification policy
