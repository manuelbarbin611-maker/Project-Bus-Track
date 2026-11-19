<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email'    => ['required', 'email'],
                'password' => ['required'],
            ]);

            Log::info('Login attempt', ['email' => $credentials['email']]);

            if (! Auth::attempt($credentials)) {
                Log::warning('Login failed: Invalid credentials', ['email' => $credentials['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            $user  = Auth::user();
            $token = $user->createToken('mobile')->plainTextToken;

            Log::info('Login successful', ['user_id' => $user->id, 'email' => $user->email]);

            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Login failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        try {
            Log::info('Registration attempt', [
                'name'  => $request->input('name'),
                'email' => $request->input('email'),
            ]);

            $data = $request->validate([
                'name'     => ['required', 'string', 'max:255'],
                'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'user', // always a regular user; never taken from the request
            ]);

            $token = $user->createToken('mobile')->plainTextToken;

            Log::info('Registration successful', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'name'    => $user->name,
            ]);

            return response()->json([
                'access_token' => $token,
                'token_type'   => 'Bearer',
                'user'         => $user,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Registration validation failed', [
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Registration error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            // Revoke current access token
            $token = $user->currentAccessToken();
            if ($token) $token->delete();
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }
}
