# Backend Bug Audit — `FIT3162_CS_06/back-end`

**Scope:** `FIT3162_CS_06/back-end`
**Stack:** Node.js + Express + TypeScript, PostgreSQL (`pg`), JWT auth, `node-pg-migrate`.

## Summary — counts by severity

| Severity | Count |
|----------|------:|
| Critical | 3 |
| High     | 8 |
| Medium   | 12 |
| Low      | 9 |
| **Total**| **32**|

---

## Critical

### 1. Security — Default JWT secret if `JWT_SECRET` is unset
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/middlewares/auth.middleware.ts` L4–5; `back-end/src/services/auth.service.ts` L8 |
| **Category** | Security / Auth |
| **Description** | `JWT_SECRET` falls back to a fixed string. In production, forgetting the env var yields predictable tokens and full auth bypass. |
| **Fix** | Fail fast at startup if `JWT_SECRET` is missing or too short in production; never ship a hardcoded default for non-dev environments. |

### 2. Security — Permissive CORS with credentials
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/app.ts` L13–17 |
| **Category** | Security / CORS |
| **Description** | `origin: true` reflects the request `Origin` and allows `credentials: true`, so any site can trigger credentialed cross-origin requests to the API. |
| **Fix** | Use an allowlist (e.g. `CLIENT_URL`), or a function that validates origin against known hosts. |

### 3. Security / Privacy — Sensitive data exposed on unauthenticated routes
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/routes/club.routes.ts` L217, L341; `back-end/src/repositories/club.repository.ts` L94–119, L122–148 |
| **Category** | Security / Privacy / PII |
| **Description** | `GET /clubs/:clubId` returns `join_code` (see `code AS join_code` in `getClubById`). `GET /clubs/:clubId/members` returns member **emails**. Both routes have no `authMiddleware`. Anyone can scrape join codes and personal emails. |
| **Fix** | Require auth for the members list (or strip email for non-officers). Omit `join_code` from public club payloads; expose only to club officers or the creating user. |

---

## High

### 4. Security — No brute-force / abuse controls on auth or join
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/routes/auth.routes.ts` L52–102; `back-end/src/routes/club.routes.ts` L130 |
| **Category** | Security / Rate Limiting |
| **Description** | No rate limiting or lockout on `/register`, `/login`, or join-by-code. Login is credential-guessable; join codes are 6-digit numeric (at most 1M values) and enumerable. |
| **Fix** | Add rate limiting (per IP + per account), CAPTCHA or backoff on failures, and monitor join attempts. |

### 5. Security / Ops — Request/query logging may leak PII and secrets
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/db/index.ts` L24–28 |
| **Category** | Logging / Privacy |
| **Description** | Every query logs full SQL text **and** the `params` array. Password hashes, emails, and other sensitive data in params can end up in logs. |
| **Fix** | Log duration + anonymized query fingerprint in production; redact or disable param logging outside development. |

### 6. Auth — Long-lived JWT, no refresh, no revocation
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/services/auth.service.ts` L9, L76–78 |
| **Category** | Auth / Session Management |
| **Description** | `expiresIn: '7d'` with no refresh flow or server-side revocation means stolen tokens are valid for a week. |
| **Fix** | Shorter access tokens, refresh tokens (httpOnly cookie), rotation, and optional denylist for logout/password change. |

### 7. Logic / Error Handling — `joinClub` / `leaveClub` use raw `Error`
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/services/club.service.ts` L92–114; `back-end/src/controllers/club.controller.ts` L71–81, L103–109 |
| **Category** | Error Handling |
| **Description** | Service throws generic `Error` with message strings; controller uses `error: any` and compares `error.message` to fixed strings. Any wording change breaks handling; DB errors surface as 500 without structure. |
| **Fix** | Use `ServiceError` (or typed errors) with status codes end-to-end, like other club handlers. |

### 8. Concurrency — Race condition on `joinClub`
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/services/club.service.ts` L92–106; `back-end/src/repositories/club.repository.ts` L80–86 |
| **Category** | Concurrency |
| **Description** | Two concurrent requests can both pass `isUserInClub` before either insert; the primary key `(club_id, user_id)` rejects one, likely returning **500** instead of a clean **409**. |
| **Fix** | Catch unique-violation (Postgres `23505`) and map to 409; or use a single `INSERT ... ON CONFLICT`. |

### 9. Validation — Password max length not enforced (bcrypt DoS)
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/services/auth.service.ts` L36–38, L45 |
| **Category** | Validation / DoS |
| **Description** | Only minimum length is checked. Extremely long passwords cost CPU on `bcrypt.hash` (DoS vector) and can hit bcrypt's 72-byte input behavior unexpectedly. |
| **Fix** | Enforce a reasonable max length (e.g. 72–128 chars) before hashing. |

### 10. Availability — Unbounded JSON body size
| Field | Detail |
|-------|--------|
| **File / lines** | `back-end/src/app.ts` L19 |
| **Category** | Availability / DoS |
| **Description** | `express.json()` uses default size limits; large bodies can stress memory/CPU. |
| **Fix** | Set an explicit `limit` appropriate for your largest legitimate payload. |

### 11. HTTP / Input — Invalid UUID path params may yield 500
| Field | Detail |
|-------|--------|
| **File / lines** | Any handler using `:clubId` / `:userId` with PG UUID columns, e.g. `back-end/src/repositories/club.repository.ts` L94–117, L151–163 |
| **Category** | Input Validation / HTTP |
| **Description** | Malformed UUID strings can cause PostgreSQL errors that bubble to **500** instead of **400**. |
| **Fix** | Validate UUID format in middleware or service and return 400 early. |

---

## Medium

### 12. Config — `CLIENT_URL` unused
- **File / lines:** `back-end/.env.example` L3; `app.ts` has no reference.
- **Description:** Documented env var is never used (likely intended for CORS).
- **Fix:** Wire into CORS allowlist or remove from example.

### 13. API contract — Swagger vs implementation for club creation
- **File / lines:** `back-end/src/swagger.ts` L75–88; `back-end/src/entities/club.entity.ts` L10–15.
- **Description:** `CreateClubRequest` omits `type` but `CreateClubDTO` requires it; runtime may insert `NULL` if omitted, inconsistent with types/docs.
- **Fix:** Align OpenAPI, DTO, and validation.

### 14. Validation — `updateClub` weaker than `createClub`
- **File / lines:** `back-end/src/services/club.service.ts` L166–195 vs L5–35.
- **Description:** On create, `shared_drive_link` is URL-validated; on update it is not.
- **Fix:** Reuse shared validation for create/update.

### 15. Data layer — Repository allows columns the service does not expose
- **File / lines:** `back-end/src/repositories/club.repository.ts` L168–204; `back-end/src/services/club.service.ts` L174–178.
- **Description:** `updateClub` repo can set `banner_url`, `logo_url`, links, etc.; service `hasUpdatableFields` only considers a subset.
- **Fix:** Extend `UpdateClubDTO` + service validation or remove unused keys from repo mapping.

### 16. Reliability — Server starts even if DB is down
- **File / lines:** `back-end/src/server.ts` L6–9; `back-end/src/db/index.ts` L11–20.
- **Description:** `testConnection()` only logs and returns `false`; the process keeps listening.
- **Fix:** Exit with non-zero in production if DB required; or expose a readiness endpoint.

### 17. Resource management — Pool never closed on shutdown
- **File / lines:** `back-end/src/db/index.ts`; no `SIGTERM` handler in `server.ts`.
- **Description:** Graceful shutdown does not call `pool.end()`, aborting in-flight queries on deploy.
- **Fix:** Handle `SIGTERM`/`SIGINT`: close server, then `pool.end()`.

### 18. Dependencies — Migration tool in runtime dependencies
- **File / lines:** `back-end/package.json` L15–21.
- **Description:** `node-pg-migrate` is under `dependencies`; production images ship it unnecessarily.
- **Fix:** Move to `devDependencies`.

### 19. Testing — No automated tests
- **File / lines:** No `*.test.*` / jest / vitest in repo; no `test` script.
- **Description:** Regressions in auth, transactions, role rules are easy to reintroduce.
- **Fix:** Add integration tests against a test DB.

### 20. Operations — Migration history redundancy / confusion
- **File / lines:** `back-end/migrations/1775835576081_add-join-code.sql`, `1776148830619_add-join-code-FIXED.sql`, later `1776960000002_fix-join-code-and-constraints.sql`.
- **Description:** Multiple migrations touch the same concern; harder to reason about schema truth.
- **Fix:** Document canonical migration path.

### 21. Semantics — `getUserRoleInClub` cannot distinguish unknown club vs non-member
- **File / lines:** `back-end/src/services/club.service.ts` L156–162; `back-end/src/repositories/club.repository.ts` L151–166.
- **Description:** Returns `null` when not in club **or** when club does not exist.
- **Fix:** Check club exists first, or return `{ inClub, role }`.

### 22. Security headers — None configured
- **File / lines:** `back-end/src/app.ts`.
- **Description:** No `helmet` or equivalent for HSTS, X-Content-Type-Options, etc.
- **Fix:** Add security middleware.

### 23. Contract drift — `type` nullable vs required
- See #13. Keep as a separate tracker for regression tests once fixed.

---

## Low

### 24. Code smell — Unused query result
- **File / lines:** `back-end/src/repositories/club.repository.ts` L28–32 (`addClubAdmin`).
- **Fix:** Remove assignment or use `void`.

### 25. Type safety — `error: any` in controllers
- **File / lines:** `back-end/src/controllers/club.controller.ts` L71, L103.
- **Fix:** Narrow with `instanceof Error` or typed errors only.

### 26. Code smell — Duplicate `ServiceError` class definitions
- **File / lines:** `back-end/src/services/auth.service.ts` L92–100; `back-end/src/services/club.service.ts` L289–297.
- **Fix:** Single shared `ServiceError` module.

### 27. Magic values — scattered literals
- **File / lines:** `back-end/src/services/auth.service.ts` L7–9; `back-end/src/services/club.service.ts` L47–56 (`DEFAULT_COLORS`).
- **Fix:** Central config module / env-driven values.

### 28. HTTP semantics — some 400s might be 404
- **File / lines:** `back-end/src/controllers/club.controller.ts` L71–76 (invalid join code).
- **Fix:** Consider 404 or generic message for anti-enumeration.

### 29. Documentation — `CreateClubRequest` incomplete
- **File / lines:** `back-end/src/swagger.ts` L75–88.
- **Fix:** Update OpenAPI to match actual responses and required fields.

### 30. Maintenance — no `TODO`/`FIXME` in application source
- Informational. None found in `back-end/src`.

### 31. Minor — async `listen` callback
- **File / lines:** `back-end/src/server.ts` L6–9.
- **Fix:** Keep `testConnection` swallowing errors or wrap in try/catch.

### 32. Minor — `leaveClub` repository ignores delete result
- **File / lines:** `back-end/src/repositories/club.repository.ts` L88–92.
- **Fix:** Optionally assert `rowCount === 1`.

---

## Top priorities (fix first)

1. **JWT default secret** (#1)
2. **Permissive CORS with credentials** (#2)
3. **Public join codes + member emails** (#3)
4. **Rate limiting on auth + join** (#4)
5. **Sensitive query/param logging** (#5)

*Report generated from static review. Verify against a running API.*
