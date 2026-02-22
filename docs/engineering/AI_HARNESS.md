# AI Harness for Codex

## Purpose

Provide a repeatable way for coding agents to:

- create isolated worktrees from latest `origin/main`
- run backend and frontend in that worktree
- capture console logs to persistent files for debugging and review

## Script

Harness entrypoint:

- `scripts/harness/agent-harness.sh`
- `pnpm harness -- <command>`

## Commands

Bootstrap a worktree (create + install dependencies):

```bash
pnpm harness -- bootstrap my-task
```

Create a harness worktree:

```bash
pnpm harness -- create my-task
```

Preferred session command:

```bash
pnpm harness -- session-create my-task
```

Start backend + frontend in that worktree:

```bash
pnpm harness -- start /tmp/moviescore-harness/my-task
```

Preferred session command:

```bash
pnpm harness -- session-start /tmp/moviescore-harness/my-task
```

Show process status:

```bash
pnpm harness -- status /tmp/moviescore-harness/my-task
```

Tail logs:

```bash
pnpm harness -- tail /tmp/moviescore-harness/my-task backend
pnpm harness -- tail /tmp/moviescore-harness/my-task frontend
```

Stop both services:

```bash
pnpm harness -- stop /tmp/moviescore-harness/my-task
```

Stop using session command:

```bash
pnpm harness -- session-stop /tmp/moviescore-harness/my-task
```

Destroy session worktree:

```bash
pnpm harness -- session-destroy /tmp/moviescore-harness/my-task
```

List sessions:

```bash
pnpm harness -- session-list
```

Start local open-source observability stack (Loki + Promtail + Grafana):

```bash
pnpm harness -- obs-up
pnpm harness -- obs-status
pnpm harness -- obs-down
```

Query telemetry:

```bash
pnpm harness -- obs-query-logs /tmp/moviescore-harness/my-task error
pnpm harness -- obs-query-metrics /tmp/moviescore-harness/my-task moviescore_http_requests_total
pnpm harness -- obs-query-traces /tmp/moviescore-harness/my-task usecase
```

Run UI validation:

```bash
pnpm harness -- ui-validate /tmp/moviescore-harness/my-task smoke
```

Generate session report:

```bash
pnpm harness -- report /tmp/moviescore-harness/my-task
```

## Log and PID Paths

Inside each harness worktree:

- logs: `<worktree>/.harness/logs/backend.log`
- logs: `<worktree>/.harness/logs/frontend.log`
- pids: `<worktree>/.harness/pids/backend.pid`
- pids: `<worktree>/.harness/pids/frontend.pid`
- UI artifacts: `<worktree>/.harness/artifacts/ui/<timestamp>/`
- session reports: `<worktree>/.harness/reports/<timestamp>.md`
- session metadata: `/tmp/moviescore-harness/.sessions/<name>.json`

`.harness/` is git-ignored.

## Agent Rules

- For non-trivial coding sessions, create and use a harness worktree first.
- Do not run long-lived dev servers directly in the primary repository checkout.
- Reference captured log file paths in PR descriptions when debugging behavior.
- Keep default harness root as `/tmp/moviescore-harness` when using local log aggregation.
- Follow `docs/engineering/HARNESS_AUTONOMY_RUNBOOK.md` for long-lived autonomous flows.

## Policy Enforcement

- CI and git hooks run `pnpm policy:check`.
- Policy check verifies:
  - harness and observability docs are present and referenced
  - runbook and scorecard docs are present and referenced
  - backend request logging and metrics endpoint are wired
  - session/query/report harness commands exist
  - Husky hook scripts are v10-safe (no deprecated loader lines)
