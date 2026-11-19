# Mobile Integration Session Notes

## Summary

This document summarizes the mobile-side integration work completed during the session.

## Completed Mobile Changes

### API base URL

The mobile app was configured to communicate with the backend over the local network:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.3:8000
```

This allows a physical phone running Expo Go on the same WiFi network to reach the Laravel backend running on the local PC.

### Authentication

Registration and login were validated against the Laravel backend.

Key fixes included:

- Registration payload now uses `password_confirmation`.
- Registration validates required fields, password match, and minimum length.
- Login now accepts backend response shape using `access_token`.
- Mobile API wrapper stores and sends the token for authenticated requests.

### Bus selection

The mobile bus selection page now fetches buses from the backend and stores the selected bus ID.

Key behavior:

- Fetches buses through `busService`.
- Reads backend response from `data.data`.
- Stores selected `busId` in `AuthContext`.
- Persists `busId` to `AsyncStorage` for background location tracking.

### Location tracking

The location service was updated to send backend-compatible location batches.

Payload shape:

```json
{
  "bus_id": 1,
  "locations": []
}
```

Key fixes:

- Location batches include `bus_id`.
- Background tasks read selected bus ID from AsyncStorage.
- Location service uses the shared API wrapper instead of raw `fetch`.

### Mobile UI fixes

The bus selection screen had a layout issue caused by the Expo Router tab bar being visible even though there was only one tab.

Fix:

```tsx
tabBarStyle: { display: 'none' }
```

This removed the unwanted bottom white strip and allowed the bus selection page to use the full visible height.

## Current Mobile Status

The mobile app can:

- Register users.
- Log users in.
- Fetch available buses.
- Let a driver select a bus.
- Persist selected `bus_id`.
- Send authenticated location batches with the correct payload shape.

## Manual Testing Still Needed

- Test location tracking on a real device while moving.
- Verify `/api/locations/batch` creates track log rows.
- Confirm selected bus ID persists after app restart.
