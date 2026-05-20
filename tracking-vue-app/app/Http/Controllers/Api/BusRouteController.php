<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusRoute;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusRouteController extends Controller
{
    /** GET /api/routes */
    public function index(): JsonResponse
    {
        $routes = BusRoute::withCount(['stops', 'buses'])->latest()->get();

        return response()->json(['data' => $routes]);
    }

    /** POST /api/routes */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:routes,name',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:draft,active',
        ]);
        
        // Default to draft if no status is provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'draft';
        }

        $route = BusRoute::create($validated);

        return response()->json(['data' => $route, 'message' => 'Route created successfully.'], 201);
    }

    /** GET /api/routes/{route} */
    public function show(BusRoute $route): JsonResponse
    {
        $route->load(['stops', 'buses.currentStop']);

        return response()->json(['data' => $route]);
    }

    /** PUT /api/routes/{route} */
    public function update(Request $request, BusRoute $route): JsonResponse
    {
        $validated = $request->validate([
            'name'        => "required|string|max:255|unique:routes,name,{$route->id}",
            'description' => 'nullable|string',
            'status'      => 'required|string|in:draft,active',
        ]);

        $route->update($validated);

        return response()->json(['data' => $route, 'message' => 'Route updated successfully.']);
    }

    /** DELETE /api/routes/{route} */
    public function destroy(BusRoute $route): JsonResponse
    {
        $route->delete();

        return response()->json(['message' => 'Route deleted successfully.']);
    }
}
