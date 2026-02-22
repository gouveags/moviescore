# Backend Architecture

## Scope

Defines high-level architecture for `apps/backend`.

## Responsibilities

- Auth and user management
- Ratings, reviews, social graph, recommendations
- API contracts and persistence

## Database Strategy

- Local default: SQLite for fast development feedback and zero external dependency.
- Production target: Postgres using the same repository and migration flow.
- Driver selection is environment-driven:
  - `DB_CLIENT=sqlite` + `SQLITE_PATH=...`
  - `DB_CLIENT=postgres` + `DATABASE_URL=...`

### Canonical DB Paths

```text
apps/backend/src/db/
├── config.ts
├── client.ts
├── migrate.ts
├── rows.ts
├── repositories/
│   └── expectation-delta-repository.ts
└── scripts/
    ├── check.ts
    └── migrate.ts
```

## Principles

- Domain-driven module boundaries
- Clear separation between domain, application, and infrastructure layers
- Input validation at API boundaries
- Shared contracts/types published via `packages/shared`

## Quality Gates

- Unit tests for services and domain rules
- Integration tests for database and external interfaces
- Contract tests to keep frontend/backend aligned
