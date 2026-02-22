# Testing Strategy (TDD First)

## Mandatory Policy

TDD is required for this project.

No production code may be introduced without first writing a failing automated test that describes the intended behavior.

## Workflow

1. Red: write a failing test for the behavior.
2. Green: write the minimum code to pass the test.
3. Refactor: improve design while keeping tests green.

## Test Pyramid

- Unit tests for domain logic and utilities
- Integration tests for API, persistence, and service boundaries
- End-to-end tests for key user flows

## Definition of Done

- New behavior is covered by tests created before implementation.
- Full relevant test suite passes.
- No known regressions in affected areas.

## Maintenance Goal: Fast Test Feedback

- Keep tests as fast as possible to preserve frequent feedback loops.
- Prefer unit tests by default; only add integration/e2e coverage where it adds clear value.
- Avoid slow external dependencies in automated tests when fakes/mocks cover the same behavior.
- Continuously remove redundant or low-value slow tests.

## Anti-Patterns

- Writing tests only after code is finished
- Skipping tests for "small" changes
- Merging with failing tests
