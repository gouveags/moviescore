# Backend Architecture

## Scope

Defines high-level architecture for `apps/backend`.

## Responsibilities

- Authentication and user identity
- Title search/read aggregation via provider integrations
- Expectation and post-watch rating workflows
- Delta computation and recommendation ranking
- API contracts and persistence boundaries

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

- Domain-first module boundaries
- Clear separation between domain, application, and infrastructure layers
- Input validation at API boundaries
- Shared contracts/types published via `packages/shared`
- Deterministic ranking logic with explainable outputs

## Layered Structure

### 1. Delivery Layer (HTTP)

- Framework: Hono routes/adapters in `apps/backend/src`
- Responsibilities:
  - Request parsing and auth context
  - DTO validation and response shaping
  - Mapping domain/app errors to HTTP status codes
- Rule:
  - No business rules in route handlers

### 2. Application Layer (Use Cases)

- Orchestrates workflows:
  - `submitExpectation`
  - `markWatched`
  - `submitPostWatchRating`
  - `getRecommendations`
  - `getTitleAvailabilityByRegion`
- Handles transaction boundaries and idempotency expectations
- Depends only on domain contracts and repository interfaces

### 3. Domain Layer (Core Logic)

- Core entities/value objects:
  - `UserTasteProfile`
  - `Expectation`
  - `WatchEvent`
  - `Rating`
  - `ExpectationDelta`
  - `RecommendationCandidate`
- Domain services:
  - Delta classification (`exceeded`, `matched`, `disappointed`)
  - Time-decay weighting
  - Genre/director performance aggregation
  - Recommendation scoring and rationale generation

### 4. Infrastructure Layer

- Repository implementations (database adapters)
- External integrations:
  - title metadata provider
  - availability/provider-region source
- Auth provider adapters
- Caching and rate-limiting mechanisms

## Backend Paths (Canonical)

```text
apps/backend/src/
└── modules/
    └── <module-name>/
        ├── domain/          # Entities, value objects, domain services
        ├── application/     # Use cases / orchestration
        ├── infrastructure/  # DB, external API, adapters
        └── delivery/        # HTTP handlers, DTO mapping
```

## Dependency Injection Direction

Allowed dependency direction:

```text
delivery  --->  application  --->  domain
infrastructure ---> application ---> domain
```

Disallowed dependency direction:

```text
domain -X-> application|infrastructure|delivery
application -X-> delivery|infrastructure
delivery -X-> infrastructure
infrastructure -X-> delivery
```

## Lint-Enforced Boundary Rules

The architecture direction above is enforced by ESLint rules in `.eslintrc.cjs`:

- Files in `apps/backend/src/modules/**/domain/**` cannot import `application`, `infrastructure`, or `delivery`.
- Files in `apps/backend/src/modules/**/application/**` cannot import `infrastructure` or `delivery`.
- Files in `apps/backend/src/modules/**/delivery/**` cannot import `infrastructure`.
- Files in `apps/backend/src/modules/**/infrastructure/**` cannot import `delivery`.

Execution points:

- Manual: `pnpm lint:architecture`
- Pre-commit hook: `.husky/pre-commit`

## Suggested Module Topology

- `src/modules/auth`
- `src/modules/titles`
- `src/modules/expectations`
- `src/modules/watch-history`
- `src/modules/ratings`
- `src/modules/recommendations`
- `src/modules/availability`

Each module should follow:

- `domain/`
- `application/`
- `infrastructure/`
- `delivery/`

## Core Domain Rules

1. Post-watch rating is only accepted after watched state is recorded.
2. Expectation is only valid for unwatched titles.
3. A title's delta is computed from latest valid expectation and corresponding post-watch rating.
4. Recommendation score must include:
   - historical satisfaction signal
   - expectation-delta adjustments
   - recency weighting
   - content affinity factors (genre/director/actor when available)
5. Availability responses must include data-freshness metadata.

## API Contract Direction

- Contracts live in `packages/shared` and are consumed by both apps.
- API should expose explainable recommendation outputs:
  - score
  - confidence
  - reason labels (for UI explanations)
- Keep backward-compatible evolution for contract changes.

## Data and Persistence Notes

- Persist expectation and rating events separately (event-like history), not only flattened current state.
- Store derived aggregates (e.g., rolling genre delta stats) when it reduces hot-path compute cost.
- Keep raw events as source of truth to allow re-ranking experiments.

## Performance and Reliability

- Prioritize low-latency recommendation reads via:
  - cached candidate pools
  - precomputed aggregates
  - bounded ranking windows
- Use timeouts and fallback behavior for external provider calls.
- Add structured logging for recommendation decisions and failure paths.

## Observability Baseline

- Request-level structured logs are emitted by middleware in `apps/backend/src/platform/observability/request-logger.ts`.
- Log retrieval and credential setup are documented in `docs/engineering/OBSERVABILITY.md`.

## Quality Gates

- Unit tests for services and domain rules
- Integration tests for database and external interfaces
- Contract tests to keep frontend/backend aligned
- Deterministic tests for ranking and delta classification behavior
