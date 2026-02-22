# Frontend Architecture

## Scope

Defines high-level architecture for `apps/frontend`.

## Responsibilities

- User-facing pages and UI components
- Client state and data fetching
- Accessibility and responsive behavior

## Principles

- Feature-oriented folder structure
- Reusable UI components with clear ownership
- Server/client boundaries explicit in code
- API contract consumption via shared types from `packages/shared`

## Quality Gates

- Component/unit tests for critical UI logic
- End-to-end tests for core user journeys
- Accessibility checks for interactive screens
