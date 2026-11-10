<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class DeveloperController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $apiKeys = ApiKey::where('user_id', $user->id)->orderBy('id', 'desc')->get();

        return Inertia::render('developer', [
            'apiKeys' => $apiKeys,
        ]);
    }

    public function generateKey(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user();

        $rawToken = 'cipher_live_' . Str::random(32);
        $prefix = substr($rawToken, 0, 16);

        $apiKey = ApiKey::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'key_prefix' => $prefix,
            'secret_hash' => Hash::make($rawToken),
            'is_active' => true,
        ]);

        return response()->json([
            'status' => 'success',
            'apiKey' => $apiKey,
            'rawToken' => $rawToken,
        ]);
    }

    public function revokeKey(ApiKey $apiKey): JsonResponse
    {
        $apiKey->update(['is_active' => false]);

        return response()->json([
            'status' => 'success',
            'message' => 'API Key revoked successfully',
        ]);
    }
}
