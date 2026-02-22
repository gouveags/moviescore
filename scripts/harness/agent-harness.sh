#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
HARNESS_ROOT="${MOVIESCORE_HARNESS_ROOT:-/tmp/moviescore-harness}"
SESSIONS_ROOT="$HARNESS_ROOT/.sessions"
DEFAULT_BACKEND_METRICS_URL="${BACKEND_METRICS_URL:-http://127.0.0.1:8787/metrics}"

usage() {
  cat <<'USAGE'
Usage:
  agent-harness.sh bootstrap <name>
  agent-harness.sh create <name>
  agent-harness.sh start <worktree-path>
  agent-harness.sh stop <worktree-path>
  agent-harness.sh status <worktree-path>
  agent-harness.sh tail <worktree-path> [backend|frontend]
  agent-harness.sh session-create <name>
  agent-harness.sh session-start <worktree-path>
  agent-harness.sh session-stop <worktree-path>
  agent-harness.sh session-destroy <worktree-path>
  agent-harness.sh session-list
  agent-harness.sh obs-up
  agent-harness.sh obs-down
  agent-harness.sh obs-status
  agent-harness.sh obs-query-logs <worktree-path> <query>
  agent-harness.sh obs-query-metrics <worktree-path> [metric-name]
  agent-harness.sh obs-query-traces <worktree-path> [name-filter]
  agent-harness.sh ui-validate <worktree-path> [scenario]
  agent-harness.sh report <worktree-path>
USAGE
}

if [[ "${1:-}" == "--" ]]; then
  shift
fi

ensure_running_worktree() {
  local worktree_path="$1"
  if [[ ! -d "$worktree_path/.git" && ! -f "$worktree_path/.git" ]]; then
    echo "Worktree does not look like a git checkout: $worktree_path" >&2
    exit 1
  fi
}

ensure_docker_available() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is required for observability stack commands" >&2
    exit 1
  fi
}

ensure_session_dirs() {
  mkdir -p "$SESSIONS_ROOT"
}

session_name_from_path() {
  basename "$1"
}

session_file_for_name() {
  local name="$1"
  echo "$SESSIONS_ROOT/$name.json"
}

write_session_file() {
  local worktree_path="$1"
  local status="$2"
  local session_name
  session_name="$(session_name_from_path "$worktree_path")"
  local session_file
  session_file="$(session_file_for_name "$session_name")"
  local branch_name
  branch_name="$(git -C "$worktree_path" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  local created_at
  created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  cat >"$session_file" <<JSON
{
  "sessionId": "$session_name",
  "createdAt": "$created_at",
  "branch": "$branch_name",
  "worktreePath": "$worktree_path",
  "status": "$status",
  "logPaths": {
    "backend": "$worktree_path/.harness/logs/backend.log",
    "frontend": "$worktree_path/.harness/logs/frontend.log"
  }
}
JSON
}

session_mark_status() {
  local worktree_path="$1"
  local status="$2"
  ensure_session_dirs
  write_session_file "$worktree_path" "$status"
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
    nohup setsid bash -lc "exec $command" >"$log_file" 2>&1 < /dev/null &
    echo $! >"$pid_file"
  )

  sleep 1
  if [[ ! -f "$pid_file" ]] || ! kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "Failed to start $service_name. Recent log output:" >&2
    sed -n '1,80p' "$log_file" >&2 || true
    rm -f "$pid_file"
    return 1
  fi

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

compose_file_path() {
  echo "$ROOT_DIR/ops/observability/docker-compose.yml"
}

run_compose() {
  local compose_file
  compose_file="$(compose_file_path)"
  docker compose -f "$compose_file" "$@"
}

command_session_create() {
  local worktree_name="$1"
  local worktree_path="$HARNESS_ROOT/$worktree_name"
  local branch_name="harness/$worktree_name"

  if [[ -e "$worktree_path" ]]; then
    echo "Target worktree path already exists: $worktree_path" >&2
    exit 1
  fi

  mkdir -p "$HARNESS_ROOT"
  ensure_session_dirs

  git -C "$ROOT_DIR" fetch origin main
  git -C "$ROOT_DIR" worktree add "$worktree_path" -b "$branch_name" origin/main

  mkdir -p "$worktree_path/.harness/logs" "$worktree_path/.harness/pids" "$worktree_path/.harness/artifacts"
  write_session_file "$worktree_path" "created"

  echo "Created worktree: $worktree_path"
  echo "Branch: $branch_name"
}

command_session_start() {
  local worktree_path="$1"
  ensure_running_worktree "$worktree_path"
  mkdir -p "$worktree_path/.harness/logs" "$worktree_path/.harness/pids" "$worktree_path/.harness/artifacts"

  start_service "$worktree_path" "backend" "env FRONTEND_ORIGIN=http://localhost:3000 PORT=8787 pnpm --filter @moviescore/backend run dev:node"
  start_service "$worktree_path" "frontend" "pnpm --filter @moviescore/frontend exec next dev -p 3000"
  session_mark_status "$worktree_path" "running"

  echo "Logs directory: $worktree_path/.harness/logs"
}

command_session_stop() {
  local worktree_path="$1"
  ensure_running_worktree "$worktree_path"
  stop_service "$worktree_path" "backend"
  stop_service "$worktree_path" "frontend"
  session_mark_status "$worktree_path" "stopped"
}

command_session_destroy() {
  local worktree_path="$1"
  ensure_running_worktree "$worktree_path"

  command_session_stop "$worktree_path" || true

  local session_name
  session_name="$(session_name_from_path "$worktree_path")"
  local session_file
  session_file="$(session_file_for_name "$session_name")"
  rm -f "$session_file"

  git -C "$ROOT_DIR" worktree remove --force "$worktree_path"
  echo "Destroyed worktree: $worktree_path"
}

command_session_list() {
  ensure_session_dirs
  if ! ls "$SESSIONS_ROOT"/*.json >/dev/null 2>&1; then
    echo "No harness sessions found."
    return
  fi

  for session_file in "$SESSIONS_ROOT"/*.json; do
    local session_name
    session_name="$(basename "$session_file" .json)"
    local status
    status="$(grep -o '"status": *"[^"]*"' "$session_file" | sed 's/.*"status": *"\([^"]*\)".*/\1/')"
    local worktree_path
    worktree_path="$(grep -o '"worktreePath": *"[^"]*"' "$session_file" | sed 's/.*"worktreePath": *"\([^"]*\)".*/\1/')"
    echo "$session_name | $status | $worktree_path"
  done
}

command_obs_query_logs() {
  local worktree_path="$1"
  local query="$2"
  ensure_running_worktree "$worktree_path"
  grep -n "$query" "$worktree_path/.harness/logs/backend.log" "$worktree_path/.harness/logs/frontend.log" || true
}

command_obs_query_metrics() {
  local _worktree_path="$1"
  local metric_name="${2:-moviescore_http_requests_total}"
  if curl -fsS "$DEFAULT_BACKEND_METRICS_URL" >/dev/null 2>&1; then
    curl -fsS "$DEFAULT_BACKEND_METRICS_URL" | grep "$metric_name" || true
  else
    echo "Could not reach metrics endpoint: $DEFAULT_BACKEND_METRICS_URL" >&2
    exit 1
  fi
}

command_obs_query_traces() {
  local worktree_path="$1"
  local name_filter="${2:-}"
  ensure_running_worktree "$worktree_path"
  local trace_lines
  trace_lines="$(grep -n '\"event\":\"trace.span\"' "$worktree_path/.harness/logs/backend.log" || true)"
  if [[ -z "$name_filter" ]]; then
    echo "$trace_lines"
  else
    echo "$trace_lines" | grep "$name_filter" || true
  fi
}

command_ui_validate() {
  local worktree_path="$1"
  local scenario="${2:-}"
  ensure_running_worktree "$worktree_path"
  local artifact_dir="$worktree_path/.harness/artifacts/ui/$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$artifact_dir"

  (
    cd "$worktree_path"
    if [[ -n "$scenario" ]]; then
      PLAYWRIGHT_ARTIFACT_DIR="$artifact_dir" pnpm --filter @moviescore/frontend exec playwright test "e2e/${scenario}.spec.ts"
    else
      PLAYWRIGHT_ARTIFACT_DIR="$artifact_dir" pnpm --filter @moviescore/frontend exec playwright test
    fi
  )

  echo "UI validation artifacts: $artifact_dir"
}

command_report() {
  local worktree_path="$1"
  ensure_running_worktree "$worktree_path"
  local report_dir="$worktree_path/.harness/reports"
  local report_file="$report_dir/$(date -u +%Y%m%dT%H%M%SZ).md"
  mkdir -p "$report_dir"

  {
    echo "# Harness Session Report"
    echo
    echo "- worktree: $worktree_path"
    echo "- generatedAt: $(date -u +\"%Y-%m-%dT%H:%M:%SZ\")"
    echo
    echo "## Logs"
    echo "- backend: $worktree_path/.harness/logs/backend.log"
    echo "- frontend: $worktree_path/.harness/logs/frontend.log"
    echo
    echo "## Recent Errors"
    grep -inE "error|failed|exception" "$worktree_path/.harness/logs/backend.log" "$worktree_path/.harness/logs/frontend.log" | tail -n 50 || true
    echo
    echo "## Metrics Snapshot"
    curl -fsS "$DEFAULT_BACKEND_METRICS_URL" | head -n 40 || echo "metrics endpoint unavailable"
    echo
    echo "## Trace Snapshot"
    grep '\"event\":\"trace.span\"' "$worktree_path/.harness/logs/backend.log" | tail -n 20 || true
  } >"$report_file"

  echo "Harness report written to: $report_file"
}

command_name="${1:-}"

case "$command_name" in
  bootstrap)
    worktree_name="${2:-}"
    if [[ -z "$worktree_name" ]]; then
      usage
      exit 1
    fi
    command_session_create "$worktree_name"
    worktree_path="$HARNESS_ROOT/$worktree_name"
    (
      cd "$worktree_path"
      pnpm install --frozen-lockfile
    )
    echo "Bootstrapped worktree: $worktree_path"
    ;;
  create|session-create)
    worktree_name="${2:-}"
    if [[ -z "$worktree_name" ]]; then
      usage
      exit 1
    fi
    command_session_create "$worktree_name"
    ;;
  start|session-start)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_session_start "$worktree_path"
    ;;
  stop|session-stop)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_session_stop "$worktree_path"
    ;;
  session-destroy)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_session_destroy "$worktree_path"
    ;;
  session-list)
    command_session_list
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
  obs-query-logs)
    worktree_path="${2:-}"
    query="${3:-}"
    if [[ -z "$worktree_path" || -z "$query" ]]; then
      usage
      exit 1
    fi
    command_obs_query_logs "$worktree_path" "$query"
    ;;
  obs-query-metrics)
    worktree_path="${2:-}"
    metric_name="${3:-moviescore_http_requests_total}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_obs_query_metrics "$worktree_path" "$metric_name"
    ;;
  obs-query-traces)
    worktree_path="${2:-}"
    name_filter="${3:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_obs_query_traces "$worktree_path" "$name_filter"
    ;;
  ui-validate)
    worktree_path="${2:-}"
    scenario="${3:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_ui_validate "$worktree_path" "$scenario"
    ;;
  report)
    worktree_path="${2:-}"
    if [[ -z "$worktree_path" ]]; then
      usage
      exit 1
    fi
    command_report "$worktree_path"
    ;;
  *)
    usage
    exit 1
    ;;
esac
