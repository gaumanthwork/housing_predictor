import "server-only";
import type { ModelInfo } from "./types";

const FASTAPI_URL = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${FASTAPI_URL}/${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Estimator API returned ${response.status}`);
  return response.json() as Promise<T>;
}

export type InitialEstimatorData = {
  model: ModelInfo | null;
  healthy: boolean;
  error: string;
};

export async function getInitialEstimatorData(): Promise<InitialEstimatorData> {
  try {
    const [, model] = await Promise.all([
      get<unknown>("health"),
      get<ModelInfo>("model-info"),
    ]);
    return { model, healthy: true, error: "" };
  } catch {
    return {
      model: null,
      healthy: false,
      error: "The valuation service is temporarily unavailable.",
    };
  }
}
