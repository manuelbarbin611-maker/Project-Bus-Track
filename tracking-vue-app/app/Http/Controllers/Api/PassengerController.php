<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PassengerController extends Controller
{
    /** GET /api/passengers */
    public function index(Request $request): JsonResponse
    {
        $query = Passenger::with('assignedBus');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('bus_id')) {
            $query->where('assigned_bus_id', $request->bus_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $passengers = $query->latest()->get();

        return response()->json(['data' => $passengers]);
    }

    /** POST /api/passengers */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:255',
            'last_name'       => 'required|string|max:255',
            'status'          => 'nullable|in:waiting,onboarded,cancelled',
            'assigned_bus_id' => 'nullable|exists:buses,id',
        ]);

        $passenger = Passenger::create($validated);
        $passenger->load('assignedBus');

        return response()->json(['data' => $passenger, 'message' => 'Passenger created successfully.'], 201);
    }

    /** GET /api/passengers/{passenger} */
    public function show(Passenger $passenger): JsonResponse
    {
        $passenger->load(['assignedBus.route', 'queueEntry']);

        return response()->json(['data' => $passenger]);
    }

    /** PUT /api/passengers/{passenger} */
    public function update(Request $request, Passenger $passenger): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
        ]);

        $passenger->update($validated);

        return response()->json(['data' => $passenger, 'message' => 'Passenger updated successfully.']);
    }

    /** DELETE /api/passengers/{passenger} */
    public function destroy(Passenger $passenger): JsonResponse
    {
        $passenger->delete();

        return response()->json(['message' => 'Passenger deleted successfully.']);
    }

    /**
     * PATCH /api/passengers/{passenger}/status
     * Update passenger status (waiting / onboarded / cancelled)
     */
    public function updateStatus(Request $request, Passenger $passenger): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:waiting,onboarded,cancelled',
        ]);

        $passenger->update($validated);

        return response()->json(['data' => $passenger, 'message' => "Passenger status changed to {$passenger->status}."]);
    }

    /**
     * PATCH /api/passengers/{passenger}/assign
     * Assign or unassign a passenger to/from a bus
     */
    public function assign(Request $request, Passenger $passenger): JsonResponse
    {
        $validated = $request->validate([
            'bus_id' => 'nullable|exists:buses,id',
        ]);

        $bus = null;
        if (!empty($validated['bus_id'])) {
            $bus = \App\Models\Bus::findOrFail($validated['bus_id']);
            if ($bus->availableSeats() <= 0) {
                return response()->json(['message' => 'Bus is at full capacity.'], 422);
            }
        }

        $passenger->update(['assigned_bus_id' => $validated['bus_id'] ?? null]);
        $passenger->load('assignedBus');

        $message = $validated['bus_id']
            ? "Passenger assigned to bus {$bus->bus_number}."
            : 'Passenger unassigned from bus.';

        return response()->json(['data' => $passenger, 'message' => $message]);
    }
}
