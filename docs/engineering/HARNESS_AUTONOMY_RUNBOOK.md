# Harness Autonomy Runbook

## Objective

Run long-lived coding sessions with repeatable harness setup, telemetry capture, validation artifacts, and deterministic teardown.

## Standard Session Flow

1. Bootstrap session worktree:

```bash
pnpm harness -- bootstrap my-task
```

1. Start services in session worktree:

```bash
pnpm harness -- session-start /tmp/moviescore-harness/my-task
```

1. Start local observability stack:

```bash
pnpm harness -- obs-up
```

1. Execute and validate:

```bash
pnpm harness -- ui-validate /tmp/moviescore-harness/my-task smoke
```

1. Query telemetry:

```bash
pnpm harness -- obs-query-logs /tmp/moviescore-harness/my-task error
pnpm harness -- obs-query-metrics /tmp/moviescore-harness/my-task moviescore_http_requests_total
pnpm harness -- obs-query-traces /tmp/moviescore-harness/my-task usecase
```

1. Produce report artifact:

```bash
pnpm harness -- report /tmp/moviescore-harness/my-task
```

1. Stop and destroy session:

```bash
pnpm harness -- session-stop /tmp/moviescore-harness/my-task
pnpm harness -- session-destroy /tmp/moviescore-harness/my-task
```

## Required Evidence Per Session

- Backend and frontend log paths
- At least one metrics snapshot
- At least one trace query output
- UI validation artifact directory path
- Final harness report path

## Failure Recovery

- If frontend/backend service fails to start:
  - inspect corresponding `.harness/logs/*.log`
  - run `pnpm harness -- status <worktree>`
- If observability stack fails:
  - run `pnpm harness -- obs-status`
  - check local Docker daemon availability
- If policy check fails:
  - run `pnpm policy:check`
  - resolve missing required files/references before retry

## Stop Conditions

- Critical command repeatedly fails with same root cause after two attempts
- Policy checks fail with unclear ownership or unresolved drift
- External credentials required for production logs are unavailable
