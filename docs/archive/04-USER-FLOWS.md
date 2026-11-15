# 4. User Flows and Wireframes

## 4.1 Job categories (used in filters and profiles)

IT and Software · Engineering (Civil, Electrical, Electronics, Mechanical, Other) · Technical Support · Customer Support · BPO and Voice · Operations · Sales and Business Development · Banking and Finance · Admin and Back Office · Other Graduate Roles

## 4.2 Flow: Joining (invite)

1. Admin creates an invitation in the Admin area and shares the link or code with a friend.
2. Friend opens the link, enters the code and email.
3. Friend sets a password or uses an email sign-in link.
4. Profile setup begins (4.3).
5. Dashboard opens with an eligibility prompt if the profile is incomplete.

Error cases: expired code, code already used, email does not match the invite (when restricted).

## 4.3 Flow: Profile setup and updates

Five short steps, each saved as the member goes:
1. **Basics:** name, city, preferred locations, willing to relocate, fresher status
2. **Education:** highest qualification, degree, stream, graduation year, percentage or CGPA
3. **Skills:** technical skills (tag input with suggestions), languages, communication level
4. **Experience:** internship months, work experience months, short description
5. **Preferences:** expected salary range, job categories, notification preferences

Members can return to any step from Profile. Changes trigger a recalculation of eligibility for all active listings.

## 4.4 Flow: Finding a drive

1. Member opens the dashboard.
2. They see summary cards: Matching, Today, Tomorrow, Upcoming.
3. They choose a filter: location, category, eligibility label, date range.
4. They open a listing to see details, eligibility reasons, and source link.
5. They save it, mark applied after they register, or mark attended.

## 4.5 Flow: Admin adds a listing

1. Admin opens Listings, then New listing.
2. Enters the required fields (title, company, date, time, venue, qualifications, source link).
3. Saves as `unverified`.
4. Checks the source link is live and the details match. Marks as `verified` and sets last-verified date.
5. Listing appears to members. If the drive is cancelled or passes, admin sets status to `cancelled` or `expired`.

Validation: interview date cannot be in the past at creation, source link must be a valid HTTPS URL, and a possible duplicate (same company and date) triggers a warning.

## 4.6 Flow: Expiry

Listings whose interview date has passed move to `expired` automatically the day after. They remain visible under "Past" only, and can be found through search.

## 4.7 Wireframes (text)

### Screen A: Dashboard (mobile first)

```
+----------------------------------------------+
| WalkIn Radar              [avatar]  [menu]  |
+----------------------------------------------+
| Good morning, Asha          Updated 08:10 IST |
|                                               |
| [ Matching 12 ] [ Today 2 ] [ Tomorrow 3 ]    |
| [ Upcoming 19 ] [ Saved 4 ]                   |
|                                               |
| Filters: [Location v] [Category v] [Fit v]    |
|                                               |
| ------------------------------------------    |
| Walk-in: Software Trainee        Eligible     |
| Acme Tech · Noida Sector 62                   |
| Sat 22 Nov · 10:00 AM · Verified 14 Nov       |
| [View]  [Save]                                |
| ------------------------------------------    |
| Walk-in: Customer Support        Verify       |
| Bright BPO · Gurugram Cyber City              |
| Mon 24 Nov · 11:00 AM · Verified 13 Nov       |
| [View]  [Save]                                |
+----------------------------------------------+
| Home   Listings   Saved   Profile             |
+----------------------------------------------+
```

Notes: the bottom navigation is for phones. On desktop it becomes a left sidebar. Summary cards are tappable filters. The label badge uses text as well as colour.

### Screen B: Listing detail

```
+----------------------------------------------+
| < Back                              [Share]   |
| Software Trainee                              |
| Acme Tech Pvt Ltd                             |
|                                               |
| [ Eligible ]  Why:                            |
|   + B.Tech accepted                           |
|   + Graduation year 2026 in range             |
|   ! Confirm CGPA >= 6.5 at the venue          |
|                                               |
| Interview                                     |
| Sat 22 Nov 2026 · 10:00 AM – 1:00 PM          |
| Venue: Sector 62, Noida (map link)            |
| Bring: resume, ID, photocopies                |
|                                               |
| Requirements                                  |
| Degrees: B.Tech, BCA, MCA                     |
| Skills: Python, SQL, Git                      |
| Fresher eligible: Yes (per source)            |
|                                               |
| Source: acme.example/careers  (opens in new tab) |
| Last verified: 14 Nov 2026 by Admin           |
|                                               |
| [ Save ]  [ Mark applied ]  [ Mark attended ] |
+----------------------------------------------+
```

### Screen C: Profile

```
+----------------------------------------------+
| My profile                       [Edit]       |
| Progress: ######----  4 of 5 sections          |
|                                               |
| Basics          Complete     [Edit]           |
| Education       Complete     [Edit]           |
| Skills          Complete     [Edit]           |
| Experience      Missing      [Add]            |
| Preferences     Complete     [Edit]           |
+----------------------------------------------+
```

### Screen D: Admin, listings queue

```
+----------------------------------------------+
| Admin > Listings                 [+ New]      |
| Filter: [Unverified v] [Past v] [Search]      |
|                                               |
| Unverified (3)                                |
| Acme Tech · Software Trainee · 22 Nov   [Review] |
| Bright BPO · Customer Support · 24 Nov  [Review] |
|                                               |
| Verified upcoming (19)                         |
| Expired (7)     Cancelled (1)                 |
+----------------------------------------------+
```

### Screen E: Admin, invitations

```
+----------------------------------------------+
| Admin > Invitations                          |
| [Create invitation]                           |
| Code      Email            Status    Expires  |
| K7F2-9QX  friend@mail.com  Unused    30 Nov   |
| P3M8-LT1  (any)            Used      -        |
+----------------------------------------------+
```

## 4.8 Edge cases

- **Two listings for the same drive from different sources:** the admin sees a duplicate warning and chooses to merge or reject.
- **Profile missing a field a listing requires:** the status becomes "Verify" rather than "Not eligible", with the missing field named.
- **Listing changes after a member saved it:** the saved item shows a "Changed" badge with the changed field.
- **No internet:** the dashboard shows the last loaded data with a timestamp.

## 4.9 Open questions

1. Should the bottom navigation include "Admin" for admins, or should admin be a separate entry point?
2. Do you want a "Share with a friend" button on listings that sends a text or WhatsApp message? (Proposal: yes, as a link only, no data sent to a third party.)
