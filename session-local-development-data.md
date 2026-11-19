# Local Development Data Session Notes

## Summary

This document summarizes the local development seeding work completed during the session.

## Problem

The mobile app and web app were working against the backend, but there was no useful test data in the database. This made bus selection and dashboard verification difficult.

## Solution

A local-only seeder was added:

```text
tracking-vue-app/database/seeders/LocalDevelopmentSeeder.php
```

The seeder is intended for local development/testing only.

## Seeded Data

The local seeder creates:

### Users

- `admin@busqueue.local`
- `operator@busqueue.local`

Password for both:

```text
password
```

Both users are marked as email-verified.

### Routes

- Route A
- Route B
- Route C

### Stops

Multiple track stops are created for each route, including sample latitude and longitude values.

### Buses

Sample buses include:

- Bus `101`
- Bus `202`
- Bus `303`

These buses are linked to routes and current stops.

### Passengers

Sample passengers are created with statuses such as:

- `waiting`
- `onboarded`
- `cancelled`

### Bus Queue

A few passengers are placed into sample bus queues.

### Track Logs

Sample track logs are created so live tracking/dashboard screens have location-like data to display.

## DatabaseSeeder Local Hook

`DatabaseSeeder.php` was updated so local environments call `LocalDevelopmentSeeder` instead of relying on direct insert seed logic.

The goal is to avoid duplicate rows and make local seeding repeatable.

## Running the Seeder

From `tracking-vue-app`:

```powershell
php artisan db:seed --class=LocalDevelopmentSeeder
```

Or, when `APP_ENV=local`:

```powershell
php artisan db:seed
```

## Verification

After seeding, these should show non-zero counts in Tinker:

```php
App\Models\Bus::count();
App\Models\BusRoute::count();
App\Models\Passenger::count();
```

The mobile bus selection screen should also show the seeded buses after reload.
