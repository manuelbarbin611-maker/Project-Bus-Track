<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── USERS (AUTH) ───────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verification_code', 6)->nullable();
            $table->timestamp('email_verification_code_expires_at')->nullable();
            $table->string('password');
            $table->string('role')->default('user'); // admin / operator
            $table->rememberToken();
            $table->timestamps();
        });

        // ── ROUTES ──────────────────────────────────────────
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // ── TRACK STOPS (waypoints on each route) ───────────
        Schema::create('track_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->cascadeOnDelete();
            $table->string('stop_name');
            $table->unsignedInteger('stop_order');
            $table->decimal('latitude',  10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['route_id', 'stop_order']);
        });

        // ── BUSES ────────────────────────────────────────────
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->foreignId('route_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('capacity')->default(50);
            $table->foreignId('current_stop_id')->nullable()
                  ->references('id')->on('track_stops')->nullOnDelete();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->timestamps();
        });

        // ── PASSENGERS ───────────────────────────────────────
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('status', ['waiting', 'onboarded', 'cancelled'])->default('waiting');
            $table->foreignId('assigned_bus_id')->nullable()
                  ->references('id')->on('buses')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
        });

        // ── BUS QUEUE ────────────────────────────────────────
        Schema::create('bus_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->cascadeOnDelete();
            $table->foreignId('passenger_id')->constrained('passengers')->cascadeOnDelete();
            $table->unsignedInteger('queue_order');
            $table->timestamp('queued_at')->useCurrent();

            $table->unique(['bus_id', 'passenger_id']);
            $table->unique(['bus_id', 'queue_order']);
        });

        // ── TRACK LOG (movement history) ─────────────────────
        Schema::create('track_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained('buses')->cascadeOnDelete();
            $table->foreignId('stop_id')->nullable()
                  ->references('id')->on('track_stops')->nullOnDelete();
            $table->string('stop_name')->nullable();
            $table->decimal('latitude',  10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('logged_at')->useCurrent();

            $table->index(['bus_id', 'logged_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('track_log');
        Schema::dropIfExists('bus_queue');
        Schema::dropIfExists('passengers');
        Schema::dropIfExists('buses');
        Schema::dropIfExists('track_stops');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('users'); 
    }
};