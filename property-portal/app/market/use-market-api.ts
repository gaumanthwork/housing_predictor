"use client";

import { useCallback, useRef, useState } from "react";
import type { MarketProperty, MarketSummary, PropertyInput, PropertyPage } from "../lib/types";

type PropertyPayload = PropertyInput & { price: number };

export function useMarketApi() {
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState("");
  const pending = useRef(0);

  const request = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    pending.current += 1; setBusy(true); setApiError("");
    try {
      const response = await fetch(`/api/market/${path}`, init);
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(data?.message || "Market API request failed");
      return data as T;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Market API request failed";
      setApiError(message); throw error;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setBusy(false);
    }
  }, []);

  const load = useCallback(async () => {
    const [page, summary] = await Promise.all([
      request<PropertyPage>("properties?size=100&sort=price&direction=DESC"),
      request<MarketSummary>("market/summary"),
    ]);
    return { properties: page.content, summary };
  }, [request]);
  const save = useCallback((payload: PropertyPayload, id?: number) => request<MarketProperty>(id ? `properties/${id}` : "properties", {
    method: id ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  }), [request]);
  const remove = useCallback((id: number) => request<void>(`properties/${id}`, { method: "DELETE" }), [request]);
  const whatIf = useCallback((payload: PropertyInput) => request<{ predicted_price: number }>("market/what-if", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  }), [request]);

  return { busy, apiError, setApiError, load, save, remove, whatIf };
}
