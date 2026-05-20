<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\TrackLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackLogController extends Controller
{
    /**
     * GET /api/buses/{bus}/logs
     * Get movement history for a bus (newest first, paginated)
     */
    public function index(Request $request, Bus $bus): JsonResponse
    {
        $logs = $bus->trackLogs()
                    ->with('stop')
                    ->when($request->filled('date'), fn ($q) =>
                        $q->whereDate('logged_at', $request->date)
                    )
                    ->paginate($request->integer('per_page', 20));

        return response()->json($logs);
    }

    /**
     * POST /api/buses/{bus}/logs
     * Log the current bus position / stop.
     * Called by the driver app or GPS device.
     */
    public function store(Request $request, Bus $bus): JsonResponse
    {
        $validated = $request->validate([
            'stop_id'   => 'nullable|exists:track_stops,id',
            'stop_name' => 'nullable|string|max:255',
            'latitude'  => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Resolve stop_name from stop_id if not provided
        if (!empty($validated['stop_id']) && empty($validated['stop_name'])) {
            $stop = \App\Models\TrackStop::find($validated['stop_id']);
            $validated['stop_name'] = $stop?->stop_name;
        }

        $log = TrackLog::create(array_merge($validated, ['bus_id' => $bus->id]));

        // Also update the bus's current_stop_id if a stop was provided
        if (!empty($validated['stop_id'])) {
            $bus->update(['current_stop_id' => $validated['stop_id']]);
        }

        $log->load('stop');

        return response()->json(['data' => $log, 'message' => 'Location logged successfully.'], 201);
    }

    /**
     * GET /api/buses/{bus}/logs/latest
     * Get the single most recent log entry for a bus (live location)
     */
    public function latest(Bus $bus): JsonResponse
    {
        $log = $bus->trackLogs()->with('stop')->first();

        if (!$log) {
            return response()->json(['message' => 'No location data available for this bus.'], 404);
        }

        return response()->json(['data' => $log]);
    }

    /**
     * GET /api/track-logs
     * Get latest log entry for ALL active buses (live dashboard feed)
     */
    public function liveAll(): JsonResponse
    {
        $buses = Bus::where('status', 'active')
                    ->with(['currentStop', 'route',
                        'trackLogs' => fn ($q) => $q->with('stop')->limit(1)
                    ])
                    ->get()
                    ->map(function (Bus $bus) {
                        return [
                            'bus_id'       => $bus->id,
                            'bus_number'   => $bus->bus_number,
                            'status'       => $bus->status,
                            'route'        => $bus->route?->name,
                            'current_stop' => $bus->currentStop?->stop_name,
                            'last_log'     => $bus->trackLogs->first(),
                        ];
                    });

        return response()->json(['data' => $buses]);
    }

    /**
     * POST /api/locations/batch
     * Accepts a batch of location points and persists them.
     * Expected payload: { bus_id: int, locations: [{ latitude, longitude, accuracy?, timestamp? , stop_id?, stop_name? }, ...] }
     */
    public function storeBatch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bus_id'    => 'required|exists:buses,id',
            'locations' => 'required|array|min:1',
            'locations.*.latitude'  => 'required|numeric|between:-90,90',
            'locations.*.longitude' => 'required|numeric|between:-180,180',
            'locations.*.accuracy'  => 'nullable|numeric',
            'locations.*.timestamp' => 'nullable|date_format:c',
            'locations.*.stop_id'   => 'nullable|exists:track_stops,id',
            'locations.*.stop_name' => 'nullable|string|max:255',
        ]);

        $bus = Bus::findOrFail($validated['bus_id']);

        $rows = [];
        foreach ($validated['locations'] as $loc) {
            $rows[] = [
                'bus_id'    => $bus->id,
                'stop_id'   => $loc['stop_id'] ?? null,
                'stop_name' => $loc['stop_name'] ?? null,
                'latitude'  => $loc['latitude'],
                'longitude' => $loc['longitude'],
                'logged_at' => isset($loc['timestamp']) ? date('Y-m-d H:i:s', strtotime($loc['timestamp'])) : now(),
            ];
        }

        // Insert in a single query for efficiency
        \DB::table('track_log')->insert($rows);

        // If any location included a stop_id, update the bus current_stop_id to the last provided one
        $lastStop = collect($validated['locations'])->pluck('stop_id')->filter()->last();
        if ($lastStop) {
            $bus->update(['current_stop_id' => $lastStop]);
        }

        return response()->json(['message' => 'Batch locations persisted', 'count' => count($rows)], 201);
    }
}
