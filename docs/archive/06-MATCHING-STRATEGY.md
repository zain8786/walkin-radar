# 6. Matching and Eligibility Strategy

## 6.1 Principles

1. **Rules first, AI second.** Eligibility is decided by explicit, testable rules. AI is optional and only helps read messy source text into fields. It never decides eligibility on its own.
2. **Three labels, never a guarantee.** Every result is one of `eligible`, `possibly_eligible` (verify), or `not_eligible`. A score is shown only for sorting, and the UI says it is not a promise of selection.
3. **Show the reasons.** Every label lists what was met, what failed, and what is missing.
4. **Missing data is uncertainty, not rejection.** If the listing or profile lacks a value, the result is `possibly_eligible`, with the missing item named.

## 6.2 Rules

Each rule compares one listing requirement with one profile value.

| # | Rule | Outcome if failed | Outcome if data missing |
|---|---|---|---|
| R1 | Qualification: profile's highest qualification or degree is in `required_qualification` | Not eligible | Possibly |
| R2 | Stream: if `required_stream` set, profile stream is in it | Not eligible | Possibly |
| R3 | Percentage: profile percentage >= `min_percentage` | Not eligible | Possibly |
| R4 | CGPA: profile CGPA >= `min_cgpa` (converted if only the other scale is known) | Not eligible | Possibly |
| R5 | Graduation year within `graduation_year_from` to `graduation_year_to` | Not eligible | Possibly |
| R6 | Experience: profile total experience within `experience_min_months` to `experience_max_months` | Not eligible | Possibly |
| R7 | Fresher: if `fresher_eligible` is false and profile is fresher | Not eligible | Possibly |
| R8 | Location: listing city is in profile's preferred locations, or profile is willing to relocate | Possibly (relocation needed) | Possibly |
| R9 | Skills: share of `required_skills` that the profile has, reported as reasons, not a hard fail | Never fails. Missing skills are listed | n/a |
| R10 | Eligibility notes: text from source is shown, never parsed to decide | Shown as a warning | n/a |

Rule outcomes combine as follows:
- Any rule returns Not eligible: result is `not_eligible`.
- No Not eligible, and any Possibly: result is `possibly_eligible`.
- All rules met: result is `eligible`.

Skill coverage (R9) feeds the sort score only.

## 6.3 Data normalisation

Before comparison:
- Degree names map to a canonical list (e.g. "B Tech", "B.Tech", "BTech" become "B.Tech").
- Skills are lowercased and aliases are mapped (e.g. "js" to "javascript").
- Percentage and CGPA are converted when only one is known. The conversion factor is stored in config and can be changed by the admin.
- Dates are stored in UTC and compared in IST.

## 6.4 Score

Score is 0 to 100, used only to sort results within a label group:
- 50 points: all hard rules met
- 30 points: skill coverage, scaled
- 20 points: location match (preferred) or relocation willing

Score is recomputed when the engine version changes.

## 6.5 Where AI fits (later)

AI is used only where text is messy, and only to extract fields, never to decide:
- Reading a source announcement and suggesting values for the listing fields. Each value is shown to the admin with the sentence it came from.
- Summarising eligibility notes in plain language.
- Flagging possible duplicates by comparing text.

AI output is stored with a `confidence` note and an `extracted_from` quote. Nothing it produces becomes `verified` without a human.

Accuracy review: the admin area records how often a verified listing's fields were edited after AI extraction, so accuracy can be measured.

## 6.6 Engine design

- Pure TypeScript functions: `evaluate(listing, profile, config) -> result`.
- No database or network calls inside the engine. Inputs in, output out.
- Unit tests for every rule, including missing-data cases, before the engine is used on the dashboard.
- `engine_version` stored with each result. Changing a rule increments the version and triggers recomputation.

## 6.7 Examples

Listing: B.Tech, B.Sc (CS) accepted; min 60%; graduation 2025 to 2026; fresher eligible; location Noida.
Profile A: B.Tech CS, 72%, graduated 2026, fresher, lives in Noida. Result: Eligible, score high.
Profile B: B.Tech, 55%, graduated 2026. Result: Not eligible (R3), reason shown.
Profile C: B.Tech, percentage missing, CGPA 7.8 on a 10-point scale. Result: Possibly eligible (R3 cannot be checked from CGPA alone unless the conversion is configured). The member is asked to add the percentage.

## 6.8 Open questions

1. What CGPA-to-percentage conversion should the app use by default? (Proposal: admin-configurable, default 9.5 times CGPA, to be confirmed against your university's scheme.)
2. Should members see "not eligible" listings at all, or hide them by default? (Proposal: hide by default, with a toggle.)
