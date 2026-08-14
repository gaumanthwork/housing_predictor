import type { Metadata } from "next";
import { Estimator } from "./estimator";
import { getInitialEstimatorData } from "../lib/estimator-api";
export const metadata: Metadata = { title: "Property Value Estimator" };
export default async function EstimatorPage() {
  const initialData = await getInitialEstimatorData();
  return <Estimator initialData={initialData} />;
}
