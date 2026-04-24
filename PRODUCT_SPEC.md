# Eventure — Product Specification

> **Project:** FIT3162 CS-06
> **Codename:** Eventure
> **Type:** Full-stack web application (React + Vite frontend, Express + TypeScript backend, PostgreSQL)
> **Status:** Active development (MVP in progress)

---

## 1. Purpose

**Eventure is a club and event management platform built for university student clubs and societies.**

University clubs today juggle several disconnected tools — Google Drive for documents, Discord / Instagram for announcements, Trello or Notion for tasks, Google Forms for RSVPs, and a spreadsheet to track members. Handovers between presidents lose institutional knowledge, new members struggle to plug in, and event logistics (health checks, hazards, budgets) live in ad-hoc documents.

Eventure consolidates these workflows into a single platform that provides:

- A **home** for every club: profile, branding, member roster, external links.
- A **lifecycle tool** for events: plan → publish → run → complete, with attendance, logistics, and budget tracking.
- A **task board** tied to events, with assignees, due dates, priorities, and sub-tasks.
- A **membership system** with roles (president, vice president, member) and a simple 6-digit join code.
- A **notification feed** so users never miss invites, task assignments, or reminders.

### Primary users

| Persona | Goals |
|---------|-------|
| **President** | Create & configure the club, run events, delegate tasks, manage the roster, hand over leadership. |
| **Vice President** | Assist the president: invite members, create events/tasks, moderate the club. |
| **Member** | Discover & join clubs, RSVP to events, complete assigned tasks, stay informed. |
| **Prospective member** | Browse public clubs and events, join via invite code. |

### Success metrics (qualitative)

- A new member can find, join, and contribute to a club in under 2 minutes.
- A president can create an event end-to-end (event + tasks + logistics) in one sitting.
- Zero "lost knowledge" on committee handover — everything lives in the club page.

---

## 2. Product Pillars

1. **Club-centric** — every piece of content (events, tasks, members, contributions) belongs to a club.
2. **Role-based** — president > vice president > member. The UI and API enforce what each role can do.
3. **Event lifecycle** — events move through `draft → published → in_progress/ongoing → completed` (or `cancelled`).
4. **Task-driven execution** — tasks are tied to events, assignable to members, with priorities and deadlines.
5. **Zero-friction onboarding** — one 6-digit code to join a club; email + password to sign up.

---

## 3. Feature Overview

| Area | Feature | Status |
|------|---------|--------|
| Auth | Register, login, JWT session, "remember me" | Implemented (register/login); "remember me" UI only |
| Clubs | Create, list, detail, update, delete | Implemented |
| Clubs | Join via 6-digit code, leave club | Backend implemented; frontend partial (`LeaveClubModal` does not call API — see bug report) |
| Clubs | Branding (color, logo, banner, social links) | DB + partial UI |
| Clubs | Roles & role-changes (president ↔ VP ↔ member) | Backend implemented; frontend UI stub only |
| Clubs | Member roster with search | Implemented (read); remove/role UI is state-only |
| Clubs | Invite members by email | UI stub; API not wired |
| Events | Create, list, filter (upcoming / ongoing / completed / cancelled) | Partial (mock data on frontend) |
| Events | RSVP (going / interested / not_going) | DB schema only |
| Events | Logistics (health check, hazards, emergency contacts, notes) | DB schema only |
| Events | Visibility (public / members-only) | DB schema only |
| Tasks | Kanban board, assignees, priorities, tags, sub-tasks | DB schema only |
| Contributions | Track per-member contributions | DB schema only |
| Notifications | Invite / task / reminder feed | DB schema only |
| Settings | Email reminder preference | DB column only |
| Dashboard | Personal landing page | Placeholder page |

See `BACKEND_BUG_REPORT.md` and `FRONTEND_BUG_REPORT.md` for outstanding issues per surface.

---

## 4. How It Should Work — User Flows

### 4.1 Sign up & log in

1. New user visits `/register`, enters **name, email, password** (≥ 8 chars).
2. Backend hashes the password with bcrypt, stores the user, issues a JWT.
3. Frontend stores the token and hydrates `AuthContext`; user is sent to `/dashboard`.
4. Returning users log in at `/login` with email + password; a JWT is returned and stored.
5. All authenticated pages are wrapped by `ProtectedRoute`; unauthenticated traffic is redirected to `/login`.

**Planned hardening:** move tokens out of `localStorage` to `httpOnly` cookies, add rate limiting on `/register` & `/login`, support password reset and "remember me".

### 4.2 Create a club

1. A logged-in user opens `/clubs` and clicks **Create Club**.
2. They enter **name** (required), description, type, shared drive link.
3. Backend:
   - Creates the `Clubs` row with an auto-generated 6-digit `code` (the join code) and a deterministic color.
   - Inserts the creator into `Club_Members` with role `president`.
4. User is redirected to `/clubs/:clubId` as the club's president.

### 4.3 Discover & join a club

1. User visits `/clubs` — the page lists every club with member count and ongoing event count.
2. They click **Join Club** and enter the **6-digit code** shared by an existing member.
3. Backend validates the code, checks the user isn't already a member, and inserts a `Club_Members` row with role `member`.
4. Frontend refreshes the clubs list so the new club appears immediately.

### 4.4 View & manage a club

- **Overview tab:** banner, logo, description, external links (Discord, Instagram, website), member count, ongoing events count, join code (officers only).
- **Members tab:** searchable roster; officers can promote / demote / remove members.
- **Events tab:** upcoming & past events for the club.
- **Settings tab (president only):** rename club, update branding, rotate join code, delete club (cascades to events, tasks, members).

Role matrix:

| Action | Member | Vice President | President |
|--------|:------:|:--------------:|:---------:|
| View club & events | ✅ | ✅ | ✅ |
| RSVP to events | ✅ | ✅ | ✅ |
| Leave club | ✅ | ✅ | ❌ (must transfer first) |
| Create event / task | ❌ | ✅ | ✅ |
| Invite members | ❌ | ✅ | ✅ |
| Change member role | ❌ | ❌ | ✅ |
| Remove member | ❌ | ✅ (non-officers) | ✅ |
| Edit club profile | ❌ | ✅ (limited) | ✅ |
| Delete club / transfer presidency | ❌ | ❌ | ✅ |

The DB enforces a **single president per club** via a partial unique index.

### 4.5 Run an event

1. An officer clicks **Create Event** on the club page.
2. They fill in **title, type, description, date, end date, location, budget, visibility** (`public` / `members_only`).
3. Event starts in status `draft`. Officer can:
   - Add **tasks** (title, assignees, due date, priority, tag, optional sub-tasks).
   - Add **logistics** (health check link, hazards list, emergency contacts, notes).
4. Officer clicks **Publish** → status becomes `published`; event appears on members' dashboards; `invite` notifications fan out.
5. Members **RSVP** with `going`, `interested`, or `not_going`. Going members can get email reminders if they opted in.
6. On the event day, officer moves status to `in_progress` / `ongoing`.
7. After the event, officer moves status to `completed`; attendance and budget actuals are recorded.
8. Events can be `cancelled` at any time; attendees are notified.

### 4.6 Task workflow

- Tasks live under an event (`Tasks.event_id`).
- Each task has: title, description, due date, priority (low/medium/high), tag, status (todo/in_progress/done/blocked), optional parent task.
- `Task_Assignees` is a many-to-many link to `Users`.
- Kanban board groups tasks by status; assignees see "My Tasks" in notifications / dashboard.
- Tasks can be `is_public` so non-assignees in the club can see progress.

### 4.7 Notifications

Three types:
- `invite` — "You were invited to **Club X**" / "New event **Y** in your club".
- `task` — "You were assigned **Task Z**, due Friday".
- `reminder` — "Event **Y** starts in 1 hour".

Stored in `Notifications` (user_id, type, title, message, sender_name, club_name, event_name, read, created_at). The frontend shows an unread badge and a `/notifications` feed; marking read updates the `read` flag.

### 4.8 Leaving / transferring leadership

- Any non-president member can **leave** a club (`POST /api/clubs/leave`).
- The **president cannot leave** until they promote someone else to president.
- Promoting another member to `president` automatically demotes the old president to `vice_president` (enforced by `demoteOtherPresidents` in a transaction).

---

## 5. Data Model (high level)

```
Users ──┬── Club_Members ──── Clubs
        │                       ├── Events ──┬── Event_Logistics
        │                       │            ├── Event_Attendees (RSVP)
        │                       │            └── Tasks ── Task_Assignees
        │                       └── Club_Members_Contributions
        └── Notifications
```

Key tables (see `back-end/migrations/` for canonical DDL):

- **Users** `(user_id PK, name, email UNIQUE LOWER, password_hash, profile_pic_url, wants_email_reminders)`
- **Clubs** `(club_id PK, name, description, shared_drive_link, club_color, type, banner_url, logo_url, discord_link, instagram_link, website_link, code (join code), created_at)`
- **Club_Members** `(club_id + user_id PK, role ∈ {president, vice_president, member}, joined_at)`
- **Events** `(event_id PK, club_id FK, title, type, date, end_date, location, budget, status ∈ {draft, published, in_progress, ongoing, completed, cancelled}, visibility ∈ {public, members_only}, created_by FK, created_at)`
- **Event_Logistics** `(event_id PK/FK, health_check_link, hazards_list, emergency_contacts, notes)`
- **Event_Attendees** `(event_id + user_id PK, rsvp_status ∈ {going, interested, not_going}, registered_at)`
- **Tasks** `(task_id PK, event_id FK, parent_task_id FK, title, description, due_date, priority, status, tag, is_public)`
- **Task_Assignees** `(task_id + user_id PK)`
- **Notifications** `(notification_id PK, user_id FK, type ∈ {invite, task, reminder}, title, message, sender_name, club_name, event_name, read, created_at)`

Foreign keys cascade on parent delete (see `1776960000001_fix-fk-cascades.sql`), so deleting a club wipes its events, tasks, and memberships cleanly.

---

## 6. System Architecture

```
┌────────────────────┐    HTTPS     ┌────────────────────┐    TCP     ┌──────────────┐
│  React + Vite SPA  │ ───────────▶ │  Express + TS API  │ ─────────▶ │  PostgreSQL  │
│  (front-end/)      │  JSON/JWT    │  (back-end/)       │   (pg)     │   + pgAdmin  │
└────────────────────┘              └────────────────────┘            └──────────────┘
  localhost:5173                       localhost:5000                   localhost:5432
```

### Frontend (`front-end/`)
- **React 19 + React Router 7 + Vite 7 + TypeScript 5.9**.
- Structure: `pages/` (one per route), `components/` (`clubs/`, `events/`, `common/`), `context/` (`AuthContext`), `api/` (typed fetch wrappers), `hooks/`, `types/`.
- Auth state is held in `AuthContext`; tokens currently persist in `localStorage` (migration to cookies planned).
- Protected routes are gated by `ProtectedRoute`; shared chrome lives in `AppLayout` (sidebar + header).

### Backend (`back-end/`)
- **Express + TypeScript**, layered as **routes → controllers → services → repositories**.
- `pg` with a connection pool in `src/db/index.ts`.
- JWT auth middleware in `src/middlewares/auth.middleware.ts`.
- OpenAPI/Swagger spec in `src/swagger.ts`, served at `/api-docs`.
- Schema changes are versioned via `node-pg-migrate` under `back-end/migrations/`.

### Infrastructure
- `docker-compose.yml` at the repo root runs **PostgreSQL 16** and **pgAdmin** locally.
- A `.devcontainer/` config lets contributors open the repo in a fully configured container.
- Environment config via `.env` files (see `README.md` §"Environment Variables").

### API surface (current)

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `POST` | `/api/auth/register` | — | Create account, return JWT |
| `POST` | `/api/auth/login` | — | Issue JWT |
| `GET`  | `/api/clubs` | — | List all clubs with stats |
| `POST` | `/api/clubs` | ✅ | Create club (creator = president) |
| `GET`  | `/api/clubs/:clubId` | — | Club detail (includes join_code — to be auth-gated) |
| `PATCH`| `/api/clubs/:clubId` | ✅ | Update club (officer) |
| `DELETE`| `/api/clubs/:clubId` | ✅ | Delete club (president) |
| `GET`  | `/api/clubs/:clubId/members` | — | Member list (to be auth-gated) |
| `PATCH`| `/api/clubs/:clubId/members/:userId/role` | ✅ | Change role (president) |
| `DELETE`| `/api/clubs/:clubId/members/:userId` | ✅ | Remove member (officer) |
| `POST` | `/api/clubs/join` | ✅ | Join by 6-digit code |
| `POST` | `/api/clubs/leave` | ✅ | Leave the given club |
| `GET`  | `/health` | — | Liveness probe |

Planned endpoints: events CRUD, RSVP, tasks CRUD, notifications CRUD, file upload for avatars/banners, password reset, email invites.

---

## 7. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Security** | Passwords hashed with bcrypt (≥ 10 rounds). JWTs signed with `JWT_SECRET`. No secrets in the client bundle. HTTPS in production. CORS restricted to the known client origin. Rate limiting on auth endpoints. |
| **Privacy** | Member emails are not exposed to the public; join codes are visible only to club officers. Logs redact params in production. |
| **Performance** | Club list & detail pages should respond < 300 ms P95 on a warm DB. Events and tasks paginated when > 50 items. Avoid N+1 queries; use the existing aggregated SQL in `getAllClubs` / `getClubById` as the template. |
| **Reliability** | Graceful shutdown on `SIGTERM` (close server, drain pool). Readiness probe returns 503 when the DB is unreachable. Transactions around multi-table writes (club create, role change, club delete). |
| **Accessibility** | All interactive elements keyboard-reachable and labelled. Icon-only buttons have `aria-label`. Colour contrast meets WCAG AA. |
| **Testability** | Integration tests against a disposable test DB for auth, club lifecycle, and role rules. Component tests for forms (register, create club, join club). |
| **Observability** | Structured request logs; per-query duration; error tracking hook (e.g. Sentry) in production. |

---

## 8. Out of Scope (for now)

- Payments / paid club subscriptions.
- Native mobile apps (the SPA should be responsive instead).
- Real-time chat (Discord / Slack handle this).
- Calendar integration (Google Calendar export is a nice-to-have later).
- Multi-tenant isolation beyond per-club data separation.

---

## 9. Roadmap (near-term)

1. **Close the frontend/backend gap** for leave-club, role changes, and member removal (see `FRONTEND_BUG_REPORT.md` §Critical, §High).
2. **Events module v1** — implement API + wire the `EventsPage` to real data, replacing mock events.
3. **Tasks module v1** — API + Kanban board tied to an event.
4. **Notifications v1** — API + dropdown in the header + `/notifications` page.
5. **Security hardening** — move tokens to cookies, allowlist CORS, rate-limit auth, redact logs (see `BACKEND_BUG_REPORT.md` §Critical, §High).
6. **Profile & settings** — avatar upload, email reminder toggle, password change.
7. **Automated tests & CI** — Vitest + Jest + GitHub Actions.

---

*Last updated: 2026-04-17. Maintained alongside `BACKEND_BUG_REPORT.md` and `FRONTEND_BUG_REPORT.md`.*
