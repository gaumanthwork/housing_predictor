"use client";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <main className="empty-state"><span className="empty-icon">!</span><h1>Something went off course</h1><p>We couldn&apos;t load this page. Your data is safe—please try again.</p><button className="button button-primary" onClick={reset}>Try again</button></main>;
}
