# AGENTS.md - Frontend

This file extends root instructions for `apps/frontend`.

## Frontend Priorities

- Accessibility first (semantic HTML, keyboard navigation, labels)
- Mobile-first responsive behavior
- Avoid duplicated UI logic; extract shared components/hooks
- Keep presentational and domain concerns separated

## Testing

- Write frontend tests before implementation (TDD)
- Cover critical rendering, interactions, and state transitions
- Add/update end-to-end tests for key user flows

## Documentation

- Every frontend change must trigger documentation review/update.
- Record relevant decisions in `docs/engineering/DECISION_LOG.md`.
