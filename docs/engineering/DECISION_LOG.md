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
