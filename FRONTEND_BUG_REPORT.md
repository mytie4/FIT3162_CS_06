# Frontend Bug Audit — Eventure (`front-end`)

**Scope:** `front-end/`
**Stack:** React 19, React Router 7, Vite 7, TypeScript 5.9 (no test runner configured).

## Summary — counts by severity

| Severity  | Count |
|-----------|------:|
| Critical  |     3 |
| High      |     8 |
| Medium    |    18 |
| Low       |    14 |
| **Total** | **43**|

---

## Critical

### 1. `LeaveClubModal` never calls the leave-club API
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/LeaveClubModal.tsx` L34–36; usage in `front-end/src/pages/ClubDetailsPage.tsx` L400–407 |
| **Category** | Logic / API integration |
| **Description** | Confirming "Leave Club" only runs `onLeave`, which closes the modal and navigates to `/clubs`. The backend exposes `POST /api/clubs/leave` with `{ clubID }`. The user remains a member server-side. |
| **Fix** | Call the leave endpoint with `clubId` and auth token; handle errors; then navigate or refresh club state. |

### 2. Event card navigates to a non-existent route
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/pages/ClubDetailsPage.tsx` L248–260 |
| **Category** | Routing / Dead navigation |
| **Description** | `onClick` uses `navigate(\`/clubs/${clubId}/events/${event.id}\`)` but `App.tsx` defines no `/clubs/:clubId/events/:eventId` route. Users hit the catch-all and get redirected to `/dashboard`. |
| **Fix** | Add the route and page, or remove navigation until the feature exists. |

### 3. `createClub` assumes `club` is always present in response
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/clubs.api.ts` L49–55 |
| **Category** | API Contract / Runtime error |
| **Description** | `return json.club!` will throw or return `undefined` if the server shape changes or `club` is missing. |
| **Fix** | Validate `json.club` and throw a clear error if absent. |

---

## High

### 4. Access tokens stored in `localStorage`
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/context/AuthContext.tsx` L27–33, L40–41; `front-end/src/components/clubs/JoinClubModal.tsx` L29 |
| **Category** | Security / XSS exposure |
| **Description** | Any XSS in the app can exfiltrate the bearer token. |
| **Fix** | Prefer `httpOnly` secure cookies set by the backend (with CSRF strategy), or short-lived tokens + refresh pattern; use `useAuth().token` instead of `localStorage` in components. |

### 5. Member role changes and removals only update React state
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/pages/ClubDetailsPage.tsx` L102–109; `MembersTable` callbacks |
| **Category** | Logic / API integration |
| **Description** | Handlers mutate local `members` only. TODOs note missing `PUT`/`DELETE` APIs. UI shows success while the server is unchanged; refresh loses changes. |
| **Fix** | Wire to `PATCH .../members/:userId/role` and `DELETE .../members/:userId` when available; roll back on failure. |

### 6. `InviteMembersModal` does not send invites
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/InviteMembersModal.tsx` L56–60; `front-end/src/pages/ClubDetailsPage.tsx` L394–399 |
| **Category** | Logic / API integration |
| **Description** | `onSendInvites` is optional and not passed from `ClubDetailsPage`. "Send Invites" clears selection and closes the modal with no network call. |
| **Fix** | Implement API + pass `onSendInvites`, or disable/hide the button until implemented. |

### 7. Joining a club does not refresh the clubs list
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/clubs/JoinClubModal.tsx` (success path); `front-end/src/pages/ClubsPage.tsx` |
| **Category** | State synchronization |
| **Description** | On success the modal closes; `ClubsPage` state is unchanged until a full reload. |
| **Fix** | Callback to refetch `getAllClubs()` or update local state from the join response. |

### 8. `await res.json()` without guarding non-JSON or empty bodies
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/auth.api.ts` L18, L33; `front-end/src/api/clubs.api.ts` L19, L49, L61, L73, L89; `front-end/src/components/clubs/JoinClubModal.tsx` L34 |
| **Category** | Error Handling / API |
| **Description** | Proxies, 502 HTML pages, or empty responses cause `JSON.parse` failures and obscure errors. |
| **Fix** | Check `Content-Type`, use `res.text()` + safe parse, or try/catch with a fallback message. |

### 9. `EventCard` uses a clickable `div` with an inner control
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/components/events/EventCard.tsx` L49–61 |
| **Category** | Accessibility / UX |
| **Description** | The card relies on `onClick` on a `div` (not keyboard-focusable by default). |
| **Fix** | Use a `button` or `role="button"` + `tabIndex={0}` + keyboard handler, or make the whole card a link; manage focus for the menu. |

### 10. Public member list exposes emails
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/api/clubs.api.ts` `fetchClubMembers` |
| **Category** | Privacy / Security |
| **Description** | The backend route is unauthenticated and returns emails; the frontend consumes them freely. |
| **Fix** | Secure the backend (see backend report #3) and strip emails for non-officers on the client. |

### 11. No React error boundary
| Field | Detail |
|-------|--------|
| **File / lines** | `front-end/src/main.tsx`, `front-end/src/App.tsx` |
| **Category** | Reliability |
| **Description** | Runtime errors crash the tree; no fallback UI. |
| **Fix** | Add a top-level `ErrorBoundary` and per-route boundaries. |

---

## Medium

### 12. `ClubDetailsPage` `useEffect` depends on `token`
- **File / lines:** `front-end/src/pages/ClubDetailsPage.tsx` L55–97.
- **Description:** Refetch on token change may be redundant.
- **Fix:** Document or narrow the dependency list.

### 13. Register: `registerRequest` then `login`
- **File / lines:** `front-end/src/pages/RegisterPage.tsx` L26–32.
- **Description:** Double round-trip; confusing errors if login fails after register.
- **Fix:** Have the register endpoint return a session token, or handle partial success gracefully.

### 14. `CreateClubModal` allows empty club name
- **File / lines:** `front-end/src/components/clubs/CreateClubModal.tsx` L33–55.
- **Fix:** Validate required fields client-side before POST.

### 15. `JoinClubModal` does not validate 6-digit code
- **File / lines:** `front-end/src/components/clubs/JoinClubModal.tsx` L20–32.
- **Fix:** Align with backend `/^\d{6}$/`.

### 16. `JoinClubModal` success triggers `setSuccess`, `onClose()`, and `alert`
- **File / lines:** `front-end/src/components/clubs/JoinClubModal.tsx` L40–43.
- **Description:** Duplicate / confusing UX.
- **Fix:** Pick one feedback channel (inline banner).

### 17. Sidebar "Tasks" → `/tasks` has no route
- **File / lines:** `front-end/src/components/common/Sidebar.tsx` L20–24; `App.tsx` has no `/tasks`.
- **Fix:** Add the route or remove the sidebar entry.

### 18. Forgot password / Terms link to `/`
- **File / lines:** `LoginPage.tsx` L90–91, `RegisterPage.tsx` L196–199.
- **Fix:** Point to real routes or disable until implemented.

### 19. VP can invite but only president sees member actions
- **File / lines:** `ClubDetailsPage.tsx` vs `MembersTable.tsx`.
- **Fix:** Align with backend RBAC.

### 20. Corrupt `user` JSON vs token mismatch
- **File / lines:** `front-end/src/context/AuthContext.tsx` L15–21.
- **Description:** Token may remain while user is null.
- **Fix:** Clear both atomically; wrap `JSON.parse` in try/catch.

### 21. `EventsPage` tab filters vs mock statuses
- **File / lines:** `front-end/src/pages/EventsPage.tsx` L35–48 vs mock data.
- **Fix:** Align filter keys with event statuses.

### 22. `VITE_API_URL` not typed in `vite-env.d.ts`
- **File / lines:** `front-end/src/vite-env.d.ts`.
- **Fix:** Add `interface ImportMetaEnv { readonly VITE_API_URL: string }`.

### 23. `AuthUser.user_id` number vs `ClubMember.user_id` string
- **File / lines:** `front-end/src/types/auth.types.ts` vs `front-end/src/types/clubs.types.ts`.
- **Fix:** Unify type (backend uses UUID strings).

### 24. Duplicate `API_BASE` constants
- **File / lines:** `auth.api.ts`, `clubs.api.ts`, `JoinClubModal.tsx`.
- **Fix:** Centralize in a single module.

### 25. No route code splitting
- **File / lines:** `front-end/src/App.tsx`.
- **Fix:** Use `React.lazy` + `Suspense` for page routes.

### 26. StrictMode double fetch in dev
- **File / lines:** `front-end/src/main.tsx`.
- **Description:** Expected in dev; ensure effects are idempotent.

### 27. Settings Save/Cancel/Delete are dead buttons
- **File / lines:** `front-end/src/pages/ClubDetailsPage.tsx` L302–387.
- **Fix:** Wire to API or hide until implemented.

### 28. Mock events
- **File / lines:** `EventsPage.tsx`, `ClubDetailsPage.tsx` (MOCK_EVENTS, TODO L247).
- **Fix:** Replace with real API calls.

### 29. User-controlled `href` / `banner_url`
- **File / lines:** `ClubDetailsPage.tsx`.
- **Fix:** Allowlist `http(s)` schemes, reject `javascript:`.

---

## Low

### 30. "Remember me" unused
- **File / lines:** `LoginPage.tsx` L13, L83–88.

### 31. Filter/Sort buttons are no-ops
- **File / lines:** `ClubsPage.tsx` L109–137.

### 32. Create club: members + banner UI dead
- **File / lines:** `CreateClubModal.tsx` L103–137.

### 33. Vite `server.host: '0.0.0.0'`
- **File / lines:** `vite.config.ts` L7–9.
- **Note:** LAN exposure in dev.

### 34. Icon buttons missing `aria-label`
- **File / lines:** `InviteMembersModal.tsx` ~L72; `EventsPage.tsx` ~L71–76; `MembersTable.tsx` ~L75–79.

### 35. Members search has no label
- **File / lines:** `ClubDetailsPage.tsx` L284.

### 36. Events search has no `aria-label`
- **File / lines:** `EventsPage.tsx` L63–68.

### 37. Avatar `alt="avatar"` (not descriptive)
- **File / lines:** `InviteMembersModal.tsx` L121, L148.

### 38. Password mismatch uses `alert`
- **File / lines:** `RegisterPage.tsx` L21–23.
- **Fix:** Inline form error.

### 39. Register has no loading state
- **File / lines:** `RegisterPage.tsx` ~L204–206.

### 40. Clipboard copy has no error handling
- **File / lines:** `InviteMembersModal.tsx` L83–86.

### 41. Footer placeholder links / typo
- **File / lines:** `Footer.tsx` L8–11.

### 42. TODOs
- **File / lines:** `InviteMembersModal.tsx` L20; `ClubDetailsPage.tsx` L104, L109, L247.

### 43. No tests
- **File / lines:** `front-end/package.json` scripts — no test runner.

---

## Positive observations

- No `dangerouslySetInnerHTML` / `eval` in frontend sources.
- `ClubsPage` and `ClubDetailsPage` use `isMounted` guards in async `useEffect`.
- Join payload `joinCode` matches backend.
- ESLint includes `eslint-plugin-react-hooks` recommended config.

---

## Top priorities (fix first)

1. **`LeaveClubModal` does nothing server-side** (#1)
2. **Event card routes to missing page** (#2)
3. **`createClub` unsafe non-null assertion** (#3)
4. **Tokens in `localStorage`** (#4)
5. **Member role/remove actions not persisted** (#5)

*Report generated from static review. Verify against a running API.*
