# Backend API Endpoints - Driver Mobile

This document lists all backend endpoints currently used by the Driver Mobile app.

## Base URL
Configured in `app/lib/config.ts` as `API_BASE_URL`.

## Authentication

### POST /api/auth/login
Login endpoint to obtain authentication token.
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`
- **Service**: `auth.ts`

### POST /api/auth/register
Register a new user.
- **Body**: `{ name, email, password, password_confirmation }`
- **Response**: `{ token, user }`
- **Service**: `auth.ts`

### POST /api/auth/logout
Logout and revoke token.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`
- **Service**: `auth.ts`

### GET /api/auth/me
Get current authenticated user.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ user }`
- **Service**: `auth.ts`

## Routes

### GET /api/routes
Get all routes with stops and buses count.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Route[] }`
- **Service**: `routeService.ts` - `getRoutes()`

### GET /api/routes/{routeId}
Get a specific route with stops and buses.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Route }`
- **Service**: `routeService.ts` - `getRoute(routeId)`

### POST /api/routes
Create a new route.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ name, description?, status? }`
- **Response**: `{ data: Route, message }`
- **Service**: `routeService.ts` - `createRoute(data)`

### PUT /api/routes/{routeId}
Update a route.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ name, description?, status }`
- **Response**: `{ data: Route, message }`
- **Service**: `routeService.ts` - `updateRoute(routeId, data)`

### DELETE /api/routes/{routeId}
Delete a route.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`
- **Service**: `routeService.ts` - `deleteRoute(routeId)`

## Stops

### GET /api/routes/{routeId}/stops
Get all stops for a specific route (ordered by stop_order).
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Stop[] }`
- **Service**: `stopService.ts` - `getRouteStops(routeId)`

### GET /api/stops/{stopId}
Get a specific stop with route and buses at that stop.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Stop }`
- **Service**: `stopService.ts` - `getStop(stopId)`

### PUT /api/stops/{stopId}
Update a stop.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ stop_name?, stop_order?, latitude?, longitude? }`
- **Response**: `{ data: Stop, message }`
- **Service**: `stopService.ts` - `updateStop(stopId, data)`

### DELETE /api/stops/{stopId}
Delete a stop.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`
- **Service**: `stopService.ts` - `deleteStop(stopId)`

## Track Logs (Location History)

### GET /api/buses/{busId}/logs
Get movement history for a bus (paginated, newest first).
- **Headers**: `Authorization: Bearer {token}`
- **Query**: `?date={YYYY-MM-DD}&per_page={number}`
- **Response**: `{ data: TrackLog[], current_page, last_page, per_page, total }`
- **Service**: `trackLogService.ts` - `getBusLogs(busId, date?)`

### GET /api/buses/{busId}/logs/latest
Get the single most recent log entry for a bus (live location).
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: TrackLog }`
- **Service**: `trackLogService.ts` - `getBusLatestLog(busId)`

### GET /api/live
Get latest log entry for ALL active buses (live dashboard feed).
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: LiveBusData[] }`
- **Service**: `trackLogService.ts` - `getLiveBuses()`

### POST /api/buses/{busId}/logs
Log the current bus position / stop.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ stop_id?, stop_name?, latitude?, longitude? }`
- **Response**: `{ data: TrackLog, message }`
- **Service**: `trackLogService.ts` - `createTrackLog(busId, data)`

### POST /api/locations/batch
Accepts a batch of location points for mobile drivers.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ bus_id, locations: [{ latitude, longitude, accuracy?, timestamp?, stop_id?, stop_name? }] }`
- **Response**: `{ message, count }`
- **Service**: `trackLogService.ts` - `sendLocationBatch(busId, locations)`
- **Note**: Also used by `locationService.ts` for background location tracking

## Passengers

### GET /api/passengers
Get all passengers with optional filters.
- **Headers**: `Authorization: Bearer {token}`
- **Query**: `?status={waiting|onboarded|cancelled}&bus_id={number}&search={string}`
- **Response**: `{ data: Passenger[] }`
- **Service**: `passengerService.ts` - `getPassengers(params?)`

### GET /api/passengers/{passengerId}
Get a specific passenger with assigned bus and queue entry.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Passenger }`
- **Service**: `passengerService.ts` - `getPassenger(passengerId)`

### POST /api/passengers
Create a new passenger.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ first_name, last_name, status?, assigned_bus_id? }`
- **Response**: `{ data: Passenger, message }`
- **Service**: `passengerService.ts` - `createPassenger(data)`

### PUT /api/passengers/{passengerId}
Update a passenger.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ first_name?, last_name? }`
- **Response**: `{ data: Passenger, message }`
- **Service**: `passengerService.ts` - `updatePassenger(passengerId, data)`

### DELETE /api/passengers/{passengerId}
Delete a passenger.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`
- **Service**: `passengerService.ts` - `deletePassenger(passengerId)`

### PATCH /api/passengers/{passengerId}/status
Update passenger status.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ status: 'waiting' | 'onboarded' | 'cancelled' }`
- **Response**: `{ data: Passenger, message }`
- **Service**: `passengerService.ts` - `updatePassengerStatus(passengerId, status)`

### PATCH /api/passengers/{passengerId}/assign
Assign or unassign a passenger to/from a bus.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ bus_id: number | null }`
- **Response**: `{ data: Passenger, message }`
- **Service**: `passengerService.ts` - `assignPassengerToBus(passengerId, busId)`

## Buses

### GET /api/buses
Get all buses.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Bus[] }`
- **Service**: `busService.ts` - `getBuses()`

### GET /api/buses/{busId}
Get a specific bus.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: Bus }`
- **Service**: `busService.ts` - `getBus(busId)`

### PATCH /api/buses/{busId}/status
Update bus status.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ status: 'active' | 'inactive' | 'maintenance' }`
- **Response**: `{ data: Bus, message }`
- **Service**: `busService.ts` - `updateBusStatus(busId, status)`

### PATCH /api/buses/{busId}/stop
Update bus current stop.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ stop_id: number | null, latitude?, longitude? }`
- **Response**: `{ data: Bus, message }`
- **Service**: `busService.ts` - `updateBusStop(busId, stopId, latitude?, longitude?)`

## Queue

### GET /api/buses/{busId}/queue
Get queue for a specific bus.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: QueueEntry[] }`
- **Service**: `queueService.ts` - `getBusQueue(busId)`

### POST /api/buses/{busId}/queue
Add passenger to bus queue.
- **Headers**: `Authorization: Bearer {token}`
- **Body**: `{ passenger_id }`
- **Response**: `{ data: QueueEntry, message }`
- **Service**: Not yet implemented in mobile services

### DELETE /api/buses/{busId}/queue/{passengerId}
Remove passenger from bus queue.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ message }`
- **Service**: Not yet implemented in mobile services

### PATCH /api/buses/{busId}/queue/{passengerId}/board
Mark passenger as boarded from queue.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ data: QueueEntry, message }`
- **Service**: Not yet implemented in mobile services

## Response Format

All endpoints return JSON responses with the following structure:

### Success Response
```typescript
{
  data: T,
  message?: string
}
```

### Paginated Response
```typescript
{
  data: T[],
  current_page: number,
  last_page: number,
  per_page: number,
  total: number,
  from?: number,
  to?: number
}
```

### Error Response
```typescript
{
  status: number,
  data: {
    message?: string,
    [key: string]: any
  }
}
```

## Authentication

All protected endpoints require an authentication token in the Authorization header:
```
Authorization: Bearer {token}
```

The token is obtained from the `/api/auth/login` endpoint and stored in SecureStore on the device.
