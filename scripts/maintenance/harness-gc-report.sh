#!/usr/bin/env bash

set -euo pipefail

HARNESS_ROOT="${MOVIESCORE_HARNESS_ROOT:-/tmp/moviescore-harness}"
SESSIONS_ROOT="$HARNESS_ROOT/.sessions"

echo "# Harness GC Report"
echo
echo "- generatedAt: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "- harnessRoot: $HARNESS_ROOT"
echo

echo "## Sessions"
if [[ -d "$SESSIONS_ROOT" ]]; then
  ls -1 "$SESSIONS_ROOT"/*.json 2>/dev/null || echo "No sessions found."
else
  echo "No session directory found."
fi
echo

echo "## Worktrees under Harness Root"
if [[ -d "$HARNESS_ROOT" ]]; then
  find "$HARNESS_ROOT" -maxdepth 1 -mindepth 1 -type d | sort || true
else
  echo "Harness root does not exist."
fi
echo

echo "## Large Harness Logs (> 10MB)"
if [[ -d "$HARNESS_ROOT" ]]; then
  find "$HARNESS_ROOT" -type f -path "*/.harness/logs/*.log" -size +10M -print || echo "None"
else
  echo "Harness root does not exist."
fi
