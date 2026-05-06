# Frontend Bug Audit — Eventure (`front-end`)

**Scope:** `front-end/`
**Stack:** React 19, React Router 7, Vite 7, TypeScript 5.9 (no test runner configured).

---

## Retest summary — May 2026

| Severity  | Original | Fixed | Partially fixed | Still present | New |
|-----------|---------:|------:|----------------:|--------------:|----:|
| Critical  |        3 |     1 |               0 |             2 |   0 |
| High      |        8 |     0 |               0 |             8 |   0 |
| Medium    |       18 |     3 |               2 |            13 |   1 |
| Low       |       14 |     0 |               0 |            14 |   0 |
| **Total** |   **43** | **4** |           **2** |        **37** | **1** |

**Status legend:** ✅ Fixed · ⚠️ Partially fixed · ❌ Still present · 🆕 New finding

---

## Summary — counts by severity (original)

| Severity  | Count |
|-----------|------:|
| Critical  |     3 |
| High      |     8 |
| Medium    |    18 |
| Low       |    14 |
| **Total** | **43**|

---

## Critical

### 1. ✅ FIXED — `LeaveClubModal` never calls the leave-club API
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/LeaveClubModal.tsx` L34–36; usage in `front-end/src/pages/ClubDetailsPage.tsx` L400–407 |
| **Category** | Logic / API integration |
| **Description** | Confirming "Leave Club" only runs `onLeave`, which closes the modal and navigates to `/clubs`. The backend exposes `POST /api/clubs/leave` with `{ clubID }`. The user remains a member server-side. |
| **Fix** | Call the leave endpoint with `clubId` and auth token; handle errors; then navigate or refresh club state. |
| **Retest** | `ClubDetailsPage.tsx` L543–554 now awaits `leaveClub(club.club_id, token)` and only navigates on success; errors are surfaced via `setError`. `clubs.api.ts` L69–86 implements `leaveClub` against `POST /api/clubs/leave`. Resolved. |

### 2. ❌ STILL PRESENT — Event card navigates to a non-existent route
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/pages/ClubDetailsPage.tsx` L336–338 (was L248–260); also `front-end/src/pages/EventsPage.tsx` L182 |
| **Category** | Routing / Dead navigation |
| **Description** | `onClick` uses ``navigate(`/clubs/${clubId}/events/${event.event_id}`)`` but `App.tsx` defines no `/clubs/:clubId/events/:eventId` route. Users hit the catch-all and get redirected to `/dashboard`. |
| **Fix** | Add the route and page, or remove navigation until the feature exists. |
| **Retest** | `App.tsx` L17–57 defines only `/login`, `/register`, `/dashboard`, `/clubs`, `/clubs/:clubId`, `/events`. No `/clubs/:clubId/events/:eventId` and no `/events/:eventId`. Both `ClubDetailsPage` and `EventsPage` still navigate to those non-existent paths, so any event-card click sends the user to `/dashboard`. |

### 3. ❌ STILL PRESENT — `createClub` assumes `club` is always present in response
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/clubs.api.ts` L60–66 |
| **Category** | API Contract / Runtime error |
| **Description** | `return json.club!` will throw or return `undefined` if the server shape changes or `club` is missing. |
| **Fix** | Validate `json.club` and throw a clear error if absent. |
| **Retest** | Code is unchanged: `return json.club!` is still used. |

---

## High

### 4. ❌ STILL PRESENT — Access tokens stored in `localStorage`
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/context/AuthContext.tsx` L25–44; `front-end/src/components/clubs/JoinClubModal.tsx` L29 |
| **Category** | Security / XSS exposure |
| **Description** | Any XSS in the app can exfiltrate the bearer token. |
| **Fix** | Prefer `httpOnly` secure cookies set by the backend (with CSRF strategy), or short-lived tokens + refresh pattern; use `useAuth().token` instead of `localStorage` in components. |
| **Retest** | `AuthContext.tsx` still calls `localStorage.setItem('token', …)` / `getItem('token')`. `JoinClubModal.tsx` L29 still reads `localStorage.getItem('token')` directly instead of `useAuth().token`. |

### 5. ❌ STILL PRESENT — Member role changes and removals only update React state
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/pages/ClubDetailsPage.tsx` L129–139; `MembersTable` callbacks |
| **Category** | Logic / API integration |
| **Description** | Handlers mutate local `members` only. TODOs note missing `PUT`/`DELETE` APIs. UI shows success while the server is unchanged; refresh loses changes. |
| **Fix** | Wire to `PATCH .../members/:userId/role` and `DELETE .../members/:userId` when available; roll back on failure. |
| **Retest** | `handleRoleChange` and `handleRemoveMember` still mutate local `members` only; both retain `// TODO: call …` comments. |

### 6. ❌ STILL PRESENT — `InviteMembersModal` does not send invites
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/InviteMembersModal.tsx` L56–60; `front-end/src/pages/ClubDetailsPage.tsx` L534–539 |
| **Category** | Logic / API integration |
| **Description** | `onSendInvites` is optional and not passed from `ClubDetailsPage`. "Send Invites" clears selection and closes the modal with no network call. |
| **Fix** | Implement API + pass `onSendInvites`, or disable/hide the button until implemented. |
| **Retest** | Modal `handleSend` still calls `onSendInvites?.(…)` (optional). `ClubDetailsPage` instantiates `<InviteMembersModal>` without passing `onSendInvites`, so clicks remain silent no-ops. |

### 7. ❌ STILL PRESENT — Joining a club does not refresh the clubs list
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/JoinClubModal.tsx` (success path); `front-end/src/pages/ClubsPage.tsx` L226–228 |
| **Category** | State synchronization |
| **Description** | On success the modal closes; `ClubsPage` state is unchanged until a full reload. |
| **Fix** | Callback to refetch `getAllClubs()` or update local state from the join response. |
| **Retest** | `JoinClubModal` still accepts only `{ onClose }`. `ClubsPage` instantiates it with only `onClose`; no `onJoined` / refetch path exists. |

### 8. ❌ STILL PRESENT — `await res.json()` without guarding non-JSON or empty bodies
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/auth.api.ts` L18, L33; `front-end/src/api/clubs.api.ts` L30, L60, L79, L91, L103, L122, L180; `front-end/src/api/events.api.ts` L6 (`parseJson` helper); `front-end/src/components/clubs/JoinClubModal.tsx` L34 |
| **Category** | Error Handling / API |
| **Description** | Proxies, 502 HTML pages, or empty responses cause `JSON.parse` failures and obscure errors. |
| **Fix** | Check `Content-Type`, use `res.text()` + safe parse, or try/catch with a fallback message. |
| **Retest** | All call sites still call `res.json()` directly with no `Content-Type` check or fallback. |

### 9. ❌ STILL PRESENT — `EventCard` uses a clickable `div` with an inner control
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/events/EventCard.tsx` L49–61 |
| **Category** | Accessibility / UX |
| **Description** | The card relies on `onClick` on a `div` (not keyboard-focusable by default). |
| **Fix** | Use a `button` or `role="button"` + `tabIndex={0}` + keyboard handler, or make the whole card a link; manage focus for the menu. |
| **Retest** | Still `<div className="event-card" onClick={onClick}>` with no `role`, `tabIndex`, or keyboard handler. |

### 10. ❌ STILL PRESENT — Public member list exposes emails
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/clubs.api.ts` `fetchClubMembers` L100–110; `front-end/src/components/clubs/MembersTable.tsx` L60–62 |
| **Category** | Privacy / Security |
| **Description** | The backend route is unauthenticated and returns emails; the frontend consumes them freely. |
| **Fix** | Secure the backend (see backend report #3) and strip emails for non-officers on the client. |
| **Retest** | `fetchClubMembers` still calls `GET /api/clubs/:id/members` without an `Authorization` header; emails are rendered in `MembersTable` for every viewer. |

### 11. ❌ STILL PRESENT — No React error boundary
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/main.tsx`, `front-end/src/App.tsx` |
| **Category** | Reliability |
| **Description** | Runtime errors crash the tree; no fallback UI. |
| **Fix** | Add a top-level `ErrorBoundary` and per-route boundaries. |
| **Retest** | Repo-wide search for `ErrorBoundary` / `componentDidCatch` returns no matches. |

---

## Medium

### 12. ❌ STILL PRESENT — `ClubDetailsPage` `useEffect` depends on `token`
- **File / lines:** `front-end/src/pages/ClubDetailsPage.tsx` L79–123.
- **Description:** Refetch on token change may be redundant.
- **Fix:** Document or narrow the dependency list.
- **Retest:** Effect deps remain `[clubId, token]`.

### 13. ❌ STILL PRESENT — Register: `registerRequest` then `login`
- **File / lines:** `front-end/src/pages/RegisterPage.tsx` L26–32.
- **Description:** Double round-trip; confusing errors if login fails after register.
- **Fix:** Have the register endpoint return a session token, or handle partial success gracefully.
- **Retest:** `handleSubmit` still calls `registerRequest(...)` then `await login({ email, password })`.

### 14. ❌ STILL PRESENT — `CreateClubModal` allows empty club name
- **File / lines:** `front-end/src/components/clubs/CreateClubModal.tsx` L33–63.
- **Fix:** Validate required fields client-side before POST.
- **Retest:** `handleCreate` validates `token` and `type` only; `name` is sent unchecked. An empty name still triggers a POST.

### 15. ❌ STILL PRESENT — `JoinClubModal` does not validate 6-digit code
- **File / lines:** `front-end/src/components/clubs/JoinClubModal.tsx` L20–43.
- **Fix:** Align with backend `/^\d{6}$/`.
- **Retest:** `handleJoin` posts `{ joinCode }` with no client-side regex check.

### 16. ❌ STILL PRESENT — `JoinClubModal` success triggers `setSuccess`, `onClose()`, and `alert`
- **File / lines:** `front-end/src/components/clubs/JoinClubModal.tsx` L40–43.
- **Description:** Duplicate / confusing UX. Because `onClose()` runs before `alert`, the `setSuccess` banner is also unmounted before users can see it.
- **Fix:** Pick one feedback channel (inline banner).
- **Retest:** All three calls still execute on success.

### 17. ❌ STILL PRESENT — Sidebar "Tasks" → `/tasks` has no route
- **File / lines:** `front-end/src/components/common/Sidebar.tsx` L24; `App.tsx` (no `/tasks`).
- **Fix:** Add the route or remove the sidebar entry.
- **Retest:** Sidebar entry intact; App router has no matching path → catch-all redirects to `/dashboard`.

### 18. ❌ STILL PRESENT — Forgot password / Terms link to `/`
- **File / lines:** `LoginPage.tsx` L90–92, `RegisterPage.tsx` L196–199.
- **Fix:** Point to real routes or disable until implemented.
- **Retest:** Both `<Link to="/">` instances unchanged.

### 19. ❌ STILL PRESENT — VP can invite but only president sees member actions
- **File / lines:** `ClubDetailsPage.tsx` L125–128 vs `MembersTable.tsx` L36.
- **Fix:** Align with backend RBAC.
- **Retest:** `canManageEvents = president || vice_president` gates the Invite button, while `MembersTable` uses `canManage = currentUserRole === 'president'`. Mismatch persists.

### 20. ⚠️ PARTIALLY FIXED — Corrupt `user` JSON vs token mismatch
- **File / lines:** `front-end/src/context/AuthContext.tsx` L15–44.
- **Description:** Token may remain while user is null.
- **Fix:** Clear both atomically; wrap `JSON.parse` in try/catch.
- **Retest:** `loadStoredUser` now wraps `JSON.parse` in a `try/catch` (returning `null`), but token initialisation is still independent (`localStorage.getItem('token')`). Result: a corrupt `user` blob still leaves `token` populated and `user` null. No atomic clear is performed.

### 21. ✅ FIXED — `EventsPage` tab filters vs mock statuses
- **File / lines:** `front-end/src/pages/EventsPage.tsx` L96–117.
- **Fix:** Align filter keys with event statuses.
- **Retest:** Mock data has been replaced by `fetchAllEvents` from the backend. Tab filters now match real `EventStatus` values (`published`, `in_progress`, `ongoing`, `draft`, `completed`, `cancelled`).

### 22. ❌ STILL PRESENT — `VITE_API_URL` not typed in `vite-env.d.ts`
- **File / lines:** `front-end/src/vite-env.d.ts`.
- **Fix:** Add `interface ImportMetaEnv { readonly VITE_API_URL: string }`.
- **Retest:** File still contains only the triple-slash reference.

### 23. ✅ FIXED — `AuthUser.user_id` number vs `ClubMember.user_id` string
- **File / lines:** `front-end/src/types/auth.types.ts` L2 vs `front-end/src/types/clubs.types.ts` L21.
- **Fix:** Unify type (backend uses UUID strings).
- **Retest:** Both types now use `user_id: string`.

### 24. ❌ STILL PRESENT — Duplicate `API_BASE` constants
- **File / lines:** `auth.api.ts` L7, `clubs.api.ts` L20, `events.api.ts` L3, `JoinClubModal.tsx` L8.
- **Fix:** Centralize in a single module.
- **Retest:** Four independent declarations still in tree.

### 25. ❌ STILL PRESENT — No route code splitting
- **File / lines:** `front-end/src/App.tsx`.
- **Fix:** Use `React.lazy` + `Suspense` for page routes.
- **Retest:** All page imports remain static; no `React.lazy`/`Suspense` anywhere in `src`.

### 26. ❌ STILL PRESENT (informational) — StrictMode double fetch in dev
- **File / lines:** `front-end/src/main.tsx`.
- **Description:** Expected in dev; ensure effects are idempotent.
- **Retest:** `StrictMode` still wraps `<App />`; effects in `ClubsPage`/`ClubDetailsPage` are idempotent thanks to `isMounted` guards. `EventsPage`'s effect is also idempotent but introduces a stale-token issue (see #44).

### 27. ⚠️ PARTIALLY FIXED — Settings Save/Cancel/Delete are dead buttons
- **File / lines:** `front-end/src/pages/ClubDetailsPage.tsx` L508–527.
- **Fix:** Wire to API or hide until implemented.
- **Retest:** **Delete Club** is now wired (opens `DeleteClubModal` and calls `deleteClub`). **Cancel** and **Save Changes** still have no `onClick`.

### 28. ✅ FIXED — Mock events
- **File / lines:** `EventsPage.tsx`, `ClubDetailsPage.tsx`.
- **Fix:** Replace with real API calls.
- **Retest:** Both pages now use `fetchAllEvents` / `fetchClubEvents`. The `MOCK_EVENTS` constant is gone. (One legacy `// TODO: replace with real events …` comment remains at `ClubDetailsPage.tsx` L324 even though the data is already real — see #42.)

### 29. ❌ STILL PRESENT — User-controlled `href` / `banner_url`
- **File / lines:** `ClubDetailsPage.tsx` L186–194 (banner background-image) and L267–305 (Discord/Instagram/Website `href`).
- **Fix:** Allowlist `http(s)` schemes, reject `javascript:`.
- **Retest:** Values are interpolated directly with no scheme validation.

---

## Low

### 30. ❌ STILL PRESENT — "Remember me" unused
- **File / lines:** `LoginPage.tsx` L13, L82–89.
- **Retest:** `rememberMe` state is set but never sent to `login`/the API.

### 31. ❌ STILL PRESENT — Filter/Sort buttons are no-ops
- **File / lines:** `ClubsPage.tsx` L120–148.
- **Retest:** Both buttons still have no `onClick`.

### 32. ❌ STILL PRESENT — Create club: members + banner UI dead
- **File / lines:** `CreateClubModal.tsx` L103–137.
- **Retest:** Members list shows `members` state that is never populated and never sent; banner button has no handler.

### 33. ❌ STILL PRESENT — Vite `server.host: '0.0.0.0'`
- **File / lines:** `vite.config.ts` L7–9.
- **Note:** LAN exposure in dev.

### 34. ❌ STILL PRESENT — Icon buttons missing `aria-label`
- **File / lines:** `InviteMembersModal.tsx` L72 (close), L83 (copy), L150 (chip remove); `EventsPage.tsx` L141 (filter), L145 (create); `MembersTable.tsx` L75 (action menu); `EventCard.tsx` L56 (menu).
- **Retest:** None of these buttons have `aria-label`.

### 35. ❌ STILL PRESENT — Members search has no label
- **File / lines:** `ClubDetailsPage.tsx` L366–369.

### 36. ❌ STILL PRESENT — Events search has no `aria-label`
- **File / lines:** `EventsPage.tsx` L132–138.

### 37. ❌ STILL PRESENT — Avatar `alt="avatar"` (not descriptive)
- **File / lines:** `InviteMembersModal.tsx` L121, L148.

### 38. ❌ STILL PRESENT — Password mismatch uses `alert`
- **File / lines:** `RegisterPage.tsx` L21–23.
- **Fix:** Inline form error.

### 39. ❌ STILL PRESENT — Register has no loading state
- **File / lines:** `RegisterPage.tsx` L204–206.
- **Retest:** Submit button has no `disabled` or pending text; double-submit possible.

### 40. ❌ STILL PRESENT — Clipboard copy has no error handling
- **File / lines:** `InviteMembersModal.tsx` L83–86.
- **Retest:** `navigator.clipboard.writeText(...)` is unawaited and uncaught.

### 41. ❌ STILL PRESENT — Footer placeholder links / typo
- **File / lines:** `Footer.tsx` L8–11, L14 (`"all right."` → "all rights reserved.").

### 42. ❌ STILL PRESENT — TODOs
- **File / lines:** `InviteMembersModal.tsx` L20; `ClubDetailsPage.tsx` L133, L138, L324.
- **Retest:** All four TODOs still in source.

### 43. ❌ STILL PRESENT — No tests
- **File / lines:** `front-end/package.json` scripts — no test runner.
- **Retest:** `package.json` exposes only `dev`, `build`, `lint`, `preview`.

---

## New findings (May 2026)

### 44. 🆕 NEW (Medium) — `EventsPage` effect missing `token` dependency
- **File / lines:** `front-end/src/pages/EventsPage.tsx` L56–94.
- **Category:** Logic / Stale closure.
- **Description:** The effect reads `token` but its dependency array is `[]`. After login (`token` flips from `null` → string) the page never refetches; it stays stuck on the "Please log in to view your events" branch until a full reload.
- **Fix:** Use `[token]` as the dependency (mirroring `ClubsPage`/`ClubDetailsPage`), or read the token inside the effect via a ref.

---

## Top remaining priorities (fix first)

1. **Event card routes to missing page** (#2) — silently sends users to `/dashboard`.
2. **`createClub` unsafe non-null assertion** (#3) — runtime crash if backend shape drifts.
3. **Tokens in `localStorage`** (#4) — XSS exfiltration risk.
4. **Member role/remove actions not persisted** (#5) — lies to the user.
5. **`InviteMembersModal` does not send invites** (#6) — silent no-op core flow.
6. **`EventsPage` stale-token effect** (#44) — broken first-load UX after login.

*Retest performed against current `main`; static review verified by re-reading each cited file and the router. No running API was contacted.*
