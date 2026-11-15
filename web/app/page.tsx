"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { useProfiles } from "@/lib/useProfiles";
import { evaluate, type Result } from "@/lib/eligibility";
import { todayIST, tomorrowIST } from "@/lib/dates";
import type { Listing, SavedState } from "@/lib/types";

type DateFilter = "all" | "today" | "tomorrow";
type LabelFilter = "all" | Result["label"];

const CATEGORY_OPTIONS = [
  "IT and Software", "Engineering", "Technical Support", "Customer Support", "BPO",
  "Operations", "Sales", "Other Graduate",
];
const CITY_OPTIONS = ["Delhi", "Noida", "Gurugram", "Greater Noida", "Other NCR"];

export default function DrivesPage() {
  const { ready, active, setSaved } = useProfiles();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [label, setLabel] = useState<LabelFilter>("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [showNotEligible, setShowNotEligible] = useState(false);

  useEffect(() => {
    fetch("/api/listings", { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Could not load listings.");
        setListings(body.listings as Listing[]);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const today = todayIST();
  const tomorrow = tomorrowIST();

  const rows = useMemo(() => {
    if (!listings) return [];
    return listings
      .filter((l) => city === "all" || l.city === city)
      .filter((l) => category === "all" || l.category === category)
      .filter((l) => date === "all" || (date === "today" ? l.interview_date === today : l.interview_date === tomorrow))
      .map((l) => ({ listing: l, result: active ? evaluate(l, active) : null }))
      .filter(({ result }) => {
        if (!result) return true;
        if (label !== "all") return result.label === label;
        return showNotEligible || result.label !== "not_eligible";
      });
  }, [listings, city, category, date, label, showNotEligible, active, today, tomorrow]);

  const counts = useMemo(() => {
    if (!listings || !active) return null;
    const c = { eligible: 0, possibly_eligible: 0, not_eligible: 0 };
    for (const l of listings) c[evaluate(l, active).label] += 1;
    return c;
  }, [listings, active]);

  const select = "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-lg font-semibold">Walk-in drives</h1>
        {!ready ? null : active ? (
          <p className="mt-1 text-sm text-slate-600">
            Showing eligibility for <strong>{active.name}</strong>.{" "}
            <Link href="/profiles" className="text-indigo-700 underline">Switch profile</Link>
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">
            <Link href="/profiles" className="text-indigo-700 underline">Create or choose a profile</Link> to see whether you are eligible for each drive.
          </p>
        )}
        {counts && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <button onClick={() => setLabel("eligible")} className="rounded-lg bg-emerald-50 p-2 text-emerald-800 hover:bg-emerald-100">
              <span className="block text-xl font-semibold">{counts.eligible}</span>Eligible
            </button>
            <button onClick={() => setLabel("possibly_eligible")} className="rounded-lg bg-amber-50 p-2 text-amber-800 hover:bg-amber-100">
              <span className="block text-xl font-semibold">{counts.possibly_eligible}</span>Possibly
            </button>
            <button onClick={() => setLabel("not_eligible")} className="rounded-lg bg-rose-50 p-2 text-rose-800 hover:bg-rose-100">
              <span className="block text-xl font-semibold">{counts.not_eligible}</span>Not eligible
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-2">
        <select aria-label="Date" className={select} value={date} onChange={(e) => setDate(e.target.value as DateFilter)}>
          <option value="all">Any date</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
        </select>
        <select aria-label="City" className={select} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All NCR cities</option>
          {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Category" className={select} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select aria-label="Eligibility" className={select} value={label} onChange={(e) => setLabel(e.target.value as LabelFilter)}>
          <option value="all">All labels</option>
          <option value="eligible">Eligible</option>
          <option value="possibly_eligible">Possibly eligible</option>
          <option value="not_eligible">Not eligible</option>
        </select>
        {active && label === "all" && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showNotEligible} onChange={(e) => setShowNotEligible(e.target.checked)} />
            Show not eligible
          </label>
        )}
      </section>

      {error && <p className="rounded-md bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {!listings && !error && <p className="text-sm text-slate-500">Loading drives…</p>}
      {listings && listings.length === 0 && (
        <p className="rounded-md bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
          No upcoming walk-ins are listed right now. Discovery runs twice a day; check back later.
        </p>
      )}
      {listings && listings.length > 0 && rows.length === 0 && (
        <p className="text-sm text-slate-600">No drives match these filters.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ listing }) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            profile={active}
            onSetSaved={(state: SavedState | null) => active && setSaved(active.id, listing.id, state)}
          />
        ))}
      </div>
    </div>
  );
}
