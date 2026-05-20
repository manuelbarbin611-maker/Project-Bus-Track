<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// ── Authenticated + Verified ──────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
        ->name('dashboard');

    // ── Bus Routes ────────────────────────────────────────────────────────────
    Route::prefix('routes')->name('routes.')->group(function () {
        Route::get('',           fn () => Inertia::render('Routes/Index'))->name('index');
        Route::get('/create',    fn () => Inertia::render('Routes/Create'))->name('create');
        Route::get('/{id}',      fn ($id) => Inertia::render('Routes/Show',  ['routeId' => $id]))->name('show');
        Route::get('/{id}/edit', fn ($id) => Inertia::render('Routes/Edit',  ['routeId' => $id]))->name('edit');
    });

    // ── Buses ─────────────────────────────────────────────────────────────────
    Route::prefix('buses')->name('buses.')->group(function () {
        Route::get('',           fn () => Inertia::render('Buses/Index'))->name('index');
        Route::get('/create',    fn () => Inertia::render('Buses/Create'))->name('create');
        Route::get('/{id}',      fn ($id) => Inertia::render('Buses/Show',  ['busId' => $id]))->name('show');
        Route::get('/{id}/edit', fn ($id) => Inertia::render('Buses/Edit',  ['busId' => $id]))->name('edit');
    });

    // ── Passengers ────────────────────────────────────────────────────────────
    Route::prefix('passengers')->name('passengers.')->group(function () {
        Route::get('',           fn () => Inertia::render('Passengers/Index'))->name('index');
        Route::get('/create',    fn () => Inertia::render('Passengers/Create'))->name('create');
        Route::get('/{id}',      fn ($id) => Inertia::render('Passengers/Show', ['passengerId' => $id]))->name('show');
        Route::get('/{id}/edit', fn ($id) => Inertia::render('Passengers/Edit', ['passengerId' => $id]))->name('edit');
    });

    // ── Track Stops ───────────────────────────────────────────────────────────
    Route::prefix('stops')->name('stops.')->group(function () {
        Route::get('', fn () => Inertia::render('Stops/Index'))->name('index');
    });

    // ── Live Tracking ─────────────────────────────────────────────────────────
    Route::get('/tracking', fn () => Inertia::render('Tracking/Live'))->name('tracking.live');

    // ── Profile ───────────────────────────────────────────────────────────────
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/',    [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/',  [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });
});

require __DIR__ . '/auth.php';