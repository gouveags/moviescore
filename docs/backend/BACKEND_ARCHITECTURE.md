# Backend Architecture

## Scope

Defines high-level architecture for `apps/backend`.

## Responsibilities

- Auth and user management
- Ratings, reviews, social graph, recommendations
- API contracts and persistence

## Principles

- Domain-driven module boundaries
- Clear separation between domain, application, and infrastructure layers
- Input validation at API boundaries
- Shared contracts/types published via `packages/shared`

## Quality Gates

- Unit tests for services and domain rules
- Integration tests for database and external interfaces
- Contract tests to keep frontend/backend aligned
