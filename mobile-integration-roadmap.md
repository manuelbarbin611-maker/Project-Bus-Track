## Mobile Backend Integration — MVP Roadmap

> **Context:** This roadmap was derived from the full audit in [`mobile-backend-integration-audit.md`](mobile-backend-integration-audit.md). Read that file first for a complete picture of all gaps, risks, and architecture decisions.
> **Goal:** Get the driver-side mobile app working end-to-end against the Laravel backend (`tracking-vue-app`) as quickly as possible. Everything else is deferred to a Future TODO list.

---

### Current Baseline (What Already Exists)

- `login.tsx` — UI + `handleSignIn` wired to `AuthContext.login` — **works**
- `register.tsx` — UI with form fields — **not wired to API**
- `verify.tsx` — Hardcoded OTP screen — **non-functional**
- `AuthContext.tsx` + `app/lib/auth.ts` + `app/lib/api.ts` — Basic auth layer — **mostly works, needs patches**
- `locationService.ts` — Background GPS + batch posting — **broken payload, missing `bus_id`**
- `explore.tsx` — Expo template screen — **placeholder**

---

### Phase 1: Fix Auth (Unblock Login/Register)

| Task | Why | File(s) | Effort |
|------|-----|---------|--------|
| ✅ Wire register button to API call | Registration currently does nothing | `app/register.tsx` | ~10 min |
| ✅ Rename `confirmPassword` → `password_confirmation` | Laravel `confirmed` rule expects this key | `app/register.tsx` + `AuthContext.register` | ~5 min |
| ✅ Add client-side password match check | Prevent sending mismatched passwords | `app/register.tsx` | ~10 min |
| ✅ Delete or hide `verify.tsx` | No API for OTP verification; skip for MVP | `app/verify.tsx` + registration flow | ~10 min |
| ✅ Move `API_BASE_URL` to `.env` | Hardcoded `10.0.2.2` is emulator-only | `app/lib/config.ts`, add `.env` | ~15 min |

**Phase 1 Goal:** A user can register, skip verification, and log in. Token is stored and sent on requests.

**Future TODO:** Email verification API (`POST /api/auth/verify-email`, resend endpoint).

---

### Phase 2: Basic Dashboard + Bus Selection

| Task | Why | File(s) | Effort |
|------|-----|---------|--------|
| ✅ Create `busService.ts` with `getBuses()` | Need to fetch fleet data | `app/services/busService.ts` | ~20 min |
| ✅ Replace `explore.tsx` with simple bus list | `explore.tsx` is an Expo template | `app/(tabs)/explore.tsx` | ~30 min |
| ✅ Add "Select My Bus" flow | `locationService` needs a `bus_id` to function | New screen or modal | ~30 min |
| ✅ Store selected `bus_id` in `AuthContext` or global state | `locationService` reads this on batch send | `app/context/AuthContext.tsx` or new context | ~20 min |

**Phase 2 Goal:** After login, driver sees a list of buses, taps one to claim it. `bus_id` is available app-wide.

**Future TODO:** Full driver dashboard with route map, trip start/end, status controls, passenger count.

---

### Phase 3: Fix Location Tracking (Core Feature)

| Task | Why | File(s) | Effort |
|------|-----|---------|--------|
| ✅ Fix batch payload shape to `{ bus_id, locations }` | Backend rejects `{ locations }` only | `app/services/locationService.ts` | ~10 min |
| ✅ Read `bus_id` from stored state/context | Currently hardcoded / missing entirely | `app/services/locationService.ts` | ~10 min |
| ✅ Switch `locationService` to use the shared `api` wrapper | Currently uses raw `fetch`; unify auth header handling | `app/services/locationService.ts` | ~15 min |
| Test background task on real device / emulator | Confirm batches actually reach `POST /api/locations/batch` | — | ~20 min |

**Phase 3 Goal:** Background GPS runs, batches include `bus_id`, and the backend stores driver location history.

**Future TODO:** Exponential backoff, max retry limit, offline queue for non-location mutations.

---

### Phase 4: Minimal Polish (Nice-to-Haves Before "Ship")

| Task | Why | File(s) | Effort |
|------|-----|---------|--------|
| ✅ Add basic TypeScript types for `User` and `Bus` | Stop using `any` for the two most common objects | `app/types/index.ts` | ~20 min |
| ◐ Add a simple loading spinner to login/register | Bare minimum UX feedback | `app/login.tsx`, `app/register.tsx` | ~10 min |
| ✅ Add an error message when API is unreachable | Instead of silent failure | `app/lib/api.ts` | ~10 min |

**Future TODO:** Full type system for all entities, React Query/SWR, form validation library (Zod/Yup), pagination, offline indicator, network state checks.

---

### Future TODO List (Post-MVP)

#### Priority 1: Make Driver Mobile Usable Now
- [x] Decide if app is Driver-only, Passenger-only, Dual-role, or Two apps — Driver-only confirmed for MVP
- [x] Send real-time GPS batches to the centralized backend with authenticated JSON requests
- [x] Confirm mobile GPS updates appear in the existing web live tracking dashboard
- [x] Add route viewing with stops from backend data
- [x] Update current stop through `PATCH /api/buses/{bus}/stop`
- [x] Update bus status through `PATCH /api/buses/{bus}/status`
- [x] Add trip start/end flow through backend endpoints
- [x] View assigned passengers / queue from backend data
- [x] Display seating capacity or occupancy from backend bus records

#### Priority 2: Passenger Mobile App
- [x] Build passenger app screens against the centralized Laravel API
- [x] Add live bus map using backend-provided real-time bus locations
- [x] Add bus search and route filtering
- [x] Display real-time speed from backend location logs
- [x] Display seating capacity or occupancy from backend bus records
- [x] Add ETA and queue management features when backend endpoints are available

#### Priority 3: Mobile API Services Needed for Existing Backend Features
- [x] Add `routeService.ts` for route and assigned route data
- [x] Add `stopService.ts` for route stop lists and current stop updates
- [x] Add `trackLogService.ts` for live tracking/location history integration
- [x] Add `passengerService.ts` for assigned passengers and queue data
- [x] Add full TypeScript interfaces for buses, routes, stops, passengers, trips, queues, and tracking logs
- [x] Add `ApiResponse<T>`, `ApiError`, and `PaginatedResponse<T>` wrappers in the mobile app
- [x] Document the backend endpoints currently used by Driver Mobile

#### Priority 4: Mobile Reliability and Authentication Hardening
- [ ] Standardize mobile requests to use HTTP JSON with Sanctum tokens through the shared API wrapper
- [ ] Implement 401 handling that redirects unauthenticated users to login
- [ ] Add request timeout, retry logic, and network error handling
- [ ] Add backend health check on mobile app startup
- [ ] Add pagination handling for mobile list endpoints
- [ ] Add network connectivity checks and offline queue for temporary GPS/client-side buffering
- [x] CORS verification documentation

#### Priority 5: Backend Support for Mobile Usability
- [ ] Keep Laravel as the single authoritative backend for Web Admin, Driver Mobile, and Passenger Mobile clients
- [ ] Protect all client-facing endpoints with Sanctum token authentication
- [ ] Validate all incoming request data on the backend before database writes
- [ ] Centralize business rules for trips, bus status, route assignments, seating capacity, and location updates in Laravel services/controllers
- [ ] Define consistent JSON response formats for success, validation errors, authentication errors, and server errors
- [ ] Add or verify any missing backend endpoints needed by Driver Mobile route, stop, trip, passenger, and tracking screens

#### Priority 6: Database and Local Development Data
- [ ] Ensure SQLite/MySQL remains the single source of truth for users, buses, routes, stops, trips, location logs, and system records
- [ ] Avoid storing authoritative business data only in client-side state
- [ ] Add migrations for any missing records needed by Driver Mobile features
- [ ] Add seed data for local development across Web Admin and Driver Mobile flows
- [ ] Define data retention policy for bus location logs and analytics records

#### Priority 7: Admin Dashboard and Production Configuration
- [ ] Ensure the Vue dashboard consumes the same Laravel API used by the mobile clients
- [ ] Add or verify fleet management screens for buses, routes, stops, and driver assignments
- [ ] Add or verify monitoring screens for live bus locations, speed, capacity, and trip status
- [ ] Add analytics views using backend-provided system records and logs
- [ ] Ensure admin-only actions are protected by backend authorization rules
- [ ] React Query / SWR for caching and invalidation in mobile clients
- [ ] `eas.json` environment profiles for staging/production
- [ ] HTTPS for production API URL
- [ ] Wire `verify.tsx` to real OTP API if email verification is enabled
- [ ] Add email verification API endpoints to backend

---

### How to Use This Roadmap

1. **Work top to bottom.** Don't jump to Phase 3 until Phase 1 auth is solid.
2. **Timebox each phase.** If a task starts ballooning, cut scope and move it to Future TODO.
3. **Reference the audit** if you need deeper context on *why* something is broken or what the backend expects.
4. **After each phase, test against the backend.** Run `tracking-vue-app`, hit the endpoints from the mobile app, and confirm 200s.

---

### Decision Needed Before Starting

- [x] **Confirm the mobile app is a Driver app for MVP.** (Not Passenger, not Dual-role.) — *Confirmed: Architecture diagram shows Driver as a first-class client alongside Web Admin and Passenger.*
- [x] **Confirm `bus_id` source.** Does the driver manually select from a list, or should the backend assign based on `user.role`? — *Confirmed: Manual selection from `GET /api/buses` list. No backend changes needed.*
