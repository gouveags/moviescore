# Frontend Design Guidelines

## Design Intent

MovieScore UI should feel like a fast decision cockpit, not a social feed.

Design priorities:

- Mobile-first by default
- Distinct visual language per device class
- Fast comprehension of "watch now" decisions
- High readability, low clutter, strong interaction affordance

## Aesthetic Direction

Adopt an Editorial + Industrial hybrid:

- Editorial for taste/trust tone and content hierarchy
- Industrial for utility, signals, and recommendation confidence UI

Signature move:

- Data labels and score badges integrated into cards and headers (not decorative-only)

## Typography System

### Font Pairing

- Display: `Fraunces` (serif, expressive headings)
- Body/UI: `Barlow` (clean utility text)
- Numeric/metrics: `JetBrains Mono` (scores, deltas, confidence values)

Fallback stacks:

- Display: `Fraunces, "Times New Roman", serif`
- Body: `Barlow, "Segoe UI", Roboto, sans-serif`
- Mono: `JetBrains Mono, "SFMono-Regular", Consolas, monospace`

### Type Rules

- Use serif only for major headings and key narrative moments
- Use sans for body, labels, metadata, and controls
- Use mono only for numerical signals (scores, deltas, percentages)
- Maintain 1.6-1.8 visual ratio between heading and body scales

## Color and Surface Language

Core palette:

- Background: `#F6F3EE`
- Foreground text: `#1A1A1A`
- Primary accent: `#D95D39`
- Secondary utility accent: `#1F6E6E`
- Warning/downweight tone: `#A63D40`
- Positive/uplift tone: `#2E7D32`

Surface rules:

- Use subtle paper-grain texture on large surfaces
- Prefer clear card boundaries and controlled shadows
- Keep accents functional (status, intent, emphasis), not decorative noise

## Mobile vs Desktop Style Strategy

Both experiences share brand tokens but have intentionally different composition.

### Mobile (Primary): "Quick Decision Rail"

- Single-column stacked feed with strong card hierarchy
- Sticky top decision controls (filters, runtime, mood, streaming service)
- Score-forward cards showing expectation, predicted satisfaction, and confidence
- Thumb-friendly hit targets (min 44px)
- Minimal text blocks and progressive disclosure for deeper details

### Desktop (Secondary): "Decision Workspace"

- Two-panel layout: recommendation rail + contextual insight panel
- Persistent side modules (availability map, genre drift, confidence explanation)
- More comparative context visible at once (table/list toggles)
- Rich hover states, keyboard shortcuts, and deeper multi-title scanning

Constraint:

- Do not mirror mobile 1:1 on desktop. Desktop must exploit larger canvases for comparison and analysis.

## Component Guidelines

Required core components:

1. `RecommendationCard`
- Title, artwork, predicted satisfaction, confidence, platform badges
- Delta signal chip (historical expectation mismatch relevance)

2. `ExpectationInput`
- 0-10 input with optional reason tags
- Fast submit interaction with clear pre-watch state

3. `PostWatchRating`
- Post-watch score entry with optional short review
- Enforce watched-state dependency in UI flow

4. `DeltaBadge`
- Visual classification: exceeded / matched / disappointed
- Compact numeric label with explainable tooltip copy

5. `AvailabilityPanel`
- Region-specific provider list
- Explicit data freshness/disclaimer line

6. `TasteTrendMiniChart`
- Lightweight trend snapshot for genre/director performance over time

## Motion Guidelines

- Use meaningful motion for hierarchy and state transitions only
- Stagger entry of recommendation cards (80-120ms)
- Keep transitions under 350ms for responsive feel
- Respect `prefers-reduced-motion`

## Accessibility and Performance Rules

- One clear `h1` per page, semantic landmarks everywhere
- Full keyboard operability and visible focus states
- WCAG AA contrast baseline
- Mobile image optimization and lazy loading by default
- Avoid heavy effects on low-end mobile devices

## Responsive Breakpoints

- Mobile: `0-767px`
- Tablet: `768-1023px`
- Desktop: `1024px+`

Behavior requirements:

- Grid collapses to one column under 1024px
- Desktop-only comparison widgets hidden or simplified on mobile
- Hover-dependent interaction always has touch/keyboard equivalent
