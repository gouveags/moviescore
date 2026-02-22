# AGENTS.md - Backend

This file extends root instructions for `apps/backend`.

## Backend Priorities

- Protect domain invariants in service/domain layer
- Keep framework code at the edges
- Validate all external inputs
- Avoid leaking persistence concerns into domain logic

## Testing

- Write backend tests before implementation (TDD)
- Prioritize unit tests for domain/application logic
- Add integration tests for persistence and API boundaries

## Documentation

- Every backend change must trigger documentation review/update.
- Record relevant decisions in `docs/engineering/DECISION_LOG.md`.
