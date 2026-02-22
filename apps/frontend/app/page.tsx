import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="landing" id="main-content">
      <div className="grain-overlay" aria-hidden="true" />
      <section className="hero" aria-labelledby="hero-heading">
        <p className="eyebrow">Expectation intelligence for movies and series</p>
        <h1 id="hero-heading">MovieScore</h1>
        <p className="hero-subtitle">A decision engine for what to watch next.</p>
        <p className="hero-copy">
          Stop gambling 40 minutes on browsing. Score hype before play, score truth after credits,
          and let the delta call out what is actually worth your night.
        </p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/login">
            Login
          </Link>
          <Link className="btn btn-secondary" href="/register">
            Create Account
          </Link>
          <Link className="btn btn-subtle" href="#demo">
            Explore Demo
          </Link>
        </div>
      </section>

      <section className="signals" aria-label="Core signals">
        <article className="signal-card">
          <p className="signal-tag">Before watch</p>
          <h2>Expectation score</h2>
          <p>Lock the hype while your gut is loud. Trailer heat, cast pull, pure curiosity.</p>
          <p className="metric">0-10</p>
        </article>
        <article className="signal-card">
          <p className="signal-tag">After watch</p>
          <h2>Satisfaction rating</h2>
          <p>Call it straight after the credits. No critic cosplay. No fake politeness.</p>
          <p className="metric">0-10</p>
        </article>
        <article className="signal-card">
          <p className="signal-tag">Delta intelligence</p>
          <h2>Expectation vs Reality</h2>
          <p>Find your personal pattern: what overhypes, what overdelivers, what to skip.</p>
          <p className="metric">E - R</p>
        </article>
      </section>

      <section className="experience" id="demo" aria-label="Product experience">
        <div className="mobile-rail">
          <h2>Mobile: Quick Decision Rail</h2>
          <p>Thumb-speed choices. Big signals first. Pick in seconds and hit play.</p>
          <div className="sample-card">
            <p className="sample-title">The Last Orbit</p>
            <p>
              Predicted satisfaction: <strong>8.4</strong>
            </p>
            <p>
              Confidence: <strong>88%</strong>
            </p>
            <p className="delta-positive">Historically exceeds expectation</p>
          </div>
        </div>

        <div className="desktop-workspace">
          <h2>Desktop: Decision Workspace</h2>
          <p>Run side-by-side checks with clear rationale and region-aware availability.</p>
          <div className="workspace-grid">
            <div className="workspace-panel">
              <p className="panel-label">Recommendation rail</p>
              <p>Upcoming thrillers with high expected fit and low disappointment risk.</p>
            </div>
            <div className="workspace-panel">
              <p className="panel-label">Insight panel</p>
              <p>Genre drift: Sci-fi up 23% over the last 90 days.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="signup" aria-label="Signup teaser">
        <h2>Watch less junk. Pick better tonight.</h2>
        <p>Join early and build a taste graph that gets sharper every single watch.</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href="/register">
            Create my account
          </Link>
          <Link className="btn btn-subtle" href="/login">
            I already have an account
          </Link>
        </div>
      </section>
    </main>
  );
}
