import type { Metadata } from "next";
import { MarketDashboard } from "./market-dashboard";
import { getInitialMarketData } from "../lib/market-api";
export const metadata: Metadata = { title: "Market Analysis" };
export default async function MarketPage() {
  const data = await getInitialMarketData();
  return <MarketDashboard initialProperties={data.properties} initialSummary={data.summary} initialError={data.error}/>;
}
