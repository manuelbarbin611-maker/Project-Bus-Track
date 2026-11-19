<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if ($this->command?->option('class') !== LocalDevelopmentSeeder::class && app()->environment('local')) {
            $this->call(LocalDevelopmentSeeder::class);
            return;
        }

        // ── 1. USERS (admin + operator) ─────────────────────
        User::updateOrCreate(
            ['email' => 'admin@busqueue.local'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'operator@busqueue.local'],
            [
                'name' => 'Bus Operator',
                'password' => Hash::make('password'),
                'role' => 'operator',
            ]
        );

        // ── 2. ROUTES ────────────────────────────────────────
        DB::table('routes')->insert([
            ['name' => 'Route A', 'description' => 'North Terminal → City Hall → South Station', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Route B', 'description' => 'East Depot → Market → West End', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Route C', 'description' => 'Airport → Mall → University', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 3. TRACK STOPS ───────────────────────────────────
        $stops = [
            [1, 'North Terminal',  1, 14.7010, 121.0437],
            [1, 'Balintawak',      2, 14.6778, 121.0261],
            [1, 'Monumento',       3, 14.6543, 120.9836],
            [1, 'Blumentritt',     4, 14.6280, 120.9836],
            [1, 'Doroteo Jose',    5, 14.6097, 120.9822],
            [1, 'City Hall',       6, 14.5942, 120.9821],
            [1, 'Central Station', 7, 14.5872, 120.9805],
            [1, 'South Station',   8, 14.5600, 120.9800],

            [2, 'East Depot',      1, 14.5995, 121.0845],
            [2, 'Cubao',           2, 14.6177, 121.0531],
            [2, 'Quiapo',          3, 14.5987, 120.9839],
            [2, 'Market',          4, 14.5890, 120.9785],
            [2, 'Paco',            5, 14.5736, 120.9853],
            [2, 'West End',        6, 14.5555, 120.9700],

            [3, 'Airport',         1, 14.5086, 121.0197],
            [3, 'Pasay',           2, 14.5378, 121.0014],
            [3, 'Mall of Asia',    3, 14.5354, 120.9832],
            [3, 'Buendia',         4, 14.5545, 121.0228],
            [3, 'Makati',          5, 14.5547, 121.0244],
            [3, 'University',      6, 14.6507, 121.0689],
        ];

        foreach ($stops as [$routeId, $name, $order, $lat, $lng]) {
            DB::table('track_stops')->insert([
                'route_id'   => $routeId,
                'stop_name'  => $name,
                'stop_order' => $order,
                'latitude'   => $lat,
                'longitude'  => $lng,
                'created_at' => now(),
            ]);
        }

        // ── 4. BUSES ─────────────────────────────────────────
        DB::table('buses')->insert([
            ['bus_number' => '101', 'route_id' => 1, 'capacity' => 50, 'current_stop_id' => 3,  'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['bus_number' => '202', 'route_id' => 2, 'capacity' => 50, 'current_stop_id' => 10, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
            ['bus_number' => '103', 'route_id' => 3, 'capacity' => 50, 'current_stop_id' => 15, 'status' => 'active', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 5. PASSENGERS ────────────────────────────────────
        DB::table('passengers')->insert([
            ['first_name' => 'John',  'last_name' => 'Smith',     'status' => 'waiting',    'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'John',  'last_name' => 'Name',      'status' => 'onboarded',  'assigned_bus_id' => 1,    'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'Elion', 'last_name' => 'Name',      'status' => 'cancelled',  'assigned_bus_id' => 2,    'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'Mary',  'last_name' => 'Nava',      'status' => 'onboarded',  'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'John',  'last_name' => 'Drominson', 'status' => 'cancelled',  'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'Aran',  'last_name' => 'Hava',      'status' => 'waiting',    'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'Rilon', 'last_name' => 'Name',      'status' => 'waiting',    'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
            ['first_name' => 'Mary',  'last_name' => 'Dtonson',   'status' => 'waiting',    'assigned_bus_id' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── 6. BUS QUEUE ─────────────────────────────────────
        DB::table('bus_queue')->insert([
            ['bus_id' => 1, 'passenger_id' => 1, 'queue_order' => 1, 'queued_at' => now()],
            ['bus_id' => 1, 'passenger_id' => 2, 'queue_order' => 2, 'queued_at' => now()],
            ['bus_id' => 1, 'passenger_id' => 6, 'queue_order' => 3, 'queued_at' => now()],
            ['bus_id' => 1, 'passenger_id' => 7, 'queue_order' => 4, 'queued_at' => now()],

            ['bus_id' => 2, 'passenger_id' => 3, 'queue_order' => 1, 'queued_at' => now()],
            ['bus_id' => 2, 'passenger_id' => 4, 'queue_order' => 2, 'queued_at' => now()],
            ['bus_id' => 2, 'passenger_id' => 8, 'queue_order' => 3, 'queued_at' => now()],
        ]);

        // ── 7. TRACK LOG ─────────────────────────────────────
        DB::table('track_log')->insert([
            ['bus_id' => 1, 'stop_id' => 1, 'stop_name' => 'North Terminal', 'latitude' => 14.7010, 'longitude' => 121.0437, 'logged_at' => now()->subMinutes(60)],
            ['bus_id' => 1, 'stop_id' => 2, 'stop_name' => 'Balintawak',     'latitude' => 14.6778, 'longitude' => 121.0261, 'logged_at' => now()->subMinutes(45)],
            ['bus_id' => 1, 'stop_id' => 3, 'stop_name' => 'Monumento',      'latitude' => 14.6543, 'longitude' => 120.9836, 'logged_at' => now()->subMinutes(30)],
            ['bus_id' => 2, 'stop_id' => 9, 'stop_name' => 'East Depot',     'latitude' => 14.5995, 'longitude' => 121.0845, 'logged_at' => now()->subMinutes(90)],
            ['bus_id' => 2, 'stop_id' => 10,'stop_name' => 'Cubao',          'latitude' => 14.6177, 'longitude' => 121.0531, 'logged_at' => now()->subMinutes(60)],
            ['bus_id' => 3, 'stop_id' => 15,'stop_name' => 'Airport',        'latitude' => 14.5086, 'longitude' => 121.0197, 'logged_at' => now()->subMinutes(20)],
        ]);
    }
}