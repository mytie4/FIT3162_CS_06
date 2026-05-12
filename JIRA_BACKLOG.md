# Outdoor-trip backlog — Jira import

This is the readable companion to [jira-import.csv](./jira-import.csv). It expands
the five new feature areas added to the canvas into 5 Epics + 41 tasks. Sized
1–5 story points to match the existing board style.

## How to import into Jira

1. **Project settings → System → External System Import → CSV**
2. Upload `jira-import.csv`
3. Map columns (Jira usually auto-detects):
   - `Issue Type` → Issue Type
   - `Summary` → Summary
   - `Epic Name` → Epic Name *(only used on Epic rows)*
   - `Epic Link` → Epic Link *(only used on Task rows; references Epic Name)*
   - `Description` → Description
   - `Priority` → Priority
   - `Story Points` → Story Points *(custom field — confirm field ID maps)*
   - `Labels` → Labels *(semicolon-separated)*
4. Run the import. Epics are created first, then Tasks are auto-linked via Epic Link.

Tip: dry-run on a sandbox project first if your Story Points field has a different ID than the default `customfield_10016`.

---

## Epics & tasks at a glance

### EPIC · Outdoor Safety Module *(High)*
Pre-publish safety checklist + hazards + weather + emergency contacts.

| # | Task | SP | Pri |
|---|------|----|-----|
| 1 | Design `Event_Safety_Checks` + `Event_Hazards` DB schema | 2 | High |
| 2 | Create migration for safety + hazards tables | 1 | High |
| 3 | Build Safety REST API | 5 | High |
| 4 | Build Safety tab UI (pre-publish checklist) | 5 | High |
| 5 | Build hazards chip editor | 2 | Medium |
| 6 | Integrate BOM weather lookup | 3 | Medium |
| 7 | Build Emergency Contacts editor | 2 | Medium |
| 8 | Block Publish until all safety checks pass | 3 | High |
| 9 | Tests for Safety module | 3 | Medium |

### EPIC · Attendees & Paperwork *(High)*
RSVP + medical declaration + liability waiver.

| # | Task | SP | Pri |
|---|------|----|-----|
| 1 | Design `Event_Attendees` + `Medical_Declarations` + `Liability_Waivers` schema | 2 | High |
| 2 | Migration for attendees + paperwork tables | 1 | High |
| 3 | Build RSVP API | 3 | High |
| 4 | Build Medical Declaration form + API | 5 | High |
| 5 | Build Liability Waiver flow | 3 | High |
| 6 | Build Attendees tab UI | 5 | High |
| 7 | Implement Nudge-missing-paperwork email | 3 | Medium |
| 8 | Restrict medical/waiver visibility (RBAC) | 2 | High |
| 9 | Tests for Attendees module | 3 | Medium |

### EPIC · Transport & Check-in *(High)*
Vehicle roster with seat claims + departure check-in.

| # | Task | SP | Pri |
|---|------|----|-----|
| 1 | Design `Event_Vehicles` + `Vehicle_Seats` schema | 2 | High |
| 2 | Migration for transport tables | 1 | High |
| 3 | Build Vehicles CRUD API | 3 | High |
| 4 | Build seat-claim API | 3 | High |
| 5 | Build Transport tab UI | 5 | High |
| 6 | Build Departure Check-in API | 2 | Medium |
| 7 | Build Check-in list UI | 3 | Medium |
| 8 | Tests for Transport module | 3 | Medium |

### EPIC · Vendor Contracts *(Medium)*
Track vendor agreements per event (bus hire, venue, equipment, catering).

| # | Task | SP | Pri |
|---|------|----|-----|
| 1 | Design `Event_Contracts` schema | 1 | Medium |
| 2 | Migration for contracts table | 1 | Medium |
| 3 | Build Contracts CRUD API | 3 | Medium |
| 4 | Build Contracts tab UI | 5 | Medium |
| 5 | File attachment for contracts | 3 | Medium |
| 6 | Status-change notifications | 2 | Low |
| 7 | Tests for Contracts module | 2 | Medium |

### EPIC · Club Meetings & Scheduling *(Medium)*
Committee meetings list + when-can-we-meet poll widget at club level.

| # | Task | SP | Pri |
|---|------|----|-----|
| 1 | Design `Club_Meetings` + `Meeting_RSVPs` schema | 2 | Medium |
| 2 | Design `Meeting_Poll` + `Poll_Options` + `Poll_Votes` schema | 2 | Medium |
| 3 | Migrations for meetings + poll | 1 | Medium |
| 4 | Build Meetings CRUD API | 3 | Medium |
| 5 | Build Meeting RSVP API | 2 | Medium |
| 6 | Build Poll API | 3 | Medium |
| 7 | Build Meetings tab UI | 3 | Medium |
| 8 | Build when-can-we-meet poll widget | 5 | Medium |
| 9 | Email reminder for meetings | 2 | Low |
| 10 | Tests for Meetings module | 3 | Medium |

---

## Totals

| Epic | Tasks | Story Points |
|------|------:|------:|
| Outdoor Safety Module | 9 | 26 |
| Attendees & Paperwork | 9 | 27 |
| Transport & Check-in | 8 | 22 |
| Vendor Contracts | 7 | 17 |
| Club Meetings & Scheduling | 10 | 26 |
| **Total** | **43** | **118** |

At ~10–15 points per dev-week, that's ~8–12 weeks of work for one developer,
or ~3–4 weeks for a team of three.

## Suggested sprint slicing

- **Sprint 1 (foundation)** — schemas + migrations + RSVP API. Unblocks everything.
- **Sprint 2 (safety)** — Outdoor Safety Module end-to-end + Publish-gate.
- **Sprint 3 (people)** — Attendees & Paperwork end-to-end.
- **Sprint 4 (logistics)** — Transport & Check-in.
- **Sprint 5 (polish)** — Contracts + Meetings + tests + email integration.
