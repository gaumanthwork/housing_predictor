import Link from "next/link";
export default function NotFound() { return <main className="empty-state"><span className="empty-icon">404</span><h1>That address doesn&apos;t exist</h1><p>Let&apos;s get you back to familiar ground.</p><Link className="button button-primary" href="/">Back to overview</Link></main>; }
