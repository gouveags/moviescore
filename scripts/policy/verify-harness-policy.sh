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
require_file "scripts/harness/agent-harness.sh"
require_file "apps/backend/src/platform/observability/request-logger.ts"
require_file ".husky/pre-commit"
require_file ".husky/pre-push"
require_file "ops/observability/docker-compose.yml"

require_executable "scripts/harness/agent-harness.sh"

require_contains "AGENTS.md" "docs/engineering/AI_HARNESS.md"
require_contains "AGENTS.md" "docs/engineering/OBSERVABILITY.md"
require_contains "apps/backend/src/index.ts" "app.use(\"*\", createRequestLogger())"
require_contains ".github/workflows/ci.yml" "pnpm policy:check"

require_not_contains ".husky/pre-commit" "husky.sh"
require_not_contains ".husky/pre-push" "husky.sh"

echo "Harness policy verification passed."
