#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "# Repository Hygiene Report"
echo
echo "- generatedAt: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo

echo "## Policy Check"
if bash "$ROOT_DIR/scripts/policy/verify-harness-policy.sh" >/tmp/policy-check.out 2>&1; then
  echo "- status: pass"
else
  echo "- status: fail"
  echo
  echo '```'
  cat /tmp/policy-check.out
  echo '```'
fi
echo

echo "## Harness Scripts"
ls -1 "$ROOT_DIR/scripts/harness" || true
echo

echo "## Observability Stack Files"
find "$ROOT_DIR/ops/observability" -type f | sort || true
