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

## 2026-02-22 - Protect main branch and require PR workflow

### Context

Need to prevent direct commits to `main` and enforce code review discipline.

### Decision

Enable GitHub branch protection for `main` with required pull requests and at least one approval. Enforce for admins.

### Consequences

- All changes must be merged through pull requests.
- Better review quality and lower risk of unreviewed regressions.

### Follow-up

- Add CI checks as required status checks once pipelines are in place.

## 2026-02-22 - Adopt deploy-first stack for free-tier SSR + API

### Context

Need easy/free deployment before user growth, with automatic deploys on merge and SSR support for search indexing.

### Decision

Use this stack:

- Frontend: Next.js in `apps/frontend`, deployed on Vercel
- Backend: Hono in `apps/backend`, deployed on Cloudflare Workers
- Shared contracts: `packages/shared`
- Database: Neon Postgres (connection string to be configured)
- Monorepo tooling: pnpm workspaces + Turborepo

### Consequences

- Fast deployments and low operational overhead on free tiers.
- Strong SSR support for SEO.
- Requires provider secrets in GitHub Actions.

### Follow-up

- Configure Vercel and Cloudflare tokens/account IDs in GitHub secrets.
- Configure Neon `DATABASE_URL` for backend runtime.

## 2026-02-22 - Add deploy-on-main GitHub Actions for frontend and backend

### Context

Need automatic deployment for both apps whenever code is merged into `main`.

### Decision

Add:

- `.github/workflows/deploy-frontend.yml` (Vercel deploy)
- `.github/workflows/deploy-backend.yml` (Cloudflare Workers deploy)

### Consequences

- Deployments become consistent and automated on mainline changes.
- Secret management becomes required before first successful production deploy.

### Follow-up

- Add repository secrets and perform first deploy verification.

## 2026-02-22 - Trigger CI and deployments only on release publication

### Context

Need workflow executions only when a new release version is created.

### Decision

Change `.github/workflows/ci.yml`, `.github/workflows/deploy-frontend.yml`, and `.github/workflows/deploy-backend.yml` to trigger only on `release` with `types: [published]`.

### Consequences

- No CI/deploy runs on regular pushes or pull requests.
- Workflows run only when a release is published.

### Follow-up

- Use GitHub Releases to control deployment cadence.

## 2026-02-22 - Reposition MovieScore as expectation-vs-reality decision engine

### Context

Existing product docs were centered on a social rating platform. Product direction now focuses on reducing decision fatigue through pre-watch expectation capture, post-watch satisfaction capture, and delta-based recommendation learning.

### Decision

- Update product docs to define MovieScore as a decision engine for what to watch next.
- Make expectation scoring and expectation-vs-reality delta first-class product capabilities.
- Prioritize recommendation quality and decision speed over feed-style social engagement in MVP scope.
- Define frontend design direction with mobile-first UX and intentionally different mobile/desktop compositions.

### Consequences

- Product, roadmap, and MVP documentation now align with a clear differentiation strategy.
- Frontend implementation should optimize for fast, confidence-backed watch decisions.
- Social/community features remain possible but are not the main product driver in early phases.

### Follow-up

- Translate this product direction into backend domain models and API contracts.
- Add concrete UX/UI specs and acceptance criteria per core component.

## 2026-02-22 - Enforce backend clean architecture dependency direction with lint + pre-commit

### Context

Need automated guardrails to keep backend module dependencies aligned with clean architecture direction as implementation grows.

### Decision

- Define canonical backend module structure with `domain`, `application`, `infrastructure`, and `delivery` folders.
- Add ESLint import-boundary restrictions to enforce allowed dependency direction across these layers.
- Add a dedicated custom linter command: `pnpm lint:architecture`.
- Run this custom linter on every commit through a pre-commit hook.
- Document dependency direction and canonical paths with ASCII diagrams in backend architecture docs.

### Consequences

- Architectural violations are caught before commit.
- Dependency direction remains explicit and enforceable, not only guideline text.
- Developers must place backend logic in layer-specific paths for rules to apply correctly.

### Follow-up

- Expand rules for cross-module import boundaries once module count grows.
- Add CI branch-protection checks to require `lint:architecture` status.

## 2026-02-22 - Add fast local pre-commit and pre-push quality gates

### Context

Need a tighter local feedback loop so quality regressions are caught before remote CI while keeping checks fast enough for everyday use.

### Decision

- Configure Husky `pre-commit` to run `pnpm check:commit`.
- Use `lint-staged` so format/lint checks run only on staged files.
- Keep clean architecture boundary checks mandatory at commit time via `pnpm lint:architecture`.
- Configure Husky `pre-push` to run `pnpm check:push` (`lint`, `typecheck`, `test`, `build` via Turborepo).

### Consequences

- Most style/lint/architecture violations fail before commit.
- Pushes are blocked on integration-level quality checks.
- Local feedback remains fast due to staged-file checks and Turborepo caching.

### Follow-up

- Monitor hook runtime and optimize any slow commands that regress developer feedback speed.

## 2026-02-22 - Standardize ESLint/Prettier and enforce quality gates in CI/CD

### Context

Need explicit frontend/backend linting and formatting tooling, plus mandatory quality checks in both CI and release deploy pipelines.

### Decision

- Add shared ESLint + Prettier configuration at repository root.
- Add `format` and `format:check` scripts to frontend, backend, and shared packages.
- Update CI workflow to include `format:check` alongside `typecheck`, `lint`, `test`, and `build`.
- Update frontend/backend release deploy workflows to run `format:check`, `lint`, `test`, and `build` before deployment.
- Set a testing maintenance goal to keep tests as fast as possible.

### Consequences

- Higher code quality consistency across apps and shared package.
- Faster detection of style, lint, and regression issues before release.
- Slightly longer pipeline duration due to additional gates, offset by reduced deployment risk.

### Follow-up

- Monitor CI duration and optimize the slowest test suites when they regress.

## 2026-02-22 - Use SQLite locally and Postgres in production via one backend DB layer

### Context

Need a fast local database workflow while keeping production ready for managed Postgres without rewriting repositories.

### Decision

- Add a backend DB layer with environment-driven client selection:
  - SQLite locally (`DB_CLIENT=sqlite`)
  - Postgres for production (`DB_CLIENT=postgres`)
- Use shared repository + migration flow for both engines.
- Add migration/check scripts in backend:
  - `pnpm db:migrate`
  - `pnpm db:check`
- Keep local development zero-config (SQLite defaults) and require database env only in deployment via GitHub secret (`DATABASE_URL`).

### Consequences

- Local setup is fast and dependency-light.
- Production migration to Postgres is straightforward through env config changes.
- Schema and repository changes now need to preserve cross-dialect compatibility.

### Follow-up

- Add production connection pooling and observability metrics once real traffic begins.
- Expand schema with recommendation-domain entities (events, aggregates, availability snapshots).

## 2026-02-22 - Introduce Codex harness workflow and baseline observability

### Context

Need a repeatable way for coding agents to run app services in isolated worktrees with persisted logs, plus explicit production log access guidance.

### Decision

- Add `scripts/harness/agent-harness.sh` with `create`, `start`, `stop`, `status`, and `tail` commands.
- Add `pnpm harness -- <command>` script alias at repository root.
- Add backend structured request logging middleware at `apps/backend/src/platform/observability/request-logger.ts`.
- Add `docs/engineering/AI_HARNESS.md` and `docs/engineering/OBSERVABILITY.md`.
- Update standards and deployment docs to require and explain harness/logging usage.

### Consequences

- Agents and developers can run frontend/backend in isolated worktrees without polluting the main checkout.
- Logs are persisted to file paths that can be referenced during debugging and PR review.
- Production backend requests now emit structured logs that platform logging tools can consume.

### Follow-up

- Add correlation IDs and request-scoped context fields to backend logs.
- Evaluate self-hosted log aggregation (for example Grafana Loki + Promtail) if central retention is required.

## 2026-02-22 - Harden harness engineering with policy checks and OSS log stack

### Context

Harness and observability baseline existed but key guarantees were still manual (hook policy drift, CI policy drift, and local log aggregation setup).

### Decision

- Add `pnpm policy:check` script and enforce it in CI plus Husky pre-commit/pre-push checks.
- Add repository policy verifier: `scripts/policy/verify-harness-policy.sh`.
- Extend harness commands with:
  - `bootstrap` (create + install)
  - `obs-up`, `obs-status`, `obs-down` for local observability stack operations.
- Add open-source local observability stack config with Loki + Promtail + Grafana in `ops/observability/`.
- Remove deprecated Husky loader lines to be compatible with Husky v10.

### Consequences

- Harness and logging standards become mechanically enforced instead of convention-only.
- Developers and agents get consistent local log collection and query workflow using free/open-source tooling.
- Hook and CI behavior is aligned with documented policy.

### Follow-up

- Add request correlation IDs to backend logs and propagate to frontend logging context.
- Add dashboards and alert rules for key backend API error/latency signals.

## 2026-02-22 - Run CI on mainline changes and keep deployment release-only

### Context

Quality checks were moved to release-triggered workflows, which prevented tests/lint/format/typecheck from running on pull requests and merges to `main`.

### Decision

- Trigger `.github/workflows/ci.yml` on `pull_request` and `push` for `main`.
- Keep `.github/workflows/deploy-frontend.yml` and `.github/workflows/deploy-backend.yml` release-triggered (`release.published`).
- Remove format/lint/test/build verification steps from deploy workflows so release workflows focus on deployment only.

### Consequences

- Pull requests and mainline merges now get immediate quality feedback.
- Release workflows are shorter and scoped to production deployment.
- Branch protection can rely on CI checks that run before merge.

### Follow-up

- Mark CI workflow checks as required status checks for the `main` branch protection rule.

## 2026-02-22 - Complete harness-engineering core with session lifecycle, telemetry loop, and automation

### Context

Harness and observability baseline existed, but execution still depended on manual steps for session lifecycle, telemetry querying, UI validation artifacts, and maintenance hygiene.

### Decision

- Expand harness CLI to include session lifecycle and reporting:
  - `session-create`, `session-start`, `session-stop`, `session-destroy`, `session-list`
  - `obs-query-logs`, `obs-query-metrics`, `obs-query-traces`
  - `ui-validate`, `report`
- Add session cleanup and maintenance scripts:
  - `scripts/harness/cleanup-expired-sessions.sh`
  - `scripts/maintenance/harness-gc-report.sh`
  - `scripts/maintenance/repo-hygiene-report.sh`
- Add local OSS telemetry stack for logs + metrics + traces:
  - Loki, Promtail, Prometheus, Tempo, Grafana
- Add backend telemetry surfaces:
  - request IDs and trace IDs in structured request logs
  - trace span logs for key backend use-cases
  - Prometheus metrics endpoint at `/metrics`
- Add Playwright smoke test and CI e2e workflow with artifact upload.
- Add nightly report and weekly cleanup PR automation workflows.
- Strengthen `policy:check` to enforce new files/references and harness capabilities.

### Consequences

- Agents can run repeatable autonomous loops with deterministic setup, evidence capture, and teardown.
- Debugging is faster with one-command log/metric/trace retrieval.
- Repository hygiene and session cleanup are continuously monitored.
- Policy drift is blocked earlier in hooks and CI.

### Follow-up

- Add distributed trace propagation to downstream integrations once external services are introduced.

## 2026-02-22 - Replace frontend placeholder with product-aligned pre-login landing page

### Context

Frontend home page was still a bootstrap placeholder and did not communicate the expectation-vs-reality product differentiation before authentication.

### Decision

- Implement a full pre-login landing page in `apps/frontend/app/page.tsx`.
- Apply the documented design direction (editorial + industrial hybrid) with:
  - Fraunces + Barlow + JetBrains Mono typography roles
  - mobile-first layout
  - intentionally different desktop composition
  - score/data-forward cards and CTA hierarchy
- Keep accessibility and performance guardrails in the page structure and CSS transitions.

### Consequences

- New visitors get a clear value proposition before login.
- Frontend now reflects product positioning and brand language from docs.
- Home page provides a stronger conversion-oriented entrypoint for early-access signup.

### Follow-up

- Connect CTAs to real onboarding/auth routes once auth flow is implemented.
- Add visual regression and e2e checks for landing page key breakpoints.
- Expand Playwright scenarios to cover API-driven decision flows beyond smoke coverage.
