# Harness Scorecard

Track the effectiveness of autonomous harness sessions.

## Metrics

- `session_completion_rate`
  - definition: completed sessions / total started sessions
  - target: `>= 90%`
- `mean_time_to_diagnose_minutes`
  - definition: average minutes from failure to root cause evidence (logs/metrics/traces)
  - target: `<= 20`
- `ui_validation_flake_rate`
  - definition: failed Playwright runs retried to pass / total Playwright runs
  - target: `<= 10%`
- `policy_check_failure_rate`
  - definition: failed `pnpm policy:check` runs / total CI runs
  - target: `<= 5%`
- `harness_cleanup_debt`
  - definition: number of stale sessions older than TTL
  - target: `0`

## Weekly Review Template

- Week:
- Sessions started:
- Sessions completed:
- session_completion_rate:
- mean_time_to_diagnose_minutes:
- ui_validation_flake_rate:
- policy_check_failure_rate:
- harness_cleanup_debt:
- Major incidents:
- Remediation actions:
