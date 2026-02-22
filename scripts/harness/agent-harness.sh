#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
HARNESS_ROOT="${MOVIESCORE_HARNESS_ROOT:-/tmp/moviescore-harness}"

usage() {
  cat <<'EOF'
Usage:
  agent-harness.sh bootstrap <name>
  agent-harness.sh create <name>
  agent-harness.sh start <worktree-path>
  agent-harness.sh stop <worktree-path>
  agent-harness.sh status <worktree-path>
  agent-harness.sh tail <worktree-path> [backend|frontend]
  agent-harness.sh obs-up
  agent-harness.sh obs-down
  agent-harness.sh obs-status
EOF
}

ensure_running_worktree() {
  local worktree_path="$1"
  if [[ ! -d "$worktree_path/.git" && ! -f "$worktree_path/.git" ]]; then
    echo "Worktree does not look like a git checkout: $worktree_path" >&2
    exit 1
  fi
}

start_service() {
  local worktree_path="$1"
  local service_name="$2"
  local command="$3"
  local pid_file="$worktree_path/.harness/pids/${service_name}.pid"
  local log_file="$worktree_path/.harness/logs/${service_name}.log"

  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "$service_name already running (pid $(cat "$pid_file"))"
    return
  fi

  (
    cd "$worktree_path"
    nohup bash -lc "$command" >"$log_file" 2>&1 &
    echo $! >"$pid_file"
  )

  echo "Started $service_name (pid $(cat "$pid_file"))"
}

stop_service() {
  local worktree_path="$1"
  local service_name="$2"
  local pid_file="$worktree_path/.harness/pids/${service_name}.pid"

  if [[ ! -f "$pid_file" ]]; then
    echo "$service_name not running (no pid file)"
    return
  fi

  local pid
  pid="$(cat "$pid_file")"

  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid"
    echo "Stopped $service_name (pid $pid)"
  else
    echo "$service_name pid $pid already exited"
  fi

  rm -f "$pid_file"
}

print_service_status() {
  local worktree_path="$1"
  local service_name="$2"
  local pid_file="$worktree_path/.harness/pids/${service_name}.pid"
  local log_file="$worktree_path/.harness/logs/${service_name}.log"

  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "$service_name: running (pid $(cat "$pid_file"))"
  else
    echo "$service_name: stopped"
  fi

  echo "$service_name log: $log_file"
}

ensure_docker_available() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required for observability stack commands" >&2
    exit 1
  fi
}

compose_file_path() {
  echo "$ROOT_DIR/ops/observability/docker-compose.yml"
}

run_compose() {
  local compose_file
  compose_file="$(compose_file_path)"
  docker compose -f "$compose_file" "$@"
}

if [[ "${1:-}" == "--" ]]; then
  shift
fi

command_name="${1:-}"

case "$command_name" in
  bootstrap)
    worktree_name="${2:-}"
    if [[ -z "$worktree_name" ]]; then
      usage
      exit 1
    fi

    "$0" create "$worktree_name"
    worktree_path="$HARNESS_ROOT/$worktree_name"
    (
      cd "$worktree_path"
      pnpm install --frozen-lockfile
    )
    echo "Bootstrapped worktree: $worktree_path"
    ;;
  create)
    worktree_name="${2:-}"
    if [[ -z "$worktree_name" ]]; then
      usage
      exit 1
    fi

    worktree_path="$HARNESS_ROOT/$worktree_name"
    branch_name="harness/$worktree_name"

    if [[ -e "$worktree_path" ]]; then
      echo "Target worktree path already exists: $worktree_path" >&2
      exit 1
    fi

    mkdir -p "$HARNESS_ROOT"
    git -C "$ROOT_DIR" fetch origin main
    git -C "$ROOT_DIR" worktree add "$worktree_path" -b "$branch_name" origin/main

    echo "Created worktree: $worktree_path"
    echo "Branch: $branch_name"
    ;;
  start)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi

    ensure_running_worktree "$worktree_path"
    mkdir -p "$worktree_path/.harness/logs" "$worktree_path/.harness/pids"

    start_service "$worktree_path" "backend" "pnpm --filter @moviescore/backend dev"
    start_service "$worktree_path" "frontend" "pnpm --filter @moviescore/frontend dev"

    echo "Logs directory: $worktree_path/.harness/logs"
    ;;
  stop)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi

    ensure_running_worktree "$worktree_path"
    stop_service "$worktree_path" "backend"
    stop_service "$worktree_path" "frontend"
    ;;
  status)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi

    ensure_running_worktree "$worktree_path"
    print_service_status "$worktree_path" "backend"
    print_service_status "$worktree_path" "frontend"
    ;;
  tail)
    worktree_path="${2:-}"
    target="${3:-backend}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi

    ensure_running_worktree "$worktree_path"
    case "$target" in
      backend)
        tail -n 200 -f "$worktree_path/.harness/logs/backend.log"
        ;;
      frontend)
        tail -n 200 -f "$worktree_path/.harness/logs/frontend.log"
        ;;
      *)
        echo "Unknown target: $target (use backend or frontend)" >&2
        exit 1
        ;;
    esac
    ;;
  obs-up)
    ensure_docker_available
    run_compose up -d
    ;;
  obs-down)
    ensure_docker_available
    run_compose down
    ;;
  obs-status)
    ensure_docker_available
    run_compose ps
    ;;
  *)
    usage
    exit 1
    ;;
esac
