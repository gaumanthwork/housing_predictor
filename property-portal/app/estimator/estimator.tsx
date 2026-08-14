"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { DEFAULT_PROPERTY, Estimate, extractPrice, ModelInfo, PropertyInput } from "../lib/types";
import { compactMoney, money, number, titleCase } from "../lib/format";
import type { InitialEstimatorData } from "../lib/estimator-api";

const fields: { key: keyof PropertyInput; label: string; suffix: string; min: number; max: number; step?: number }[] = [
  { key: "square_footage", label: "Living area", suffix: "sq ft", min: 200, max: 20000 }, { key: "bedrooms", label: "Bedrooms", suffix: "rooms", min: 0, max: 20 },
  { key: "bathrooms", label: "Bathrooms", suffix: "rooms", min: 0, max: 20, step: .5 }, { key: "year_built", label: "Year built", suffix: "year", min: 1800, max: new Date().getFullYear() },
  { key: "lot_size", label: "Lot size", suffix: "sq ft", min: 0, max: 1000000 }, { key: "distance_to_city_center", label: "Distance to city centre", suffix: "miles", min: 0, max: 200, step: .1 },
  { key: "school_rating", label: "School rating", suffix: "/ 10", min: 0, max: 10, step: .1 },
];

function loadHistory(): Estimate[] { try { return typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("haven-estimates") || "[]"); } catch { return []; } }

export function Estimator({ initialData }: { initialData: InitialEstimatorData }) {
  const [values, setValues] = useState<PropertyInput>(DEFAULT_PROPERTY);
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyInput, string>>>({});
  const [history, setHistory] = useState<Estimate[]>(loadHistory);
  const [selected, setSelected] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(initialData.error);
  const [model, setModel] = useState<ModelInfo | null>(initialData.model);
  const [healthy, setHealthy] = useState<boolean | null>(initialData.healthy);
  const [tab, setTab] = useState<"result" | "history" | "compare">("result");
  const [checking, setChecking] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  async function retryService() {
    setChecking(true); setApiError("");
    try {
      const [health, info] = await Promise.all([fetch("/api/backend/health"), fetch("/api/backend/model-info")]);
      if (!health.ok || !info.ok) throw new Error("The valuation service is temporarily unavailable.");
      setModel(await info.json()); setHealthy(true);
    } catch (error) {
      setHealthy(false); setApiError(error instanceof Error ? error.message : "The valuation service is temporarily unavailable.");
    } finally { setChecking(false); }
  }

  function moveTab(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const tabs = Array.from(tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []);
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  }

  const validate = () => {
    const next: Partial<Record<keyof PropertyInput, string>> = {};
    fields.forEach(({ key, min, max }) => { const v = values[key]; if (!Number.isFinite(v)) next[key] = "Enter a valid number"; else if (v < min || v > max) next[key] = `Use a value from ${number.format(min)} to ${number.format(max)}`; });
    setErrors(next); return Object.keys(next).length === 0;
  };

  async function submit(event: FormEvent) {
    event.preventDefault(); if (!validate()) return; setLoading(true); setApiError("");
    try {
      const response = await fetch("/api/backend/predict", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json(); if (!response.ok) throw new Error(data.detail || "Prediction failed");
      const price = extractPrice(data); setPrediction(price); setHealthy(true); setTab("result");
      const item: Estimate = { ...values, id: crypto.randomUUID(), price, createdAt: new Date().toISOString(), name: `${values.bedrooms} bed · ${number.format(values.square_footage)} sq ft` };
      const next = [item, ...history].slice(0, 12); setHistory(next); localStorage.setItem("haven-estimates", JSON.stringify(next));
    } catch (error) { setApiError(error instanceof Error ? error.message : "Could not create estimate"); setHealthy(false); } finally { setLoading(false); }
  }

  const compared = useMemo(() => history.filter(item => selected.includes(item.id)), [history, selected]);

  return <main className="page-shell estimator-page">
    <div className="page-title-row"><div><span className="eyebrow">APP 01 · PROPERTY ESTIMATOR</span><h1>What is your property worth?</h1><p>Enter a few details and our regression model will calculate an instant estimate.</p></div><div className={`status-pill ${healthy === false ? "offline" : ""}`} role="status"><i/>{checking || healthy === null ? "Checking model" : healthy ? "Model online" : "Model offline"}</div></div>
    <div className="workspace-grid">
      <form className="panel form-panel" onSubmit={submit} noValidate>
        <div className="panel-heading"><span className="step-number">01</span><div><h2>Property details</h2><p>All fields are required</p></div></div>
        <div className="field-grid">{fields.map(field => <label key={field.key}><span>{field.label}</span><div className={errors[field.key] ? "input-wrap invalid" : "input-wrap"}><input aria-invalid={!!errors[field.key]} aria-describedby={`${field.key}-error`} type="number" min={field.min} max={field.max} step={field.step || 1} value={values[field.key]} onChange={e => setValues({ ...values, [field.key]: e.target.valueAsNumber })}/><em>{field.suffix}</em></div>{errors[field.key] && <small id={`${field.key}-error`} className="field-error">{errors[field.key]}</small>}</label>)}</div>
        {apiError && <div className="api-error" role="alert"><span><strong>Estimate unavailable.</strong> {apiError}</span>{healthy === false && <button type="button" onClick={retryService} disabled={checking}>{checking ? "Retrying…" : "Retry service"}</button>}</div>}
        <button className="button button-primary submit-button" disabled={loading}>{loading ? <><span className="spinner"/>Calculating estimate…</> : <>Calculate property value <span>→</span></>}</button>
        <p className="form-note">Your estimate is generated by a Linear Regression model. It is a guide, not a formal valuation.</p>
      </form>

      <section className="panel result-panel">
        <div ref={tabsRef} className="tabs" role="tablist" aria-label="Estimate views" onKeyDown={moveTab}>{(["result", "history", "compare"] as const).map(item => <button key={item} id={`tab-${item}`} role="tab" aria-selected={tab === item} aria-controls={`panel-${item}`} tabIndex={tab === item ? 0 : -1} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "result" ? "Latest result" : <>{titleCase(item)} <b>{item === "history" ? history.length : selected.length}</b></>}</button>)}</div>
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
          {tab === "result" && (prediction === null ? <div className="result-empty"><div className="estimate-illustration" aria-hidden>⌂<i>↗</i></div><h3>Your estimate will appear here</h3><p>Complete the property details and select “Calculate property value”.</p><div className="result-placeholder" aria-hidden><span/><span/><span/></div></div> : <div className="result-content"><span className="eyebrow">ESTIMATED MARKET VALUE</span><h2>{money.format(prediction)}</h2><p>Based on the property details you provided</p><div className="range"><div><span>Likely range</span><strong>{money.format(prediction * .95)} – {money.format(prediction * 1.05)}</strong></div><div className="range-track"><i style={{ left: "48%" }}/></div></div><h3>Value breakdown</h3><div className="bar-chart" aria-label="Recent estimate comparison">{history.slice(0, 5).reverse().concat([{...values,id:"current",price:prediction,createdAt:"",name:"Current"}]).slice(-5).map((item, i, rows) => <div key={item.id} className="bar-item"><span style={{height: `${Math.max(18, item.price / Math.max(...rows.map(r => r.price)) * 100)}%`}}/><small>{item.id === "current" ? "Now" : `#${i + 1}`}</small></div>)}</div></div>)}
          {tab === "history" && <History history={history} selected={selected} setSelected={setSelected} setTab={setTab}/>} 
          {tab === "compare" && <Comparison items={compared}/>} 
        </div>
        <div className="model-foot"><span>Model accuracy</span><strong>{model ? `${(model.test_metrics.r2_score * 100).toFixed(1)}%` : "—"}</strong><span>Last trained</span><strong>{model ? new Date(model.trained_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</strong></div>
      </section>
    </div>
    {model && <section className="model-card"><div><span className="eyebrow">MODEL TRANSPARENCY</span><h2>How the estimate is calculated</h2><p>{model.model_type} trained on {model.n_samples} samples, independently tested on {model.n_test} properties.</p></div><div className="metric"><span>R² score</span><strong>{model.test_metrics.r2_score.toFixed(3)}</strong><small>Excellent fit</small></div><div className="metric"><span>Mean error</span><strong>{compactMoney.format(model.test_metrics.mae)}</strong><small>MAE</small></div><div className="metric"><span>Cross validation</span><strong>{(model.cross_validation.r2_mean * 100).toFixed(1)}%</strong><small>{model.cross_validation.cv_folds} folds</small></div></section>}
  </main>;
}

function History({ history, selected, setSelected, setTab }: { history: Estimate[]; selected: string[]; setSelected: (ids: string[]) => void; setTab: (tab: "compare") => void }) {
  if (!history.length) return <div className="result-empty compact"><h3>No estimates yet</h3><p>Your completed estimates will be saved here on this device.</p></div>;
  return <div className="history-list"><div className="history-help">Select up to 3 estimates to compare.</div>{history.map(item => <label key={item.id} className="history-row"><input type="checkbox" checked={selected.includes(item.id)} disabled={!selected.includes(item.id) && selected.length >= 3} onChange={e => setSelected(e.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id))}/><span><strong>{item.name}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></span><b>{money.format(item.price)}</b></label>)}<button disabled={selected.length < 2} className="button button-primary compare-button" onClick={() => setTab("compare")}>Compare {selected.length} properties</button></div>;
}

function Comparison({ items }: { items: Estimate[] }) {
  if (items.length < 2) return <div className="result-empty compact"><h3>Select properties to compare</h3><p>Choose two or three estimates from your history.</p></div>;
  const rows: (keyof PropertyInput)[] = ["square_footage", "bedrooms", "bathrooms", "year_built", "lot_size", "distance_to_city_center", "school_rating"];
  return <div className="comparison"><div className="comparison-head"><span>Feature</span>{items.map(i => <strong key={i.id}>{money.format(i.price)}</strong>)}</div>{rows.map(row => <div className="comparison-row" key={row}><span>{titleCase(row)}</span>{items.map(i => <b key={i.id}>{number.format(i[row])}</b>)}</div>)}</div>;
}
