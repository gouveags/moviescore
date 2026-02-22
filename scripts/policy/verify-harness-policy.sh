#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"

require_file() {
  local file_path="$1"
  if [[ ! -f "$ROOT_DIR/$file_path" ]]; then
    echo "Missing required file: $file_path" >&2
    exit 1
  fi
}

require_contains() {
  local file_path="$1"
  local pattern="$2"
  if ! grep -Fq "$pattern" "$ROOT_DIR/$file_path"; then
    echo "Expected pattern not found in $file_path: $pattern" >&2
    exit 1
  fi
}

require_not_contains() {
  local file_path="$1"
  local pattern="$2"
  if grep -Fq "$pattern" "$ROOT_DIR/$file_path"; then
    echo "Forbidden pattern found in $file_path: $pattern" >&2
    exit 1
  fi
}

require_executable() {
  local file_path="$1"
  if [[ ! -x "$ROOT_DIR/$file_path" ]]; then
    echo "File must be executable: $file_path" >&2
    exit 1
  fi
}

require_file "AGENTS.md"
require_file "docs/engineering/AI_HARNESS.md"
require_file "docs/engineering/OBSERVABILITY.md"
require_file "docs/engineering/HARNESS_AUTONOMY_RUNBOOK.md"
require_file "docs/engineering/HARNESS_SCORECARD.md"
require_file "scripts/harness/agent-harness.sh"
require_file "scripts/harness/cleanup-expired-sessions.sh"
require_file "scripts/maintenance/harness-gc-report.sh"
require_file "scripts/maintenance/repo-hygiene-report.sh"
require_file "apps/backend/src/platform/observability/request-logger.ts"
require_file "apps/backend/src/platform/observability/metrics.ts"
require_file "apps/backend/src/platform/observability/trace.ts"
require_file ".husky/pre-commit"
require_file ".husky/pre-push"
require_file "ops/observability/docker-compose.yml"
require_file "ops/observability/prometheus.yml"
require_file "ops/observability/tempo-config.yml"
require_file "apps/frontend/playwright.config.ts"
require_file "apps/frontend/e2e/smoke.spec.ts"

require_executable "scripts/harness/agent-harness.sh"
require_executable "scripts/harness/cleanup-expired-sessions.sh"
require_executable "scripts/maintenance/harness-gc-report.sh"
require_executable "scripts/maintenance/repo-hygiene-report.sh"

require_contains "AGENTS.md" "docs/engineering/AI_HARNESS.md"
require_contains "AGENTS.md" "docs/engineering/OBSERVABILITY.md"
require_contains "AGENTS.md" "docs/engineering/HARNESS_AUTONOMY_RUNBOOK.md"
require_contains "AGENTS.md" "docs/engineering/HARNESS_SCORECARD.md"
require_contains "apps/backend/src/index.ts" "app.use(\"*\", createRequestLogger())"
require_contains "apps/backend/src/index.ts" "app.get(\"/metrics\""
require_contains ".github/workflows/ci.yml" "pnpm policy:check"
require_contains "scripts/harness/agent-harness.sh" "session-create"
require_contains "scripts/harness/agent-harness.sh" "obs-query-metrics"
require_contains "scripts/harness/agent-harness.sh" "ui-validate"
require_contains "scripts/harness/agent-harness.sh" "report"

require_not_contains ".husky/pre-commit" "husky.sh"
require_not_contains ".husky/pre-push" "husky.sh"

echo "Harness policy verification passed."
