# Backend Auth and API Session Notes

## Summary

This document summarizes backend authentication, API, and local network fixes completed during the session.

## PHP/Laravel Startup Issues

The backend initially failed due to missing PHP extensions.

Required extensions enabled:

- `fileinfo`
- `pdo_sqlite`
- `sqlite3`

These were required for Composer dependencies and SQLite database access.

## Laravel Server Binding

The Laravel server originally ran on `127.0.0.1`, which made it inaccessible from a phone on the local network.

Correct command for physical-device testing:

```powershell
php artisan serve --host=0.0.0.0
```

This allows the phone to reach the backend via:

```text
http://192.168.1.3:8000
```

## Sanctum Token Support

Registration failed because the `User` model was missing Sanctum token support.

Fix added to `App\Models\User`:

```php
use Laravel\Sanctum\HasApiTokens;

use HasFactory, Notifiable, HasApiTokens;
```

The missing `personal_access_tokens` table was fixed by publishing/running Sanctum migrations.

## API Response Shape

The Laravel auth API returns:

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "user": {}
}
```

The mobile app was updated to check `access_token` instead of only `token`.

## CORS

CORS was configured permissively for local development.

A `config/cors.php` file was created with permissive local settings:

- all origins
- all methods
- all headers

`HandleCors` was also added to the API middleware stack.

## Stateful Web API Access

The web app uses Axios with:

```js
axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
```

The intended architecture is for both web and mobile to use shared `/api/...` routes.

Local `.env` was updated for local network web access:

```env
APP_URL=http://192.168.1.3:8000
SANCTUM_STATEFUL_DOMAINS=192.168.1.3:8000,localhost:8000,127.0.0.1:8000
SESSION_DOMAIN=192.168.1.3
```

## Current Backend API Status

The backend now supports:

- Mobile token login/register.
- Web session-authenticated API access through Sanctum stateful requests.
- Shared `/api` routes for both clients.
- Local network access from physical devices.
