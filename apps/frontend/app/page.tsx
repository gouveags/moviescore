import React from "react";

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
          Fewer tabs. Fewer guesses. Better picks. Score anticipation before watching, rate the
          result after, and let the delta do the heavy lifting.
        </p>
        <div className="cta-row">
          <a className="btn btn-primary" href="#signup">
            Get Early Access
          </a>
          <a className="btn btn-secondary" href="#demo">
            Explore Demo
          </a>
        </div>
      </section>

      <section className="signals" aria-label="Core signals">
        <article className="signal-card">
          <p className="signal-tag">Before watch</p>
          <h2>Expectation score</h2>
          <p>Catch the hype when it is real. Trailer, cast, mood. Quick score. Done.</p>
          <p className="metric">0-10</p>
        </article>
        <article className="signal-card">
          <p className="signal-tag">After watch</p>
          <h2>Satisfaction rating</h2>
          <p>Call the shot after credits roll. Keep it honest. Keep it simple.</p>
          <p className="metric">0-10</p>
        </article>
        <article className="signal-card">
          <p className="signal-tag">Delta intelligence</p>
          <h2>Expectation vs Reality</h2>
          <p>See where hype lies. See what over-delivers. Improve the next decision.</p>
          <p className="metric">E - R</p>
        </article>
      </section>

      <section className="experience" id="demo" aria-label="Product experience">
        <div className="mobile-rail">
          <h2>Mobile: Quick Decision Rail</h2>
          <p>Built for thumb speed. Big signals first. Fast pick, no rabbit holes.</p>
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
          <p>Compare candidates side by side. Clear reasons. Region-aware availability.</p>
          <div className="workspace-grid">
            <div className="workspace-panel">
              <p className="panel-label">Recommendation Rail</p>
              <p>Upcoming thrillers with high expected fit and low disappointment risk.</p>
            </div>
            <div className="workspace-panel">
              <p className="panel-label">Insight Panel</p>
              <p>Genre drift: Sci-fi up 23% over the last 90 days.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="signup" id="signup" aria-label="Signup teaser">
        <h2>Watch less junk. Pick better tonight.</h2>
        <p>Join early access. Help build the recommendation engine that respects your time.</p>
        <a className="btn btn-primary" href="#main-content">
          Reserve my spot
        </a>
      </section>
    </main>
  );
}
