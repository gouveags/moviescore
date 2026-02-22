# MovieScore - Product Overview

## Product Vision

MovieScore is a decision engine for what to watch next.

Unlike platforms focused only on post-watch ratings, MovieScore captures:

- Expectation before watching
- Satisfaction after watching
- The gap between hype and reality

By learning how expectations align with outcomes, MovieScore builds a personalized and evolving taste model.

## Core Features

### 1. Expectation Scoring (Pre-Watch Signal)

Users score how excited they are for a movie or series before watching.

Data captured:

- Expectation score (0-10)
- Timestamp
- Optional reason (trailer, actor, genre)

Why it matters:

- Captures hype alignment
- Enables future-looking recommendations
- Creates a differentiated dataset

### 2. Post-Watch Rating (Satisfaction Signal)

After watching, users rate the title.

Data captured:

- Rating (0-10)
- Timestamp
- Optional short review

Why it matters:

- Measures actual satisfaction
- Enables expectation-vs-reality analysis
- Improves recommendation quality over time

### 3. Expectation vs Reality Delta Engine

MovieScore computes:

`Expectation Score - Final Rating`

Insights generated:

- Genres that over/underperform for a user
- Directors/actors that exceed expectations
- Hype sensitivity patterns
- Taste evolution over time

Recommendation impact:

- Downweight repeated disappointment patterns
- Upweight consistently satisfying patterns

### 4. Personalized Forward-Looking Recommendations

Recommendations prioritize:

- Upcoming releases
- New streaming releases
- In-theater titles
- Newly released series

Traditional platforms optimize for co-watch behavior.
MovieScore optimizes for likely satisfaction based on each user's expectation and outcome history.

### 5. Transparent Availability by Region

MovieScore shows where a title is reported available:

- Streaming services
- Rental services
- Per region

Principles:

- No dark patterns
- No misleading "Watch Now"
- Explicit disclaimer if availability may be outdated

### 6. Clean, Performance-First UX

Design goals:

- Fast loading
- Low cognitive load
- Mobile-first interaction quality
- No endless-scroll addiction patterns

Primary outcome:

Help users decide faster, not browse longer.

### 7. Long-Term Taste Modeling

The recommendation system adapts by:

- Tracking taste changes over time
- Decaying old signals when necessary
- Increasing weight for recent behavior

Result:

Recommendations reflect who the user is now, not years ago.

## Primary Persona

### Lucas Andrade

- Age: 29
- Profession: Software Engineer
- Location: Sao Paulo, Brazil

Profile:

- Watches 2-4 movies per week
- Follows upcoming releases
- Subscribes to multiple streaming services
- Occasionally goes to theaters
- Reads reviews and discussion threads before watching

Key frustrations:

1. Ratings feel misleading for his personal taste
2. Platforms fail to model changing preferences
3. Upcoming releases often disappoint after strong trailers
4. Decision fatigue before pressing play
5. Availability data is fragmented across tools

## Who MovieScore Is For

Ideal users:

- Movie enthusiasts
- Streaming power users
- Trailer/release followers
- People frustrated by generic ratings
- Data-driven choosers

Not for:

- Occasional viewers who do not track taste
- Users unwilling to rate/track titles
- Social-media-first audiences

## Functional Requirements

1. Expectation input for unreleased/unwatched titles, stored with timestamp
2. Post-watch rating only after watched state
3. Automatic delta computation and per-user aggregates
4. Recommendation ranking with rating history, delta patterns, genre weighting, and recency bias
5. Availability display with region and data-freshness disclaimer
6. Onboarding to seed preferences (liked/disliked genres, favorite titles, optional expectation seeding)
7. Performance target: home page load under 2 seconds on good mobile networks

## Non-Functional Requirements

- API-driven and scalable architecture
- Testable recommendation pipeline
- Data privacy compliance
- Secure authentication (OAuth support)

## Value Proposition Summary

MovieScore reduces decision fatigue by learning:

- What excites you
- What actually satisfies you
- How hype impacts your enjoyment

It is a personal taste intelligence system, not just a title catalog.

## One-Sentence Positioning

MovieScore helps you decide what to watch next by learning not just what you liked, but what you expected, and whether those expectations were met.
