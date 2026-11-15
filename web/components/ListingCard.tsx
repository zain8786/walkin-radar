"use client";

import { useState } from "react";
import type { Listing, Profile, SavedState } from "@/lib/types";
import { evaluate, LABEL_TEXT, type Result } from "@/lib/eligibility";
import { formatDate, formatTime, formatTimestamp } from "@/lib/dates";

const LABEL_STYLE: Record<Result["label"], string> = {
  eligible: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  possibly_eligible: "bg-amber-100 text-amber-800 ring-amber-200",
  not_eligible: "bg-rose-100 text-rose-800 ring-rose-200",
};

const STATE_LABEL: Record<SavedState, string> = {
  saved: "Saved",
  applied: "Applied",
  attended: "Attended",
};

interface Props {
  listing: Listing;
  profile: Profile | null;
  onSetSaved: (state: SavedState | null) => void;
}

export default function ListingCard({ listing, profile, onSetSaved }: Props) {
  const [open, setOpen] = useState(false);
  const result = profile ? evaluate(listing, profile) : null;
  const savedState = profile?.saved[listing.id] ?? null;
  const time = [formatTime(listing.interview_start), formatTime(listing.interview_end)].filter(Boolean).join(" to ");

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{listing.title}</h2>
          <p className="text-sm text-slate-600">{listing.company} · {listing.city}</p>
        </div>
        {result ? (
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${LABEL_STYLE[result.label]}`}>
            {LABEL_TEXT[result.label]}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Create a profile to check</span>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-slate-500">Interview</dt>
        <dd>{formatDate(listing.interview_date)}{time ? `, ${time}` : ""}</dd>
        <dt className="text-slate-500">Category</dt>
        <dd>{listing.category}</dd>
        <dt className="text-slate-500">Last verified</dt>
        <dd>{formatTimestamp(listing.last_verified_at)}</dd>
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <button onClick={() => setOpen(!open)} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
          {open ? "Hide details" : "Details"}
        </button>
        <a href={listing.source_url} target="_blank" rel="noopener noreferrer"
           className="rounded-md border border-indigo-200 px-3 py-1.5 text-indigo-700 hover:bg-indigo-50">
          Original source
        </a>
        {profile && (
          <select
            aria-label="Track this drive"
            value={savedState ?? ""}
            onChange={(e) => onSetSaved((e.target.value || null) as SavedState | null)}
            className="rounded-md border border-slate-300 px-2 py-1.5"
          >
            <option value="">Not tracked</option>
            {(Object.keys(STATE_LABEL) as SavedState[]).map((s) => (
              <option key={s} value={s}>{STATE_LABEL[s]}</option>
            ))}
          </select>
        )}
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 text-sm">
          {listing.venue && <p><span className="text-slate-500">Venue: </span>{listing.venue}</p>}
          {listing.contact && <p><span className="text-slate-500">Contact: </span>{listing.contact}</p>}
          {listing.accepted_qualifications.length > 0 && (
            <p><span className="text-slate-500">Accepted qualifications: </span>{listing.accepted_qualifications.join(", ")}</p>
          )}
          {listing.required_skills.length > 0 && (
            <p><span className="text-slate-500">Skills asked: </span>{listing.required_skills.join(", ")}</p>
          )}
          {listing.source_notes && <p><span className="text-slate-500">Source notes: </span>{listing.source_notes}</p>}
          <p className="text-slate-500">Source: {listing.source_name}</p>
          {result && (
            <div>
              <p className="font-medium">Why this label</p>
              <ul className="mt-1 space-y-1">
                {result.checks.map((c, i) => (
                  <li key={i} className={c.outcome === "failed" ? "text-rose-700" : c.outcome === "unknown" ? "text-amber-700" : "text-emerald-700"}>
                    {c.outcome === "met" ? "✓" : c.outcome === "failed" ? "✗" : "?"} {c.message}
                  </li>
                ))}
              </ul>
              {result.missingSkills.length > 0 && (
                <p className="mt-2 text-slate-600">Skills to build or mention: {result.missingSkills.join(", ")}</p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
