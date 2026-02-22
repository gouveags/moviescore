# Frontend Architecture

## Scope

Defines high-level architecture for `apps/frontend`.

## Responsibilities

- User-facing pages and UI components
- Client state and data fetching
- Accessibility and responsive behavior
- Fast decision support UX for "what to watch next"
- Secure auth UX (login/register/recover) and authenticated shell entry

## Product-Aligned Frontend Goals

- Prioritize watch-decision speed over social feed engagement
- Make expectation and post-watch input frictionless
- Surface recommendation confidence and rationale clearly
- Keep interaction quality high on mobile as primary platform

## Principles

- Feature-oriented folder structure
- Reusable UI components with clear ownership
- Server/client boundaries explicit in code
- API contract consumption via shared types from `packages/shared`
- Device-aware UI composition (mobile and desktop intentionally different)

## UX Architecture by Device

### Mobile-First (default)

- Single-column, card-led navigation
- Sticky decision controls for filters and context
- Fast input surfaces for expectation/rating updates
- Progressive disclosure for secondary metadata

### Desktop

- Split-pane layouts for recommendations + insight context
- Comparative scanning patterns for multiple titles
- Denser information with keyboard-accessible interactions

For detailed visual rules, see `docs/frontend/FRONTEND_DESIGN_GUIDELINES.md`.

## Component Boundaries

Core UI modules should remain independent and composable:

- Recommendation presentation (`RecommendationCard`, lists, filters)
- Input capture (`ExpectationInput`, `PostWatchRating`)
- Signal explanation (`DeltaBadge`, confidence/reason UI)
- Availability display (`AvailabilityPanel`)

Business logic for ranking and deltas should remain in shared/backend layers, not embedded in presentational components.

## Route Map (Current)

- `/` pre-login landing
- `/login` sign-in with optional 2FA fields
- `/register` account creation
- `/recover` password reset request/confirm flow
- `/home` authenticated entry page (greets user by display name)

## Auth Client Boundary

Auth HTTP calls live in `apps/frontend/lib/auth-api.ts`.

Rules:

- All requests use `credentials: include`
- Browser storage is not used for auth tokens
- Session refresh uses backend cookie rotation endpoints (`/api/auth/refresh`)

## Theme Strategy

- Default visual system is true-dark
- High-contrast accents reserved for decision signals and CTA emphasis
- Mobile and desktop keep shared tokens but different composition patterns

## Quality Gates

- Unit/component tests for critical UI logic and interaction state
- End-to-end tests for key user journeys
- Accessibility checks for interactive screens
- Build, format, lint, and test checks enforced by CI on pull requests and merges to `main`
