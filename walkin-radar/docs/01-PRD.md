# 1. Product Requirements (revised)

## 1.1 Purpose

Help a small group of friends find genuine walk-in interviews in Delhi NCR that they are likely to be eligible for, and see the original source for each one.

## 1.2 Users

Me and a few friends, all fresher or entry-level graduates. Everyone uses the same public URL. There is no separate admin account: the owner maintains the shared listings through the same tooling the discovery job uses (see 02-ARCHITECTURE.md).

## 1.3 In scope (MVP)

1. One public website URL, mobile-first, works on any phone browser.
2. Profile form in the browser: education (qualification, degree, stream, graduation year, percentage or CGPA), technical skills, languages, communication level, internship and work experience (months), preferred locations, willingness to relocate, expected salary range, job categories.
3. Profiles saved in localStorage. Several profiles can be kept on the same browser, so a friend sharing a phone can switch between people.
4. Shared listings from a cloud database, shown to everyone.
5. Eligibility per listing for the selected profile: Eligible, Possibly Eligible, or Not Eligible, with the reasons.
6. Filters: location (Delhi, Noida, Gurugram, Greater Noida, other NCR), category (IT and software, Engineering, BPO, Customer Support, Technical Support, Operations, Sales, Other graduate), eligibility label, date (today, tomorrow, upcoming).
7. Every listing shows: original source link, interview date and time, venue, date first found, last verified timestamp, status.
8. Automated discovery in the cloud, on a schedule, independent of the owner's laptop.
9. Backup and restore of profiles as a file, because localStorage is lost if browser data is cleared.

## 1.4 Out of scope

- User registration, login, invitations, admin roles, permissions, multi-tenant structure
- Accounts or syncing profiles across devices
- Notifications (can be added later if the group asks)
- Applying on anyone's behalf
- AI-generated listing content
- Public job-portal features

## 1.5 Eligibility rules (summary)

Hard conditions compared against the profile: qualification accepted, stream (if set), minimum percentage or CGPA, graduation year range, experience range, fresher-only flag, location and relocation.

- Eligible: all conditions can be checked and met.
- Possibly Eligible: a condition cannot be checked because a value is missing on the profile or the listing, or the drive needs relocation or verification.
- Not Eligible: at least one checkable condition fails.

A match is never a promise of selection. The UI says so once on the listing page.

## 1.6 Discovery rules

- Only sources whose terms and robots.txt allow automated access are used. The list lives in a config file with a note of when each was checked.
- Prefer official career pages and public feeds. Where a source blocks automated access, it is linked manually or left out.
- A listing is added only if it is a walk-in with a date and a venue. Ordinary job openings are ignored.
- No listing is invented or completed from guesses. Fields the source does not state stay empty and show as unknown.

## 1.7 Non-functional requirements

- Free to run on free tiers.
- Works on a 360px-wide phone screen.
- Times displayed in IST.
- Profile data never leaves the browser, except the request for shared listings.
- Secrets (database key, discovery job key) only on the server or in the scheduler's secret store, never in the browser code.
- Built for a small group. No scaling work beyond that.

## 1.8 Success

- Each friend can enter a profile in under 10 minutes.
- Every listing on screen has a working source link and a verification time.
- At least one real walk-in is found and correctly classified for each profile.

## 1.9 Open questions

1. Which company career pages should discovery start with?
2. Should "Not Eligible" listings be hidden by default? (Proposal: yes, with a toggle.)
3. Do you want the backup file to be the only way to move profiles between phones, or is that enough?
