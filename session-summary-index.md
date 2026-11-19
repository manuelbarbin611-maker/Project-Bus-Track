# Session Documentation Index

## Purpose

This folder contains focused documentation for the major work completed during the mobile/backend/web integration session.

## Documents

### Mobile Integration

File:

```text
docs/session-mobile-integration.md
```

Covers:

- Mobile API base URL configuration.
- Mobile login/register fixes.
- Bus selection flow.
- Location batch payload fixes.
- Mobile UI layout fixes.

### Backend Auth and API

File:

```text
docs/session-backend-auth-api.md
```

Covers:

- PHP/Laravel startup issues.
- Required PHP extensions.
- Laravel local network server binding.
- Sanctum token support.
- CORS setup.
- Shared `/api` architecture.

### Local Development Data

File:

```text
docs/session-local-development-data.md
```

Covers:

- Local development seeder.
- Seeded users, routes, stops, buses, passengers, queues, and track logs.
- How to run and verify seeded data.

### Web UI Data Loading

File:

```text
docs/session-web-ui-data-loading.md
```

Covers:

- Web data-loading failures.
- Axios global `/api` base URL.
- Rejected `/web-api` approach.
- Final shared API architecture.
- Sanctum stateful browser auth setup.

## Current Recommended Local Startup

### Backend

```powershell
cd C:\Users\Paul\Desktop\Project-Bus-Track\tracking-vue-app
php artisan optimize:clear
php artisan serve --host=0.0.0.0
```

### Web assets

```powershell
cd C:\Users\Paul\Desktop\Project-Bus-Track\tracking-vue-app
npm run build
```

### Mobile app

```powershell
cd C:\Users\Paul\Desktop\Project-Bus-Track\BusTrackMobile
npx expo start
```

## Test Accounts

```text
admin@busqueue.local / password
operator@busqueue.local / password
```

## Local URLs

```text
Backend/Web: http://192.168.1.3:8000
Mobile API:  http://192.168.1.3:8000
```
