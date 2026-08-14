import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Property intelligence, simplified</span>
          <h1>Make confident property decisions with data.</h1>
          <p className="hero-copy">Estimate a home&apos;s value in seconds or explore property segments and market trends—all in one workspace.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/estimator">Create an estimate <span aria-hidden>→</span></Link>
            <Link className="button button-secondary" href="/market">Explore the market</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="floating-card top-card"><span>Model confidence</span><strong>98.1%</strong><small>R² score</small></div>
          <div className="house-art"><div className="sun"/><div className="roof"/><div className="house"><i/><i/><b/></div><div className="ground"/></div>
          <div className="floating-card bottom-card"><span>Median value</span><strong>$482,500</strong><small>+4.8% this year</small></div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading"><span className="eyebrow">Choose your workspace</span><h2>Two tools. One clear picture.</h2><p>From a single property estimate to a city-wide view, move seamlessly between focused workflows.</p></div>
        <div className="app-grid">
          <Link href="/estimator" className="app-card">
            <span className="app-icon coral">⌂</span><span className="app-label">PROPERTY ESTIMATOR</span>
            <h3>Property Value Estimator</h3><p>Get an instant, model-powered estimate and compare multiple properties side by side.</p><span className="text-link">Open estimator →</span>
          </Link>
          <Link href="/market" className="app-card">
            <span className="app-icon navy">↗</span><span className="app-label">MARKET INSIGHTS</span>
            <h3>Property Market Analysis</h3><p>Explore property trends, segment performance and interactive what-if scenarios.</p><span className="text-link">View market dashboard →</span>
          </Link>
        </div>
      </section>

      <section className="trust-strip"><div><strong>7</strong><span>Property factors</span></div><div><strong>50</strong><span>Market records</span></div><div><strong>Side by side</strong><span>Property comparison</span></div><div><strong>Instant</strong><span>Value estimates</span></div></section>
    </main>
  );
}
