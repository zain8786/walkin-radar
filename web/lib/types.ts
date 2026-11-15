export type EligibilityLabel = "eligible" | "possibly_eligible" | "not_eligible";

export type SavedState = "saved" | "applied" | "attended";

export interface Profile {
  id: string;
  name: string;
  highest_qualification: string;
  stream: string;
  graduation_year: number | null;
  percentage: number | null;
  cgpa: number | null;
  technical_skills: string[];
  languages: string[];
  communication_skills: string;
  internship_months: number;
  work_experience_months: number;
  is_fresher: boolean | null;
  preferred_locations: string[];
  willing_to_relocate: boolean;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  job_categories: string[];
  saved: Record<string, SavedState>;
}

export interface Listing {
  id: string;
  title: string;
  company: string;
  category: string;
  city: string;
  venue: string | null;
  interview_date: string;          // YYYY-MM-DD
  interview_start: string | null;  // HH:MM:SS
  interview_end: string | null;
  accepted_qualifications: string[];
  required_stream: string[];
  min_percentage: number | null;
  min_cgpa: number | null;
  grad_year_from: number | null;
  grad_year_to: number | null;
  max_experience_months: number | null;
  fresher_allowed: boolean | null;
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  source_notes: string | null;
  contact: string | null;
  source_name: string;
  source_url: string;
  status: string;
  last_verified_at: string | null;
}
