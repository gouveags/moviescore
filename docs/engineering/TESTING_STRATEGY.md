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

## Anti-Patterns

- Writing tests only after code is finished
- Skipping tests for "small" changes
- Merging with failing tests
