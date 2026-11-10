<?php

namespace App\Http\Controllers;

use App\Models\TempEmail;
use App\Services\TempEmailService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class TempEmailController extends Controller
{
    protected TempEmailService $tempEmailService;

    public function __construct(TempEmailService $tempEmailService)
    {
        $this->tempEmailService = $tempEmailService;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $activeEmail = TempEmail::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->orderBy('id', 'desc')
            ->first();

        $messages = $activeEmail ? $this->tempEmailService->checkMessages($activeEmail) : [];

        return Inertia::render('services/temp-email', [
            'activeEmail' => $activeEmail,
            'messages' => $messages,
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $user = $request->user();

        $email = $this->tempEmailService->generateEmail($user);
        $messages = $this->tempEmailService->checkMessages($email);

        return response()->json([
            'status' => 'success',
            'email' => $email,
            'messages' => $messages,
        ]);
    }

    public function checkMessages(TempEmail $tempEmail): JsonResponse
    {
        $messages = $this->tempEmailService->checkMessages($tempEmail);

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
        ]);
    }
}
