## Backend Integration Audit (Revised — `tracking-vue-app`)

### 1. Current State Summary

**Mobile Application (`BusTrackMobile`)**
- Expo SDK 54 React Native app with `expo-router`.
- Minimal custom `fetch` wrapper at `app/lib/api.ts`.
- Auth context at `app/context/AuthContext.tsx` with login/logout/register functions.
- Location tracking service at `app/services/locationService.ts`.
- UI screens: `login.tsx`, `register.tsx`, `verify.tsx`, and a template `explore.tsx`.
- **Zero TypeScript interfaces** for backend entities or API responses.
- **Role ambiguity**: The app has a location tracking service (driver feature) but no clear role assignment, passenger features, or role-based navigation.

**Laravel Backend (`tracking-vue-app`) — Confirmed Functional**
- Laravel 12 with **Laravel Sanctum v4** installed (`composer.json:12`).
- Full `routes/api.php` with domain endpoints for buses, routes, passengers, track stops, track logs, bus queue, and live dashboard.
- Complete API auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `AuthController` uses `$user->createToken('mobile')->plainTextToken` (Sanctum).
- All domain controllers present: `BusController`, `BusRouteController`, `TrackStopController`, `PassengerController`, `TrackLogController`, `BusQueueController`.
- Database schema consolidated in one migration: `users`, `routes`, `track_stops`, `buses`, `passengers`, `bus_queue`, `track_log`.
- `bootstrap/app.php` registers API routes and calls `$middleware->statefulApi()`.

---

### 2. Missing API Integration Requirements

The mobile app **does not have service modules** for any domain beyond auth:

| Missing Service | Required Backend Endpoints |
|-----------------|----------------------------|
| `services/busService.ts` | `GET /api/buses`, `POST /api/buses`, `GET/PUT/DELETE /api/buses/{id}`, `PATCH /api/buses/{id}/status`, `PATCH /api/buses/{id}/stop` |
| `services/routeService.ts` | `GET /api/routes`, `POST /api/routes`, `GET/PUT/DELETE /api/routes/{id}` |
| `services/stopService.ts` | `GET /api/routes/{route}/stops`, `POST /api/routes/{route}/stops`, `GET/PUT/DELETE /api/stops/{id}` |
| `services/passengerService.ts` | `GET /api/passengers`, `POST /api/passengers`, `GET/PUT/DELETE /api/passengers/{id}`, `PATCH /api/passengers/{id}/status`, `PATCH /api/passengers/{id}/assign` |
| `services/queueService.ts` | `GET /api/buses/{bus}/queue`, `POST /api/buses/{bus}/queue`, `DELETE /api/buses/{bus}/queue/{passenger}`, `PATCH /api/buses/{bus}/queue/{passenger}/board` |
| `services/trackLogService.ts` | `GET /api/buses/{bus}/logs`, `GET /api/buses/{bus}/logs/latest`, `GET /api/live` |
| `services/locationService.ts` | `POST /api/locations/batch` (exists but sends wrong payload) |

**Additional gaps:**
- **No pagination handling**: `TrackLogController::index` returns a Laravel paginator object. The mobile has no pagination state or utilities.
- **No query parameter builders**: Endpoints support filters (`?status=`, `?route_id=`, `?bus_id=`, `?search=`, `?date=`, `?per_page=`). Mobile has no utilities to construct or manage these.

---

### 3. Missing Authentication Integration

**Backend API Auth Contract**
- `POST /api/auth/login` -> `{ access_token: string, token_type: 'Bearer', user: User }`
- `POST /api/auth/register` -> `{ access_token: string, token_type: 'Bearer', user: User }` (HTTP 201)
- `POST /api/auth/logout` -> `{ message: 'Logged out' }`
- `GET /api/auth/me` -> `{ user: User }`

**Mobile Auth Gaps:**

- **`register.tsx` is not wired to the API**: The "Create account" button (`register.tsx:78`) has **no `onPress` handler**. It never calls the `register` function from `AuthContext`.
- **Registration payload mismatch**: The form collects `confirmPassword` (`register.tsx:11`) but the backend validation expects **`password_confirmation`** (`AuthController.php:46`). Submitting `{ name, email, password, confirmPassword }` will fail Laravel's `confirmed` rule.
- **Email verification is web-only**: The backend has OTP email verification (`EmailVerificationCodeController` in `routes/auth.php`), but it only works for the Inertia/Vue web frontend. There is **no API endpoint** to:
  - Check if email is verified
  - Submit an OTP code
  - Resend an OTP code
- **`verify.tsx` is completely non-functional**: It hardcodes `if (fullCode === '123456')` (`verify.tsx:15`) with no backend call. Since no API verification endpoint exists, this screen cannot work as-is.
- **No token refresh strategy**: Sanctum tokens are long-lived by default, but if token expiration is ever enabled, the mobile app has no refresh interceptor.
- **No auth error boundary / 401 redirect**: `AuthContext.tsx:27-30` catches `getCurrentUser` failures, removes the token, and sets `user` to `null`, but does not redirect the user to the login screen.
- **`AuthContext` user type is `any`**: `user` state is `any | null` instead of a typed `User` interface.

---

### 4. Missing Mobile Data Models / Types

There are **zero TypeScript interfaces** for any backend entity. Every API response is typed as `any`.

Required interfaces based on the database schema and controller responses:

- `User` — `{ id, name, email, email_verified_at, role }`
- `Bus` — `{ id, bus_number, route_id, capacity, current_stop_id, status, available_seats?, route?, currentStop?, passengers?, queue?, trackLogs? }`
- `BusRoute` — `{ id, name, description, status, stops_count?, buses_count?, stops?, buses? }`
- `TrackStop` — `{ id, route_id, stop_name, stop_order, latitude, longitude, created_at, route?, busesHere? }`
- `Passenger` — `{ id, first_name, last_name, status, assigned_bus_id, assignedBus?, queueEntry?, full_name? }`
- `TrackLog` — `{ id, bus_id, stop_id, stop_name, latitude, longitude, logged_at, bus?, stop? }`
- `BusQueue` — `{ id, bus_id, passenger_id, queue_order, queued_at, bus?, passenger? }`

Also missing response wrapper types:
- `ApiResponse<T> = { data: T; message?: string }`
- `ApiError = { message: string; errors?: Record<string, string[]> }`
- `PaginatedResponse<T> = { data: T[]; current_page; last_page; per_page; total; links; ... }`

---

### 5. Missing Service / Networking Layer

The existing `app/lib/api.ts` is a bare `fetch` wrapper with the following gaps:

- **No request timeout**: `fetch` calls can hang indefinitely.
- **No request/response interceptors**: Cannot globally inject headers, log requests, or normalize responses.
- **No retry logic**: Failed requests are not retried (outside of location batch persistence).
- **No network state awareness**: No check for online/offline status before making requests.
- **No centralized error transformation**: Errors are thrown as raw objects `{ status, data }`; consumers handle them inconsistently.
- **No loading state management**: Screens manually manage `useState<boolean>` loading flags (`login.tsx:12`).
- **No query caching / invalidation**: No React Query, SWR, or TanStack Query equivalent.
- **No request cancellation**: Race conditions possible when navigating away from screens mid-request.

**Location service specific gaps (`app/services/locationService.ts`):**
- Uses raw `fetch` directly instead of the `api` wrapper (`api.ts`).
- **Sends wrong payload shape**: `POST /api/locations/batch` receives `{ locations }` but the backend expects **`{ bus_id: number, locations: [...] }`** (`TrackLogController.php:108-117`).
- No `bus_id` concept exists anywhere in the mobile app. The location service does not know which bus it is tracking.
- No exponential backoff for batch retries.
- No max pending batch limit in AsyncStorage.

---

### 6. Missing Configuration Setup

- **Hardcoded API base URL**: `app/lib/config.ts:1` hardcodes `http://10.0.2.2:8000`. There is no `.env` integration or environment switching for staging/production.
- **No `eas.json` environment variables**: Build profiles do not inject API URLs.
- **No CORS documentation**: The backend uses `$middleware->statefulApi()` in `bootstrap/app.php`. Mobile token auth should work, but the developer has not verified CORS preflight behavior for `fetch` requests.
- **No backend health check**: No startup check for API availability or version compatibility.
- **No SSL/TLS for production**: Hardcoded `http://` will fail on iOS production builds (ATS).

---

### 7. Integration Gaps With Laravel Backend

| Mobile Component | Expected Behavior | Actual Backend Behavior | Gap |
|------------------|-------------------|-------------------------|-----|
| `loginRequest` | `POST /api/auth/login` with `{email, password}` -> receives token | Returns `{access_token, token_type, user}` | Correct contract |
| `registerRequest` | `POST /api/auth/register` with `{name, email, password, confirmPassword}` | Expects `{name, email, password, password_confirmation}` | **Payload mismatch** |
| `getCurrentUser` | `GET /api/auth/me` -> user object | Returns `{user}` | Correct contract |
| `verify.tsx` | Submits 6-digit OTP to backend | **No API endpoint exists** for OTP verification | **Feature mismatch** |
| `locationService.ts` | `POST /api/locations/batch` with `{locations: [...]}` | Expects `{bus_id, locations: [...]}` | **Missing `bus_id`** |
| `explore.tsx` | Shows fleet/bus data after login | Is a stock Expo template screen with no domain data | **Not integrated** |
| `register.tsx` | Calls `register()` from `AuthContext` | Button has no `onPress` | **UI not wired** |

**Backend auth behavior that mobile must account for:**
- `AuthController::register` does **not** send an OTP email and does **not** require email verification before returning a token. It creates the user and immediately issues a Sanctum token.
- The web frontend (`RegisteredUserController::store`) generates an OTP and redirects to verification, but the **API endpoint does not**.
- `User` implements `MustVerifyEmail`, so `email_verified_at` may be `null` even after API registration. The mobile app has no way to trigger or check verification status via API.

**Email Verification — Options Analysis**

The backend already has OTP infrastructure (`email_verification_code`, `email_verification_code_expires_at`, `SendEmailVerificationCode` notification, `EmailVerificationCodeController`), but it is **only wired to the web frontend**. The mobile app needs a decision on which path to take.

| Option | What It Means | Backend Work | Mobile Work | Difficulty | Alignment with Goals |
|--------|---------------|--------------|-------------|------------|---------------------|
| **A. Skip verification for mobile** | Remove `verify.tsx`. API registration issues token immediately without verifying email. Mobile users can use the app right away. | None — `AuthController::register` already does this. | Delete `verify.tsx`; remove verification navigation from registration flow. | **Easy** | High for rapid launch. Risk: if backend later enforces `verified` middleware, mobile breaks. |
| **B. Add API endpoints for OTP** | Create `POST /api/auth/verify-email` and `POST /api/auth/verify-email/resend`. Mobile submits the 6-digit code via API. Backend reuses existing OTP logic. | Add 2 routes + a small API controller (or extend `AuthController`) that replicates `EmailVerificationCodeController::store` and `::resend` as JSON endpoints. | Wire `verify.tsx` to call the new API endpoints; handle loading/error states. | **Medium** | High for parity with web. Keeps existing `verify.tsx` screen relevant. Aligns with security-conscious fleet management. |
| **C. Auto-verify on API register** | Modify `AuthController::register` to set `email_verified_at = now()` immediately upon registration. No OTP needed for mobile. | One-line change in `AuthController::register`. | Delete `verify.tsx`. | **Easy** | High if mobile users are trusted (e.g., pre-approved drivers). Weakens security if public sign-up is allowed. |
| **D. Use Laravel signed URL links** | Send the default Laravel email verification link. User taps it, opens browser, verifies, then returns to app. | Configure `MustVerifyEmail` to send the default notification instead of OTP. | Implement deep linking so the app opens when the user taps the verification link. | **Hard** | Low — deep linking is complex, and the existing web flow is built around OTP, not signed URLs. |

**Recommendation**
- **Short term**: Go with **Option A** (skip verification for mobile) to unblock registration immediately. The API already works this way.
- **Medium term**: Implement **Option B** if you want the mobile registration flow to match the web registration flow (OTP code via email). This is the most aligned with the existing backend design.
- **Avoid Option D** unless you plan to rebuild the web frontend's verification flow too.

---

### 7b. Role-Specific Integration Gaps (Architecture Clarification)

The system architecture specifies **three distinct client roles** served by the same Laravel backend:

| Client | Role | Key Features |
|--------|------|--------------|
| **Web App (Vue.js)** | System Administrator | Fleet management, monitoring, analytics |
| **Driver (Mobile)** | Bus Driver | Real-time GPS location tracking, trip management |
| **Passenger (Mobile)** | Commuter | Monitor bus location, real-time speed, seating capacity |

**Critical Finding: The current `BusTrackMobile` app does not identify which role it serves.**

It contains a `locationService.ts` (driver feature) but lacks:
- **Driver-specific features**: Bus selection/assignment, trip start/end flow, route viewing, status updates (`PATCH /api/buses/{bus}/status`), stop updates (`PATCH /api/buses/{bus}/stop`).
- **Passenger-specific features**: Live bus map (`GET /api/live`), bus search, route viewing (`GET /api/routes/{route}/stops`), speed/capacity display, queue position.
- **Role-based navigation**: No concept of "Driver Mode" vs "Passenger Mode". No role field in the `User` model is checked or acted upon.

**Backend endpoint access patterns that reveal role intent:**
- `GET /api/buses/{bus}/logs/latest` is **public** (no auth required) — designed for passengers to check a bus's current position without logging in.
- `GET /api/live` is **protected** (`auth:sanctum`) — requires passenger login to view all active buses.
- `POST /api/locations/batch` is **protected** — requires driver login to submit GPS coordinates.
- The mobile app currently only implements the driver-side location tracking, but without `bus_id` it cannot function.

**Missing for Driver role:**
- Bus assignment flow (how does a driver claim a bus?)
- Trip management (start trip, end trip, mark stops)
- View assigned route and stops
- Update bus status (`active`, `maintenance`, `out_of_service`)

**Missing for Passenger role:**
- Live dashboard showing all active buses (`GET /api/live`)
- Bus detail view with current speed, capacity, available seats
- Route stops listing
- ETA calculation (based on `TrackLog` timestamps)
- Queue management (join/leave queue, see position)

**Decision required:** Is `BusTrackMobile` meant to be:
1. **Driver-only app** — remove passenger-facing features, add driver trip management
2. **Passenger-only app** — remove location tracking, add live bus viewing
3. **Dual-role app** — add role selection at login, switch UI based on `user.role`
4. **Two separate apps** — split into `BusTrackDriver` and `BusTrackPassenger`

---

### 8. Risks / Blockers

- **Registration is completely broken**: No `onPress` handler + wrong field name (`confirmPassword` vs `password_confirmation`) + no OTP API means registration cannot succeed.
- **Location tracking sends invalid payload**: Without `bus_id`, `POST /api/locations/batch` will return 422 validation errors. Background location data will never persist.
- **No typed contracts**: Backend controllers could change response shapes and silently break mobile UI.
- **Email verification dead end**: Mobile registers a user, gets a token, but has no API path to verify email. If the backend later enforces `verified` middleware, mobile users will be locked out.
- **No pagination handling**: `trackLogs` index will return paginated JSON that mobile doesn't know how to render or navigate.
- **Unbounded AsyncStorage growth**: Failed location batches accumulate with no size limit or TTL.
- **`explore.tsx` is a template screen**: After login, the app redirects to `/explore` which contains Expo template content. No fleet data is fetched or displayed.
- **Role ambiguity is a structural blocker**: The app was built with driver features (location tracking) but no driver workflow (bus assignment, trip management). Meanwhile, passenger features (live bus map, speed/capacity display, queue management) are entirely absent. The app cannot serve either role effectively in its current state.
- **Potential need for two separate mobile apps**: If the architecture requires a Driver app and a Passenger app, the current single-app approach will require a significant refactor or a split into two codebases.

---

### 9. Final Checklist Before Implementation

#### Mobile-side prerequisites
- [ ] Create TypeScript interfaces for all backend entities (`User`, `Bus`, `BusRoute`, `TrackStop`, `Passenger`, `TrackLog`, `BusQueue`).
- [ ] Create `ApiResponse<T>`, `ApiError`, and `PaginatedResponse<T>` types.
- [ ] Wire `register.tsx` submit button to call `register()` from `AuthContext`.
- [ ] Rename `confirmPassword` to `password_confirmation` in registration payload, or manually match Laravel's `confirmed` rule.
- [ ] Add client-side password confirmation validation in `register.tsx`.
- [ ] Add `bus_id` state/context to the mobile app so `locationService.ts` can include it in batch payloads.
- [ ] Redesign or remove `verify.tsx` -- the backend has no API for OTP verification. Coordinate with backend if email verification is required for mobile.
- [ ] Create dedicated service modules: `busService.ts`, `routeService.ts`, `passengerService.ts`, `trackLogService.ts`, `queueService.ts`, `stopService.ts`.
- [ ] Add request timeout and centralized error handling to `app/lib/api.ts`.
- [ ] Add environment-based `API_BASE_URL` via `.env` + `expo-constants`.
- [ ] Replace `explore.tsx` with an actual dashboard screen that fetches and displays fleet data.
- [ ] Add pagination state handling for paginated endpoints.
- [ ] Add a global loading/error state utility or adopt React Query / SWR.
- [ ] Add network connectivity checks and a global offline indicator.
- [ ] Add form validation (Zod / Yup) to `login.tsx` and `register.tsx`.
- [ ] **Decide the mobile app's role(s)**: Driver-only, Passenger-only, Dual-role, or Two separate apps.
- [ ] If **Driver app**: Add bus selection/assignment flow, trip start/end management, route viewing, status update UI.
- [ ] If **Passenger app**: Add live bus dashboard (`GET /api/live`), bus search, route stops view, speed/capacity display, queue join/leave.
- [ ] If **Dual-role app**: Add role selection at login (read `user.role` from `/api/auth/me`), implement role-based navigation/screens.
- [ ] If **Two separate apps**: Plan codebase split into `BusTrackDriver` and `BusTrackPassenger`.

#### Backend coordination prerequisites
- [ ] Confirm whether mobile users need email verification. If yes, add API endpoints:
  - `POST /api/auth/verify-email` (submit OTP)
  - `POST /api/auth/verify-email/resend` (resend OTP)
  - `GET /api/auth/me` already returns `email_verified_at` -- mobile can read it.
- [ ] Confirm `bus_id` for location batch: does the mobile user select/own a bus, or should the backend derive it from the authenticated user?
- [ ] Document expected API response envelopes so mobile types can be kept in sync.
- [ ] Ensure CORS allows mobile origin (emulator IP / physical device IP / production domain).
- [ ] Confirm token lifetime for Sanctum tokens and decide if mobile needs a refresh flow.
