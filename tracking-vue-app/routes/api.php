<?php

use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\BusQueueController;
use App\Http\Controllers\Api\BusRouteController;
use App\Http\Controllers\Api\PassengerController;
use App\Http\Controllers\Api\TrackLogController;
use App\Http\Controllers\Api\TrackStopController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Authenticated user ─────────────────────────────────────────────────────────
Route::get('/user', fn (Request $request) => $request->user())
    ->middleware('auth:sanctum');

// ── Public API routes (No login required for Postman/Driver simulation) ────────
// Nilipat natin ito dito para hindi mag-redirect sa login page
// Authentication for mobile (token issuance)
Route::post('auth/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('auth/register', [AuthController::class, 'register'])->name('auth.register');

Route::post('buses/{bus}/logs',       [TrackLogController::class, 'store'])->name('buses.logs.store');
Route::get('buses/{bus}/logs/latest', [TrackLogController::class, 'latest'])->name('buses.logs.latest');


// ── Protected API routes (require login) ──────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    // ── Bus Routes (the physical transit routes) ───────────────────────────────
    Route::apiResource('routes', BusRouteController::class);

    // Stops nested under a route (index + store)
    Route::get('routes/{route}/stops',  [TrackStopController::class, 'index'])->name('routes.stops.index');
    Route::post('routes/{route}/stops', [TrackStopController::class, 'store'])->name('routes.stops.store');

    // Standalone stop actions (show, update, delete)
    Route::get('stops/{stop}',    [TrackStopController::class, 'show'])->name('stops.show');
    Route::put('stops/{stop}',    [TrackStopController::class, 'update'])->name('stops.update');
    Route::delete('stops/{stop}', [TrackStopController::class, 'destroy'])->name('stops.destroy');

    // ── Buses ──────────────────────────────────────────────────────────────────
    Route::apiResource('buses', BusController::class);
    Route::patch('buses/{bus}/status', [BusController::class, 'updateStatus'])->name('buses.status');
    Route::patch('buses/{bus}/stop',   [BusController::class, 'updateStop'])->name('buses.stop');

    // Bus queue management
    Route::get('buses/{bus}/queue',                         [BusQueueController::class, 'index'])->name('buses.queue.index');
    Route::post('buses/{bus}/queue',                        [BusQueueController::class, 'store'])->name('buses.queue.store');
    Route::delete('buses/{bus}/queue/{passenger}',         [BusQueueController::class, 'destroy'])->name('buses.queue.destroy');
    Route::patch('buses/{bus}/queue/{passenger}/board',    [BusQueueController::class, 'board'])->name('buses.queue.board');

    // Bus movement logs (Index only, store is now public)
    Route::get('buses/{bus}/logs', [TrackLogController::class, 'index'])->name('buses.logs.index');

    // Batch locations endpoint for mobile drivers
    Route::post('locations/batch', [TrackLogController::class, 'storeBatch'])->name('locations.batch');

    // Auth routes (token revocation + current user)
    Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');

    // ── Passengers ────────────────────────────────────────────────────────────
    Route::apiResource('passengers', PassengerController::class);
    Route::patch('passengers/{passenger}/status', [PassengerController::class, 'updateStatus'])->name('passengers.status');
    Route::patch('passengers/{passenger}/assign', [PassengerController::class, 'assign'])->name('passengers.assign');

    // ── Live Dashboard feed (all active buses latest position) ────────────────
    Route::get('live', [TrackLogController::class, 'liveAll'])->name('live');
});
