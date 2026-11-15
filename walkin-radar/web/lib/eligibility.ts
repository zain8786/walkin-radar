import type { EligibilityLabel, Listing, Profile } from "./types";
import { norm } from "./normalise";

/**
 * Pure eligibility logic. Runs in the browser; no data leaves the device.
 *
 * Each rule returns met, unknown or failed.
 *  - any failed        -> not_eligible
 *  - no failed, any unknown -> possibly_eligible (verify before travelling)
 *  - all met           -> eligible
 * A listing that does not state a requirement is "unknown", never "failed".
 */

export type Outcome = "met" | "unknown" | "failed";

export interface Check {
  rule: string;
  outcome: Outcome;
  message: string;
}

export interface Result {
  label: EligibilityLabel;
  checks: Check[];
  missingSkills: string[];
}

export function evaluate(listing: Listing, profile: Profile): Result {
  const checks: Check[] = [];
  const add = (rule: string, outcome: Outcome, message: string) =>
    checks.push({ rule, outcome, message });

  // Qualification
  if (listing.accepted_qualifications.length === 0) {
    add("qualification", "unknown", "Source does not state accepted qualifications");
  } else {
    const have = norm(profile.highest_qualification);
    if (!have) add("qualification", "unknown", "Add your highest qualification");
    else if (listing.accepted_qualifications.map(norm).includes(have))
      add("qualification", "met", `${profile.highest_qualification} is accepted`);
    else
      add("qualification", "failed", `Requires ${listing.accepted_qualifications.join(", ")}`);
  }

  // Stream
  if (listing.required_stream.length > 0) {
    const have = norm(profile.stream);
    const wanted = listing.required_stream.map(norm);
    if (!have) add("stream", "unknown", "Add your stream");
    else if (wanted.some((w) => have.includes(w) || w.includes(have)))
      add("stream", "met", `${profile.stream} matches the stream`);
    else add("stream", "failed", `Requires ${listing.required_stream.join(" or ")}`);
  }

  // Percentage
  if (listing.min_percentage !== null) {
    if (profile.percentage !== null) {
      if (profile.percentage >= listing.min_percentage)
        add("percentage", "met", `Minimum ${listing.min_percentage}% met`);
      else add("percentage", "failed", `Minimum ${listing.min_percentage}% required`);
    } else if (profile.cgpa !== null) {
      add("percentage", "unknown", "Only CGPA entered; enter your percentage to check");
    } else add("percentage", "unknown", "Add your percentage");
  }

  // CGPA
  if (listing.min_cgpa !== null) {
    if (profile.cgpa !== null) {
      if (profile.cgpa >= listing.min_cgpa) add("cgpa", "met", `Minimum CGPA ${listing.min_cgpa} met`);
      else add("cgpa", "failed", `Minimum CGPA ${listing.min_cgpa} required`);
    } else if (profile.percentage !== null) {
      add("cgpa", "unknown", "Only percentage entered; enter your CGPA to check");
    } else add("cgpa", "unknown", "Add your CGPA");
  }

  // Graduation year
  if (listing.grad_year_from !== null || listing.grad_year_to !== null) {
    if (profile.graduation_year === null) {
      add("graduation_year", "unknown", "Add your graduation year");
    } else {
      const y = profile.graduation_year;
      const tooEarly = listing.grad_year_from !== null && y < listing.grad_year_from;
      const tooLate = listing.grad_year_to !== null && y > listing.grad_year_to;
      if (tooEarly || tooLate) add("graduation_year", "failed", "Graduation year is outside the range");
      else add("graduation_year", "met", "Graduation year in range");
    }
  }

  // Experience (work experience only; internships are shown but not counted here)
  if (listing.max_experience_months !== null) {
    if (profile.work_experience_months <= listing.max_experience_months)
      add("experience", "met", "Experience within the limit");
    else add("experience", "failed", "More experience than this drive allows");
  }

  // Fresher status
  if (listing.fresher_allowed === false) {
    if (profile.is_fresher === null) add("fresher", "unknown", "Confirm whether you are a fresher");
    else if (profile.is_fresher) add("fresher", "failed", "This drive is not open to freshers");
    else add("fresher", "met", "Eligible for this drive");
  }

  // Location
  if (profile.preferred_locations.length === 0) {
    add("location", "unknown", "Choose your preferred locations");
  } else if (profile.preferred_locations.includes(listing.city)) {
    add("location", "met", `${listing.city} is in your preferred locations`);
  } else if (profile.willing_to_relocate) {
    add("location", "unknown", `${listing.city} is outside your preferred locations; relocation needed`);
  } else {
    add("location", "failed", `${listing.city} is outside your preferred locations`);
  }

  const failed = checks.some((c) => c.outcome === "failed");
  const unknown = checks.some((c) => c.outcome === "unknown");
  const label: EligibilityLabel = failed ? "not_eligible" : unknown ? "possibly_eligible" : "eligible";

  const have = new Set(profile.technical_skills.map(norm));
  const missingSkills = listing.required_skills.filter((s) => !have.has(norm(s)));

  return { label, checks, missingSkills };
}

export const LABEL_TEXT: Record<EligibilityLabel, string> = {
  eligible: "Eligible",
  possibly_eligible: "Possibly eligible",
  not_eligible: "Not eligible",
};
