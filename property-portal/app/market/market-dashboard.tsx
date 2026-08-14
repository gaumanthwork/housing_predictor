"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { compactMoney, money, number } from "../lib/format";
import { DEFAULT_PROPERTY, MarketProperty, MarketSummary } from "../lib/types";
import { useMarketApi } from "./use-market-api";

type Props = { initialProperties: MarketProperty[]; initialSummary: MarketSummary | null; initialError: string };
type SortKey = "id" | "segment" | "price" | "square_footage" | "school_rating";
const emptyEditor = { ...DEFAULT_PROPERTY, price: 275000 };

export function MarketDashboard({ initialProperties, initialSummary, initialError }: Props) {
  const [properties, setProperties] = useState(initialProperties);
  const [summary, setSummary] = useState(initialSummary);
  const [segment, setSegment] = useState("All segments");
  const [bedrooms, setBedrooms] = useState("All bedrooms");
  const [priceRange, setPriceRange] = useState("All prices");
  const [sort, setSort] = useState<SortKey>("price");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [scenario, setScenario] = useState(DEFAULT_PROPERTY);
  const [scenarioPrice, setScenarioPrice] = useState<number | null>(null);
  const [editor, setEditor] = useState(emptyEditor);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [notice, setNotice] = useState("");
  const [marketError, setMarketError] = useState(initialError);
  const [deleteTarget, setDeleteTarget] = useState<MarketProperty | null>(null);
  const { busy, apiError, setApiError, load, save, remove, whatIf } = useMarketApi();

  const rows = useMemo(() => properties.filter(row =>
    (segment === "All segments" || row.segment === segment) &&
    (bedrooms === "All bedrooms" || row.bedrooms === Number(bedrooms)) &&
    (priceRange === "All prices" ||
      (priceRange === "Under $200K" && row.price < 200000) ||
      (priceRange === "$200K – $300K" && row.price >= 200000 && row.price <= 300000) ||
      (priceRange === "Over $300K" && row.price > 300000)))
    .sort((a, b) => {
      const x = a[sort], y = b[sort];
      const result = typeof x === "string" ? x.localeCompare(String(y)) : Number(x) - Number(y);
      return direction === "asc" ? result : -result;
    }), [properties, segment, bedrooms, priceRange, sort, direction]);
  const segments = summary?.segments || [];
  const filteredStats = useMemo(() => {
    const prices = rows.map(row => row.price).sort((a, b) => a - b);
    const middle = Math.floor(prices.length / 2);
    const median = !prices.length ? 0 : prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2;
    const grouped = Object.values(rows.reduce<Record<string, MarketProperty[]>>((groups, row) => {
      (groups[row.segment] ||= []).push(row); return groups;
    }, {})).map(group => ({
      segment: group[0].segment,
      propertyCount: group.length,
      averagePrice: group.reduce((total, row) => total + row.price, 0) / group.length,
    })).sort((a, b) => b.averagePrice - a.averagePrice);
    return {
      count: rows.length,
      median,
      averagePrice: rows.length ? rows.reduce((total, row) => total + row.price, 0) / rows.length : 0,
      averagePricePerSquareFoot: rows.length ? rows.reduce((total, row) => total + row.price / row.square_footage, 0) / rows.length : 0,
      averageSchoolRating: rows.length ? rows.reduce((total, row) => total + row.school_rating, 0) / rows.length : 0,
      segments: grouped,
    };
  }, [rows]);

  function sortBy(key: SortKey) {
    if (sort === key) setDirection(direction === "asc" ? "desc" : "asc");
    else { setSort(key); setDirection("desc"); }
  }
  function csv() {
    const header = "ID,Segment,Price,Square feet,Bedrooms,Bathrooms,Year built,Lot size,Distance,School rating\n";
    const body = rows.map(row => [row.id, row.segment, row.price, row.square_footage, row.bedrooms, row.bathrooms, row.year_built, row.lot_size, row.distance_to_city_center, row.school_rating].join(",")).join("\n");
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    anchor.download = "haven-market-analysis.csv"; anchor.click(); URL.revokeObjectURL(anchor.href);
  }
  async function refresh(message = "") {
    try {
      const data = await load();
      setProperties(data.properties); setSummary(data.summary); setNotice(message); setMarketError("");
    } catch { setMarketError("Market data is temporarily unavailable."); }
  }
  async function runScenario() { try { setScenarioPrice((await whatIf(scenario)).predicted_price); } catch { setScenarioPrice(null); } }
  async function submitProperty(event: FormEvent) {
    event.preventDefault();
    try { await save(editor, editingId || undefined); await refresh(editingId ? "Property updated." : "Property created."); setShowEditor(false); setEditingId(null); setEditor(emptyEditor); } catch { return; }
  }
  function edit(row: MarketProperty) {
    const { id, segment: ignored, ...values } = row; void ignored;
    setEditingId(id); setEditor(values); setShowEditor(true); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function deleteProperty() {
    if (!deleteTarget) return;
    try { await remove(deleteTarget.id); setDeleteTarget(null); await refresh("Property deleted."); } catch { return; }
  }

  return <main className="page-shell market-page">
    <div className="page-title-row"><div><span className="eyebrow">PROPERTY MARKET ANALYSIS</span><h1>Market at a glance</h1><p>Explore current market trends, compare property segments and test valuation scenarios.</p></div><div className="export-actions"><button onClick={() => { setShowEditor(!showEditor); setEditingId(null); setEditor(emptyEditor); setApiError(""); }} className="button button-secondary">{showEditor ? "Close editor" : "+ Add property"}</button><button onClick={csv} className="button button-secondary">↓ CSV</button><button onClick={() => window.print()} className="button button-primary">↗ PDF</button></div></div>
    {(marketError || apiError) && <div className="api-error market-alert" role="alert"><span><strong>Market data is temporarily unavailable.</strong> Please try again in a moment.</span><button type="button" onClick={() => refresh()} disabled={busy}>{busy ? "Retrying…" : "Retry data"}</button></div>}
    {notice && <div className="success-message" role="status">{notice}</div>}
    {showEditor && <PropertyEditor values={editor} setValues={setEditor} editing={editingId !== null} busy={busy} onSubmit={submitProperty}/>} 
    <div className="filter-bar"><label><span>Price range</span><select value={priceRange} onChange={event => setPriceRange(event.target.value)}><option>All prices</option><option>Under $200K</option><option>$200K – $300K</option><option>Over $300K</option></select></label><label><span>Property segment</span><select value={segment} onChange={event => setSegment(event.target.value)}><option>All segments</option>{segments.map(item => <option key={item.segment}>{item.segment}</option>)}</select></label><label><span>Bedrooms</span><select value={bedrooms} onChange={event => setBedrooms(event.target.value)}><option>All bedrooms</option>{[1,2,3,4,5,6].map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
    <section className="kpi-grid"><div className="kpi"><span>Median property value</span><strong>{compactMoney.format(filteredStats.median)}</strong><small>From {filteredStats.count} matching properties</small></div><div className="kpi"><span>Average property value</span><strong>{compactMoney.format(filteredStats.averagePrice)}</strong><small>{money.format(filteredStats.averagePricePerSquareFoot)} per sq ft</small></div><div className="kpi"><span>Average school score</span><strong>{filteredStats.count ? filteredStats.averageSchoolRating.toFixed(1) : "—"}<em>{filteredStats.count ? "/10" : ""}</em></strong><small>For the current selection</small></div><div className="kpi highlight"><span>Highest-value segment</span><strong>{filteredStats.segments[0]?.segment || "—"}</strong><small>{filteredStats.segments[0] ? `${compactMoney.format(filteredStats.segments[0].averagePrice)} average value` : "No matching properties"}</small></div></section>
    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-title"><div><h2>Average value by segment</h2><p>Updated for the current filters</p></div><span className="legend"><i/> Average value</span></div><div className="horizontal-chart">{filteredStats.segments.map(item => <div className="chart-row segment-chart" key={item.segment}><span>{item.segment}</span><div><i style={{ width: `${item.averagePrice / Math.max(...filteredStats.segments.map(group => group.averagePrice), 1) * 100}%` }}/><b>{compactMoney.format(item.averagePrice)}</b></div><em>{item.propertyCount}</em></div>)}{!filteredStats.segments.length && <p className="table-empty">No market data matches these filters.</p>}</div></section>
      <section className="panel what-if"><span className="eyebrow">LIVE VALUATION</span><h2>What-if analysis</h2><p>Adjust the property details to explore how different features may affect its estimated value.</p><label>Living area <strong>{number.format(scenario.square_footage)} sq ft</strong><input type="range" min="500" max="5000" step="50" value={scenario.square_footage} onChange={event => setScenario({...scenario, square_footage: +event.target.value})}/></label><label>Bedrooms <strong>{scenario.bedrooms}</strong><input type="range" min="1" max="8" value={scenario.bedrooms} onChange={event => setScenario({...scenario, bedrooms: +event.target.value})}/></label><label>School rating <strong>{scenario.school_rating}/10</strong><input type="range" min="1" max="10" step=".1" value={scenario.school_rating} onChange={event => setScenario({...scenario, school_rating: +event.target.value})}/></label><button onClick={runScenario} disabled={busy} className="button button-primary">{busy ? "Calculating…" : "Calculate value"}</button>{scenarioPrice !== null && <div className="scenario-result"><span>Estimated value</span><strong>{money.format(scenarioPrice)}</strong><small>{scenarioPrice >= filteredStats.median ? `${compactMoney.format(scenarioPrice - filteredStats.median)} above current median` : `${compactMoney.format(filteredStats.median - scenarioPrice)} below current median`}</small></div>}</section>
    </div>
    <section className="panel table-panel"><div className="panel-title"><div><h2>Property records</h2><p>{rows.length} of {properties.length} properties shown</p></div></div><div className="table-scroll"><table><caption className="sr-only">Property market records</caption><thead><tr><SortableHeader label="Segment" column="segment" active={sort} direction={direction} onSort={sortBy}/><SortableHeader label="Price" column="price" active={sort} direction={direction} onSort={sortBy}/><SortableHeader label="Living area" column="square_footage" active={sort} direction={direction} onSort={sortBy}/><th scope="col">Rooms</th><SortableHeader label="School" column="school_rating" active={sort} direction={direction} onSort={sortBy}/><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className="segment-pill">{row.segment}</span></td><td>{money.format(row.price)}</td><td>{number.format(row.square_footage)} sq ft</td><td>{row.bedrooms} bd · {row.bathrooms} ba</td><td>{row.school_rating}/10</td><td><div className="row-actions"><button aria-label={`Edit property ${row.id}`} onClick={() => edit(row)}>Edit</button><button aria-label={`Delete property ${row.id}`} className="danger" onClick={() => setDeleteTarget(row)}>Delete</button></div></td></tr>)}</tbody></table>{!rows.length && <p className="table-empty">No properties match these filters.</p>}</div></section>
    <p className="data-note">Market insights are based on the properties currently available in the portal.</p>
    {deleteTarget && <DeletePropertyModal property={deleteTarget} busy={busy} onCancel={() => setDeleteTarget(null)} onDelete={deleteProperty}/>} 
  </main>;
}

function SortableHeader({ label, column, active, direction, onSort }: { label: string; column: SortKey; active: SortKey; direction: "asc" | "desc"; onSort: (key: SortKey) => void }) {
  const ariaSort = active === column ? (direction === "asc" ? "ascending" : "descending") : "none";
  return <th scope="col" aria-sort={ariaSort}><button onClick={() => onSort(column)}>{label} <span aria-hidden>{active === column ? direction === "asc" ? "↑" : "↓" : "↕"}</span></button></th>;
}

const propertyFields: { key: keyof typeof emptyEditor; label: string; min: number; max: number; step?: number }[] = [
  { key: "square_footage", label: "Living area", min: 1, max: 20000 }, { key: "bedrooms", label: "Bedrooms", min: 0, max: 20 },
  { key: "bathrooms", label: "Bathrooms", min: 0, max: 20, step: .5 }, { key: "year_built", label: "Year built", min: 1800, max: 2100 },
  { key: "lot_size", label: "Lot size", min: 1, max: 1000000 }, { key: "distance_to_city_center", label: "Distance to centre", min: 0, max: 500, step: .1 },
  { key: "school_rating", label: "School rating", min: 0, max: 10, step: .1 }, { key: "price", label: "Market price", min: 1, max: 100000000 },
];

function PropertyEditor({ values, setValues, editing, busy, onSubmit }: { values: typeof emptyEditor; setValues: (value: typeof emptyEditor) => void; editing: boolean; busy: boolean; onSubmit: (event: FormEvent) => void }) {
  return <form className="panel property-editor" onSubmit={onSubmit}><div className="panel-title"><div><h2>{editing ? "Edit property" : "Add property"}</h2><p>Enter the property details below. All fields are required.</p></div></div><div className="editor-grid">{propertyFields.map(field => <label key={field.key}><span>{field.label}</span><input required type="number" min={field.min} max={field.max} step={field.step || 1} value={values[field.key]} onChange={event => setValues({...values, [field.key]: event.target.valueAsNumber})}/></label>)}<button className="button button-primary" disabled={busy}>{busy ? "Saving…" : editing ? "Update property" : "Create property"}</button></div></form>;
}

function DeletePropertyModal({ property, busy, onCancel, onDelete }: { property: MarketProperty; busy: boolean; onCancel: () => void; onDelete: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(busy);
  const cancelActionRef = useRef(onCancel);
  useEffect(() => { busyRef.current = busy; cancelActionRef.current = onCancel; }, [busy, onCancel]);
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    cancelRef.current?.focus();
    function handleKeys(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) cancelActionRef.current();
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled)") || []);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKeys);
    return () => { document.removeEventListener("keydown", handleKeys); returnFocusRef.current?.focus(); };
  }, []);

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section ref={dialogRef} className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
      <div className="modal-icon" aria-hidden>!</div>
      <h2 id="delete-title">Are you sure you want to delete this property?</h2>
      <p id="delete-description">The {property.bedrooms}-bedroom {property.segment.toLowerCase()} valued at {money.format(property.price)} will be permanently removed.</p>
      <div className="modal-actions"><button ref={cancelRef} className="button button-secondary" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button-danger" onClick={onDelete} disabled={busy}>{busy ? "Deleting…" : "Delete"}</button></div>
    </section>
  </div>;
}
