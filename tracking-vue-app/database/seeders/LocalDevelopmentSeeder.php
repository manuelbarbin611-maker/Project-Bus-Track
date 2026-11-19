<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\BusQueue;
use App\Models\BusRoute;
use App\Models\Passenger;
use App\Models\TrackLog;
use App\Models\TrackStop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class LocalDevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@busqueue.local'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'operator@busqueue.local'],
            [
                'name' => 'Bus Operator',
                'password' => Hash::make('password'),
                'role' => 'operator',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@busqueue.local'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        $routeA = BusRoute::updateOrCreate(
            ['name' => 'Route A'],
            ['description' => 'North Terminal → City Hall → South Station']
        );

        $routeB = BusRoute::updateOrCreate(
            ['name' => 'Route B'],
            ['description' => 'East Depot → Market → West End']
        );

        $routeC = BusRoute::updateOrCreate(
            ['name' => 'Route C'],
            ['description' => 'Airport → Mall → University']
        );

        $stops = [
            [$routeA->id, 'North Terminal', 1, 14.7010, 121.0437],
            [$routeA->id, 'Balintawak', 2, 14.6778, 121.0261],
            [$routeA->id, 'Monumento', 3, 14.6543, 120.9836],
            [$routeA->id, 'City Hall', 4, 14.5942, 120.9821],
            [$routeA->id, 'South Station', 5, 14.5600, 120.9800],
            [$routeB->id, 'East Depot', 1, 14.5995, 121.0845],
            [$routeB->id, 'Cubao', 2, 14.6177, 121.0531],
            [$routeB->id, 'Market', 3, 14.5890, 120.9785],
            [$routeB->id, 'West End', 4, 14.5555, 120.9700],
            [$routeC->id, 'Airport', 1, 14.5086, 121.0197],
            [$routeC->id, 'Mall of Asia', 2, 14.5354, 120.9832],
            [$routeC->id, 'University', 3, 14.6507, 121.0689],
        ];

        $createdStops = [];
        foreach ($stops as [$routeId, $name, $order, $latitude, $longitude]) {
            $createdStops[$name] = TrackStop::updateOrCreate(
                ['route_id' => $routeId, 'stop_order' => $order],
                [
                    'stop_name' => $name,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]
            );
        }

        $bus101 = Bus::updateOrCreate(
            ['bus_number' => '101'],
            ['route_id' => $routeA->id, 'capacity' => 50, 'current_stop_id' => $createdStops['Monumento']->id, 'status' => 'active']
        );

        $bus202 = Bus::updateOrCreate(
            ['bus_number' => '202'],
            ['route_id' => $routeB->id, 'capacity' => 45, 'current_stop_id' => $createdStops['Cubao']->id, 'status' => 'active']
        );

        $bus303 = Bus::updateOrCreate(
            ['bus_number' => '303'],
            ['route_id' => $routeC->id, 'capacity' => 40, 'current_stop_id' => $createdStops['Airport']->id, 'status' => 'maintenance']
        );

        $passengers = [
            ['John', 'Smith', 'waiting', null],
            ['Maria', 'Santos', 'onboarded', $bus101->id],
            ['Elena', 'Reyes', 'waiting', null],
            ['Aran', 'Cruz', 'onboarded', $bus202->id],
            ['Rilon', 'Dela Cruz', 'cancelled', null],
        ];

        $createdPassengers = [];
        foreach ($passengers as [$firstName, $lastName, $status, $assignedBusId]) {
            $createdPassengers[] = Passenger::updateOrCreate(
                ['first_name' => $firstName, 'last_name' => $lastName],
                ['status' => $status, 'assigned_bus_id' => $assignedBusId]
            );
        }

        BusQueue::updateOrCreate(['bus_id' => $bus101->id, 'passenger_id' => $createdPassengers[0]->id], ['queue_order' => 1, 'queued_at' => now()]);
        BusQueue::updateOrCreate(['bus_id' => $bus101->id, 'passenger_id' => $createdPassengers[2]->id], ['queue_order' => 2, 'queued_at' => now()]);
        BusQueue::updateOrCreate(['bus_id' => $bus202->id, 'passenger_id' => $createdPassengers[3]->id], ['queue_order' => 1, 'queued_at' => now()]);

        TrackLog::updateOrCreate(
            ['bus_id' => $bus101->id, 'logged_at' => now()->subMinutes(30)->seconds(0)],
            ['stop_id' => $createdStops['Monumento']->id, 'stop_name' => 'Monumento', 'latitude' => 14.6543, 'longitude' => 120.9836]
        );

        TrackLog::updateOrCreate(
            ['bus_id' => $bus202->id, 'logged_at' => now()->subMinutes(20)->seconds(0)],
            ['stop_id' => $createdStops['Cubao']->id, 'stop_name' => 'Cubao', 'latitude' => 14.6177, 'longitude' => 121.0531]
        );
    }
}
