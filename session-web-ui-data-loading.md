# Web UI Data Loading Session Notes

## Summary

This document summarizes the web UI data-loading investigation and final architecture decision.

## Original Problem

After login, several web pages showed errors such as:

- `Failed to load routes. Please try again.`
- `Failed to load buses.`
- `Failed to load passengers.`
- `Failed to load stops.`

These were real request failures, not empty-data states.

## Cause

The web app uses Axios with this global configuration:

```js
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

That means web Vue calls such as:

```js
axios.get('/buses')
```

resolve to:

```text
/api/buses
```

This is intentional and supports the preferred shared API architecture.

## Temporary Approach Considered

A temporary `/web-api/...` route group was considered to separate web session JSON routes from mobile API routes.

This was rejected because it duplicates API surfaces and creates unnecessary divergence between web and mobile clients.

## Final Architecture Decision

Both clients should use the same shared API routes:

```text
/api/buses
/api/routes
/api/passengers
/api/live
```

### Web app

Uses Axios base URL:

```js
axios.defaults.baseURL = '/api';
```

So Vue pages should call:

```js
axios.get('/buses')
axios.get('/routes')
axios.get('/passengers')
axios.get('/live')
```

### Mobile app

Uses the configured API base URL:

```text
http://192.168.1.3:8000
```

and calls full API paths like:

```text
/api/buses
/api/locations/batch
```

## Auth Fix

The web app initially received 401 responses from `/api/...` routes.

The local environment was updated so Sanctum treats the browser origin as stateful:

```env
APP_URL=http://192.168.1.3:8000
SANCTUM_STATEFUL_DOMAINS=192.168.1.3:8000,localhost:8000,127.0.0.1:8000
SESSION_DOMAIN=192.168.1.3
```

The API routes remain protected by:

```php
Route::middleware(['auth:sanctum'])->group(function () {
```

## Final Status

The web app and mobile app are aligned on shared `/api` endpoints.

The web app should load data after:

```powershell
php artisan optimize:clear
php artisan serve --host=0.0.0.0
npm run build
```

Then hard refresh the browser and log in with a verified user such as:

```text
admin@busqueue.local / password
```
