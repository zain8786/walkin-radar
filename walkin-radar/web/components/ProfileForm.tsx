"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

const QUALIFICATIONS = ["B.Tech", "B.E.", "BCA", "MCA", "B.Sc", "M.Sc", "B.Com", "BBA", "MBA", "Diploma", "Other"];
const LOCATIONS = ["Delhi", "Noida", "Gurugram", "Greater Noida", "Other NCR"];
const CATEGORIES = [
  "IT and Software", "Engineering", "Technical Support", "Customer Support", "BPO",
  "Operations", "Sales", "Other Graduate",
];

interface Props {
  initial: Profile;
  onSave: (profile: Profile) => void;
  onCancel?: () => void;
}

function toNumber(value: string): number | null {
  const n = Number(value);
  return value.trim() === "" || Number.isNaN(n) ? null : n;
}

function toList(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function ProfileForm({ initial, onSave, onCancel }: Props) {
  const [p, setP] = useState<Profile>(initial);
  const [skills, setSkills] = useState(initial.technical_skills.join(", "));
  const [languages, setLanguages] = useState(initial.languages.join(", "));

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "preferred_locations" | "job_categories", value: string) =>
    setP((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));

  const input = "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";
  const label = "block text-sm font-medium text-slate-700";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...p,
      name: p.name.trim() || "Me",
      technical_skills: toList(skills).map((s) => s.toLowerCase()),
      languages: toList(languages),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">About you</legend>
        <label className={label}>Profile name
          <input className={input} value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Asha" />
        </label>
        <label className={label}>Fresher?
          <select className={input} value={p.is_fresher === null ? "" : String(p.is_fresher)}
            onChange={(e) => set("is_fresher", e.target.value === "" ? null : e.target.value === "true")}>
            <option value="">Choose</option>
            <option value="true">Yes, fresher</option>
            <option value="false">No, I have work experience</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">Education</legend>
        <label className={label}>Highest qualification
          <select className={input} value={p.highest_qualification} onChange={(e) => set("highest_qualification", e.target.value)}>
            <option value="">Choose</option>
            {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </label>
        <label className={label}>Stream
          <input className={input} value={p.stream} onChange={(e) => set("stream", e.target.value)} placeholder="e.g. Computer Science" />
        </label>
        <label className={label}>Graduation year
          <input className={input} inputMode="numeric" value={p.graduation_year ?? ""}
            onChange={(e) => set("graduation_year", toNumber(e.target.value))} placeholder="2026" />
        </label>
        <label className={label}>Percentage
          <input className={input} inputMode="decimal" value={p.percentage ?? ""}
            onChange={(e) => set("percentage", toNumber(e.target.value))} placeholder="e.g. 72" />
        </label>
        <label className={label}>CGPA
          <input className={input} inputMode="decimal" value={p.cgpa ?? ""}
            onChange={(e) => set("cgpa", toNumber(e.target.value))} placeholder="e.g. 7.8" />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">Skills and experience</legend>
        <label className={label}>Technical skills (comma separated)
          <input className={input} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="python, sql, excel" />
        </label>
        <label className={label}>Languages (comma separated)
          <input className={input} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="English, Hindi" />
        </label>
        <label className={label}>Communication
          <input className={input} value={p.communication_skills} onChange={(e) => set("communication_skills", e.target.value)} placeholder="e.g. good in English and Hindi" />
        </label>
        <label className={label}>Internship months (total)
          <input className={input} inputMode="numeric" value={p.internship_months}
            onChange={(e) => set("internship_months", toNumber(e.target.value) ?? 0)} />
        </label>
        <label className={label}>Work experience months (total)
          <input className={input} inputMode="numeric" value={p.work_experience_months}
            onChange={(e) => set("work_experience_months", toNumber(e.target.value) ?? 0)} />
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-base font-semibold">Preferred locations</legend>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <label key={loc} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={p.preferred_locations.includes(loc)} onChange={() => toggle("preferred_locations", loc)} />
              {loc}
            </label>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.willing_to_relocate} onChange={(e) => set("willing_to_relocate", e.target.checked)} />
          Willing to relocate within NCR for a drive
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-base font-semibold">Job categories you want</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={p.job_categories.includes(c)} onChange={() => toggle("job_categories", c)} />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-base font-semibold">Expected salary (yearly, INR, optional)</legend>
        <label className={label}>Minimum
          <input className={input} inputMode="numeric" value={p.expected_salary_min ?? ""}
            onChange={(e) => set("expected_salary_min", toNumber(e.target.value))} />
        </label>
        <label className={label}>Maximum
          <input className={input} inputMode="numeric" value={p.expected_salary_max ?? ""}
            onChange={(e) => set("expected_salary_max", toNumber(e.target.value))} />
        </label>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Save profile
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
