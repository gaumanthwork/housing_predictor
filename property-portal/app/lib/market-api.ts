import "server-only";
import type { MarketSummary, PropertyPage } from "./types";

const JAVA_API_URL = (process.env.JAVA_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${JAVA_API_URL}${path}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Market API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getInitialMarketData() {
  try {
    const [properties, summary] = await Promise.all([
      get<PropertyPage>("/api/properties?size=100&sort=price&direction=DESC"),
      get<MarketSummary>("/api/market/summary"),
    ]);
    return { properties: properties.content, summary, error: "" };
  } catch {
    return { properties: [], summary: null, error: `Unable to reach the Java market API at ${JAVA_API_URL}.` };
  }
}
