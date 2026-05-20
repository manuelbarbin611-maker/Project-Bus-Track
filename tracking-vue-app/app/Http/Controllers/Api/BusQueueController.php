<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\BusQueue;
use App\Models\Passenger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusQueueController extends Controller
{
    /** GET /api/buses/{bus}/queue */
    public function index(Bus $bus): JsonResponse
    {
        $queue = $bus->queue()->with('passenger')->get();

        return response()->json([
            'data'            => $queue,
            'total'           => $queue->count(),
            'available_seats' => $bus->availableSeats(),
        ]);
    }

    /**
     * POST /api/buses/{bus}/queue
     * Add a passenger to the bus queue
     */
    public function store(Request $request, Bus $bus): JsonResponse
    {
        $validated = $request->validate([
            'passenger_id' => 'required|exists:passengers,id',
        ]);

        // Prevent duplicate queue entry
        $alreadyQueued = BusQueue::where('bus_id', $bus->id)
                                 ->where('passenger_id', $validated['passenger_id'])
                                 ->exists();

        if ($alreadyQueued) {
            return response()->json(['message' => 'Passenger is already in this bus queue.'], 422);
        }

        // Auto-assign next queue_order
        $nextOrder = BusQueue::where('bus_id', $bus->id)->max('queue_order') + 1;

        $entry = BusQueue::create([
            'bus_id'       => $bus->id,
            'passenger_id' => $validated['passenger_id'],
            'queue_order'  => $nextOrder,
        ]);

        // Update passenger status to waiting + assign to this bus
        Passenger::where('id', $validated['passenger_id'])->update([
            'status'          => 'waiting',
            'assigned_bus_id' => $bus->id,
        ]);

        $entry->load('passenger');

        return response()->json(['data' => $entry, 'message' => 'Passenger added to queue.'], 201);
    }

    /**
     * DELETE /api/buses/{bus}/queue/{passenger}
     * Remove a passenger from the queue
     */
    public function destroy(Bus $bus, Passenger $passenger): JsonResponse
    {
        $entry = BusQueue::where('bus_id', $bus->id)
                         ->where('passenger_id', $passenger->id)
                         ->firstOrFail();

        $removedOrder = $entry->queue_order;
        $entry->delete();

        // Re-number queue entries after the removed one
        BusQueue::where('bus_id', $bus->id)
                ->where('queue_order', '>', $removedOrder)
                ->decrement('queue_order');

        // Reset passenger status back to waiting (unassigned from bus)
        $passenger->update([
            'status'          => 'waiting',
            'assigned_bus_id' => null,
        ]);

        return response()->json(['message' => 'Passenger removed from queue.']);
    }

    /**
     * PATCH /api/buses/{bus}/queue/{passenger}/board
     * Mark next passenger as onboarded
     */
    public function board(Bus $bus, Passenger $passenger): JsonResponse
    {
        if ($bus->availableSeats() <= 0) {
            return response()->json(['message' => 'Bus is at full capacity.'], 422);
        }

        $entry = BusQueue::where('bus_id', $bus->id)
                         ->where('passenger_id', $passenger->id)
                         ->firstOrFail();

        // Remove from queue
        $removedOrder = $entry->queue_order;
        $entry->delete();

        // Re-number remaining queue
        BusQueue::where('bus_id', $bus->id)
                ->where('queue_order', '>', $removedOrder)
                ->decrement('queue_order');

        // Mark passenger as onboarded
        $passenger->update([
            'status'          => 'onboarded',
            'assigned_bus_id' => $bus->id,
        ]);

        return response()->json(['data' => $passenger, 'message' => 'Passenger boarded successfully.']);
    }
}
