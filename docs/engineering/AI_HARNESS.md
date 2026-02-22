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

Start backend + frontend in that worktree:

```bash
pnpm harness -- start /tmp/moviescore-harness/my-task
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

Start local open-source observability stack (Loki + Promtail + Grafana):

```bash
pnpm harness -- obs-up
pnpm harness -- obs-status
pnpm harness -- obs-down
```

## Log and PID Paths

Inside each harness worktree:

- logs: `<worktree>/.harness/logs/backend.log`
- logs: `<worktree>/.harness/logs/frontend.log`
- pids: `<worktree>/.harness/pids/backend.pid`
- pids: `<worktree>/.harness/pids/frontend.pid`

`.harness/` is git-ignored.

## Agent Rules

- For non-trivial coding sessions, create and use a harness worktree first.
- Do not run long-lived dev servers directly in the primary repository checkout.
- Reference captured log file paths in PR descriptions when debugging behavior.
- Keep default harness root as `/tmp/moviescore-harness` when using local log aggregation.

## Policy Enforcement

- CI and git hooks run `pnpm policy:check`.
- Policy check verifies:
  - harness and observability docs are present and referenced
  - backend request logging middleware is wired
  - Husky hook scripts are v10-safe (no deprecated loader lines)
