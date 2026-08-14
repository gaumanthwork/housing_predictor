import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "./components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Haven — Property Intelligence", template: "%s | Haven" },
  description: "Model-powered property valuation and market intelligence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Haven home"><span className="brand-mark">H</span><span>Haven<small>PROPERTY INTELLIGENCE</small></span></Link>
          <Navigation />
          <Link className="header-cta" href="/estimator">New estimate <span aria-hidden>＋</span></Link>
        </header>
        <div id="main-content">{children}</div>
        <footer><Link className="brand footer-brand" href="/"><span className="brand-mark">H</span><span>Haven</span></Link><p>Intelligent property decisions, made simple.</p><span>© 2026 Haven Property Intelligence</span></footer>
      </body>
    </html>
  );
}
