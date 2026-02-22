#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"
HARNESS_ROOT="${MOVIESCORE_HARNESS_ROOT:-/tmp/moviescore-harness}"
SESSIONS_ROOT="$HARNESS_ROOT/.sessions"
TTL_HOURS="${HARNESS_SESSION_TTL_HOURS:-72}"

if [[ ! -d "$SESSIONS_ROOT" ]]; then
  echo "No session directory found at $SESSIONS_ROOT"
  exit 0
fi

now_epoch="$(date +%s)"

for session_file in "$SESSIONS_ROOT"/*.json; do
  [[ -f "$session_file" ]] || continue

  status="$(grep -o '"status": *"[^"]*"' "$session_file" | sed 's/.*"status": *"\([^"]*\)".*/\1/')"
  worktree_path="$(grep -o '"worktreePath": *"[^"]*"' "$session_file" | sed 's/.*"worktreePath": *"\([^"]*\)".*/\1/')"
  created_at="$(grep -o '"createdAt": *"[^"]*"' "$session_file" | sed 's/.*"createdAt": *"\([^"]*\)".*/\1/')"

  if [[ "$status" != "stopped" ]]; then
    continue
  fi

  created_epoch="$(date -d "$created_at" +%s)"
  age_hours="$(((now_epoch - created_epoch) / 3600))"

  if (( age_hours >= TTL_HOURS )); then
    echo "Cleaning session: $(basename "$session_file") age=${age_hours}h"
    if [[ -n "$worktree_path" && -e "$worktree_path" ]]; then
      git -C "$ROOT_DIR" worktree remove --force "$worktree_path" || true
    fi
    rm -f "$session_file"
  fi
done

echo "Expired session cleanup complete."
