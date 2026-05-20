<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use App\Models\TrackStop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrackStopController extends Controller
{
    /** GET /api/routes/{route}/stops */
    public function index(BusRoute $route): JsonResponse
    {
        $stops = $route->stops()->get(); // already ordered by stop_order

        return response()->json(['data' => $stops]);
    }

    /** POST /api/routes/{route}/stops */
    public function store(Request $request, BusRoute $route): JsonResponse
    {
        $validated = $request->validate([
            'stop_name'   => 'required|string|max:255',
            'stop_order'  => 'nullable|integer|min:1',
            'latitude'    => 'nullable|numeric|between:-90,90',
            'longitude'   => 'nullable|numeric|between:-180,180',
        ]);

        // Auto-assign stop_order if not provided
        if (empty($validated['stop_order'])) {
            $validated['stop_order'] = $route->stops()->max('stop_order') + 1;
        }

        $stop = $route->stops()->create($validated);

        return response()->json(['data' => $stop, 'message' => 'Stop added successfully.'], 201);
    }

    /** GET /api/stops/{stop} */
    public function show(TrackStop $stop): JsonResponse
    {
        $stop->load(['route', 'busesHere']);

        return response()->json(['data' => $stop]);
    }

    /** PUT /api/stops/{stop} */
    public function update(Request $request, TrackStop $stop): JsonResponse
    {
        $validated = $request->validate([
            'stop_name'  => 'sometimes|string|max:255',
            'stop_order' => 'sometimes|integer|min:1',
            'latitude'   => 'nullable|numeric|between:-90,90',
            'longitude'  => 'nullable|numeric|between:-180,180',
        ]);

        $stop->update($validated);

        return response()->json(['data' => $stop, 'message' => 'Stop updated successfully.']);
    }

    /** DELETE /api/stops/{stop} */
    public function destroy(TrackStop $stop): JsonResponse
    {
        $stop->delete();

        return response()->json(['message' => 'Stop deleted successfully.']);
    }
}
