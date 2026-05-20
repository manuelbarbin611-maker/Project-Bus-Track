<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\TrackLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusController extends Controller
{
    /** GET /api/buses */
    public function index(Request $request): JsonResponse
    {
        $query = Bus::with(['route', 'currentStop']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('route_id')) {
            $query->where('route_id', $request->route_id);
        }

        $buses = $query->latest()->get()->map(function (Bus $bus) {
            $bus->available_seats = $bus->availableSeats();
            return $bus;
        });

        return response()->json(['data' => $buses]);
    }

    /** POST /api/buses */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_number'      => 'required|string|max:50|unique:buses,bus_number',
            'route_id'        => 'nullable|exists:routes,id',
            'capacity'        => 'nullable|integer|min:1|max:200',
            'current_stop_id' => 'nullable|exists:track_stops,id',
            'status'          => 'nullable|in:active,inactive,maintenance',
        ]);

        $bus = Bus::create($validated);
        $bus->load(['route', 'currentStop']);

        return response()->json(['data' => $bus, 'message' => 'Bus created successfully.'], 201);
    }

    /** GET /api/buses/{bus} */
    public function show(Bus $bus): JsonResponse
    {
        $bus->load([
            'route.stops',
            'currentStop',
            'passengers',
            'queue.passenger',
        ]);
        $bus->available_seats = $bus->availableSeats();

        return response()->json(['data' => $bus]);
    }

    /** PUT /api/buses/{bus} */
    public function update(Request $request, Bus $bus): JsonResponse
    {
        $validated = $request->validate([
            'bus_number'      => "sometimes|string|max:50|unique:buses,bus_number,{$bus->id}",
            'route_id'        => 'nullable|exists:routes,id',
            'capacity'        => 'nullable|integer|min:1|max:200',
            'current_stop_id' => 'nullable|exists:track_stops,id',
            'status'          => 'nullable|in:active,inactive,maintenance',
        ]);

        $bus->update($validated);
        $bus->load(['route', 'currentStop']);

        return response()->json(['data' => $bus, 'message' => 'Bus updated successfully.']);
    }

    /** DELETE /api/buses/{bus} */
    public function destroy(Bus $bus): JsonResponse
    {
        $bus->delete();

        return response()->json(['message' => 'Bus deleted successfully.']);
    }

    /**
     * PATCH /api/buses/{bus}/status
     * Change bus operational status (active / inactive / maintenance)
     */
    public function updateStatus(Request $request, Bus $bus): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $bus->update($validated);

        return response()->json(['data' => $bus, 'message' => "Bus status changed to {$bus->status}."]);
    }

    /**
     * PATCH /api/buses/{bus}/stop
     * Move bus to a specific stop and log the movement.
     */
    public function updateStop(Request $request, Bus $bus): JsonResponse
    {
        $validated = $request->validate([
            'stop_id'   => 'nullable|exists:track_stops,id',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $stopName = null;
        if (!empty($validated['stop_id'])) {
            $stop = \App\Models\TrackStop::findOrFail($validated['stop_id']);
            $stopName = $stop->stop_name;

            // Verify stop belongs to bus's route
            if ($bus->route_id && $stop->route_id !== $bus->route_id) {
                return response()->json(['message' => 'Stop does not belong to this bus\'s route.'], 422);
            }
        }

        // Update current stop on bus
        $bus->update(['current_stop_id' => $validated['stop_id'] ?? null]);

        // Log the movement
        TrackLog::create([
            'bus_id'    => $bus->id,
            'stop_id'   => $validated['stop_id'] ?? null,
            'stop_name' => $stopName,
            'latitude'  => $validated['latitude'] ?? ($bus->currentStop?->latitude),
            'longitude' => $validated['longitude'] ?? ($bus->currentStop?->longitude),
        ]);

        $bus->load('currentStop');

        return response()->json(['data' => $bus, 'message' => 'Bus location updated and logged.']);
    }
}
