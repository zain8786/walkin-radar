import type { Profile } from "./types";

/** Browser-only storage. Nothing here is sent to the server. */
export const PROFILES_KEY = "walkin-radar.profiles";
export const ACTIVE_KEY = "walkin-radar.activeProfile";

export function newProfile(): Profile {
  return {
    id: crypto.randomUUID(),
    name: "",
    highest_qualification: "",
    stream: "",
    graduation_year: null,
    percentage: null,
    cgpa: null,
    technical_skills: [],
    languages: [],
    communication_skills: "",
    internship_months: 0,
    work_experience_months: 0,
    is_fresher: true,
    preferred_locations: [],
    willing_to_relocate: false,
    expected_salary_min: null,
    expected_salary_max: null,
    job_categories: [],
    saved: {},
  };
}

export function readProfiles(): Profile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  } catch {
    return [];
  }
}

export function writeProfiles(profiles: Profile[]): void {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function readActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function writeActiveId(id: string | null): void {
  if (id) window.localStorage.setItem(ACTIVE_KEY, id);
  else window.localStorage.removeItem(ACTIVE_KEY);
}

/** Backup file: a versioned copy of every profile on this browser. */
export function exportBackup(profiles: Profile[]): string {
  return JSON.stringify({ app: "walkin-radar", version: 1, profiles }, null, 2);
}

/** Restore merges by id: profiles in the file replace matching ids and add new ones. */
export function importBackup(text: string, existing: Profile[]): Profile[] {
  const data = JSON.parse(text);
  if (data?.app !== "walkin-radar" || !Array.isArray(data.profiles)) {
    throw new Error("This file is not a WalkIn Radar backup.");
  }
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const p of data.profiles as Profile[]) byId.set(p.id, p);
  return [...byId.values()];
}
