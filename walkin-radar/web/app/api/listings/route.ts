import { NextResponse } from "next/server";
import { todayIST } from "@/lib/dates";

export const dynamic = "force-dynamic";

/**
 * Returns upcoming listings from Supabase. Uses the publishable key on the server only.
 * The database rule also limits anonymous reads to upcoming listings.
 */
export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Server is not configured yet." }, { status: 500 });
  }

  const select = [
    "id", "title", "company", "category", "city", "venue", "interview_date", "interview_start",
    "interview_end", "accepted_qualifications", "required_stream", "min_percentage", "min_cgpa",
    "grad_year_from", "grad_year_to", "max_experience_months", "fresher_allowed", "required_skills",
    "salary_min", "salary_max", "source_notes", "contact", "source_name", "source_url", "status",
    "last_verified_at",
  ].join(",");

  const query =
    `${url.replace(/\/$/, "")}/rest/v1/listings` +
    `?select=${select}&status=eq.upcoming&interview_date=gte.${todayIST()}` +
    `&order=interview_date.asc,interview_start.asc&limit=500`;

  try {
    const res = await fetch(query, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Could not load listings." }, { status: 502 });
    }
    const listings = await res.json();
    return NextResponse.json({ listings, fetchedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Could not load listings." }, { status: 502 });
  }
}
