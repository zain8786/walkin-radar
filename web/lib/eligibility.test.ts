import { describe, expect, it } from "vitest";
import { evaluate } from "./eligibility";
import type { Listing, Profile } from "./types";

const listing: Listing = {
  id: "1", title: "Software Trainee", company: "Acme", category: "IT and Software",
  city: "Noida", venue: null, interview_date: "2026-11-22", interview_start: null,
  interview_end: null, accepted_qualifications: ["B.Tech", "MCA"], required_stream: [],
  min_percentage: 60, min_cgpa: null, grad_year_from: 2025, grad_year_to: 2026,
  max_experience_months: 6, fresher_allowed: true, required_skills: ["Python", "SQL"],
  salary_min: null, salary_max: null, source_notes: null, contact: null,
  source_name: "Acme careers", source_url: "https://acme.example/walkin",
  status: "upcoming", last_verified_at: null,
};

const profile: Profile = {
  id: "p", name: "Asha", highest_qualification: "B.Tech", stream: "Computer Science",
  graduation_year: 2026, percentage: 72, cgpa: null, technical_skills: ["python"],
  languages: [], communication_skills: "", internship_months: 3, work_experience_months: 0,
  is_fresher: true, preferred_locations: ["Noida"], willing_to_relocate: false,
  expected_salary_min: null, expected_salary_max: null, job_categories: [], saved: {},
};

describe("evaluate", () => {
  it("is eligible when every stated requirement is met", () => {
    const r = evaluate(listing, profile);
    expect(r.label).toBe("eligible");
    expect(r.missingSkills).toEqual(["SQL"]);
  });

  it("is not eligible when a checkable requirement fails", () => {
    const r = evaluate(listing, { ...profile, percentage: 55 });
    expect(r.label).toBe("not_eligible");
  });

  it("is possibly eligible when the profile is missing a value", () => {
    const r = evaluate(listing, { ...profile, percentage: null });
    expect(r.label).toBe("possibly_eligible");
  });

  it("is not eligible for an out-of-area city without relocation", () => {
    const r = evaluate({ ...listing, city: "Gurugram" }, profile);
    expect(r.label).toBe("not_eligible");
  });

  it("is possibly eligible for an out-of-area city when willing to relocate", () => {
    const r = evaluate({ ...listing, city: "Gurugram" }, { ...profile, willing_to_relocate: true });
    expect(r.label).toBe("possibly_eligible");
  });

  it("treats a requirement the source does not state as unknown, not failed", () => {
    const r = evaluate({ ...listing, accepted_qualifications: [], min_percentage: null,
      grad_year_from: null, grad_year_to: null }, profile);
    expect(r.label).toBe("possibly_eligible");
    expect(r.checks.find((c) => c.rule === "qualification")?.outcome).toBe("unknown");
  });

  it("excludes freshers when the drive is not open to them", () => {
    const r = evaluate({ ...listing, fresher_allowed: false }, profile);
    expect(r.label).toBe("not_eligible");
  });

  it("matches qualification regardless of punctuation or spacing", () => {
    const r = evaluate({ ...listing, accepted_qualifications: ["btech"] }, profile);
    expect(r.checks.find((c) => c.rule === "qualification")?.outcome).toBe("met");
  });
});
