<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\BusQueueController;
use App\Http\Controllers\Api\BusRouteController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\TrackLogController;
use App\Http\Controllers\Api\TrackStopController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Roles:
|   admin    -> everything
|   operator -> buses, passengers, queues, location updates
|   user     -> view only (routes, stops, buses, live map)
*/

// ── Authenticated user ────────────────────────────────────────────────────────
Route::get('/user', fn (Request $request) => $request->user())
    ->middleware('auth:sanctum');

// ── Public routes (no login) ──────────────────────────────────────────────────
// Token login/register for the mobile app
Route::post('auth/login',    [AuthController::class, 'login'])->name('auth.login');
Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register');

// WARNING: these two are public for Postman/driver testing.
// Anyone who knows the URL can post fake locations. Protect them before going public.
Route::post('buses/{bus}/logs',       [TrackLogController::class, 'store'])->name('buses.logs.store');
Route::get('buses/{bus}/logs/latest', [TrackLogController::class, 'latest'])->name('buses.logs.latest');

// ── Protected routes (must be logged in) ──────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // ── Everyone logged in: view only ─────────────────────────────────────────
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('auth/me',      [AuthController::class, 'me'])->name('auth.me');

    Route::apiResource('routes', BusRouteController::class)->only(['index', 'show']);
    Route::get('routes/{route}/stops', [TrackStopController::class, 'index'])->name('routes.stops.index');
    Route::get('stops/{stop}',         [TrackStopController::class, 'show'])->name('stops.show');

    Route::apiResource('buses', BusController::class)->only(['index', 'show']);
    Route::get('buses/{bus}/logs', [TrackLogController::class, 'index'])->name('buses.logs.index');
    Route::get('live',             [TrackLogController::class, 'liveAll'])->name('live');

    // ── Admin + operator: daily operations ────────────────────────────────────
    Route::middleware('role:admin,operator')->group(function () {

        Route::apiResource('buses', BusController::class)->only(['store', 'update', 'destroy']);
        Route::patch('buses/{bus}/status', [BusController::class, 'updateStatus'])->name('buses.status');
        Route::patch('buses/{bus}/stop',   [BusController::class, 'updateStop'])->name('buses.stop');

        // Bus queue
        Route::get('buses/{bus}/queue',                     [BusQueueController::class, 'index'])->name('buses.queue.index');
        Route::post('buses/{bus}/queue',                    [BusQueueController::class, 'store'])->name('buses.queue.store');
        Route::delete('buses/{bus}/queue/{passenger}',      [BusQueueController::class, 'destroy'])->name('buses.queue.destroy');
        Route::patch('buses/{bus}/queue/{passenger}/board', [BusQueueController::class, 'board'])->name('buses.queue.board');

        // Batch locations from mobile drivers
        Route::post('locations/batch', [TrackLogController::class, 'storeBatch'])->name('locations.batch');

        // Passengers
        Route::apiResource('passengers', PassengerController::class);
        Route::patch('passengers/{passenger}/status', [PassengerController::class, 'updateStatus'])->name('passengers.status');
        Route::patch('passengers/{passenger}/assign', [PassengerController::class, 'assign'])->name('passengers.assign');
    });

    // ── Admin only: set up the network ────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('routes', BusRouteController::class)->except(['index', 'show']);
        Route::post('routes/{route}/stops', [TrackStopController::class, 'store'])->name('routes.stops.store');
        Route::put('stops/{stop}',          [TrackStopController::class, 'update'])->name('stops.update');
        Route::delete('stops/{stop}',       [TrackStopController::class, 'destroy'])->name('stops.destroy');
    });
});
