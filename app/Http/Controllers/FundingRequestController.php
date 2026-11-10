<?php

namespace App\Http\Controllers;

use App\Models\FundingRequest;
use App\Models\Account;
use App\Services\AuditLogService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class FundingRequestController extends Controller
{
    protected WalletService $walletService;
    protected AuditLogService $auditLogService;

    public function __construct(WalletService $walletService, AuditLogService $auditLogService)
    {
        $this->walletService = $walletService;
        $this->auditLogService = $auditLogService;
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:100'],
            'currency_code' => ['required', 'string', 'in:NGN,USD'],
            'bank_name' => ['required', 'string', 'max:100'],
            'sender_name' => ['required', 'string', 'max:100'],
            'transaction_reference' => ['required', 'string', 'max:100'],
            'proof_note' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $account = $user->account;

        $fundingReq = FundingRequest::create([
            'user_id' => $user->id,
            'account_id' => $account ? $account->id : null,
            'public_reference' => 'FREQ-' . strtoupper(\Illuminate\Support\Str::random(10)),
            'provider' => 'manual',
            'amount' => $validated['amount'],
            'currency_code' => $validated['currency_code'],
            'sender_bank_name' => $validated['bank_name'],
            'sender_name' => $validated['sender_name'],
            'provider_reference' => $validated['transaction_reference'],
            'proof_path' => $validated['proof_note'] ?? null,
            'status' => 'pending',
        ]);

        $this->auditLogService->logUser(
            'funding_request_submitted',
            FundingRequest::class,
            $fundingReq->id,
            $validated['transaction_reference'],
            'Manual bank transfer receipt submitted by user',
            ['amount' => $validated['amount'], 'currency' => $validated['currency_code']]
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Manual funding transfer receipt submitted! Pending admin verification.',
                'fundingRequest' => $fundingReq,
            ]);
        }

        return back()->with('success', 'Manual transfer receipt submitted successfully for verification!');
    }

    public function approve(Request $request, FundingRequest $funding_request): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        if ($funding_request->status !== 'pending') {
            return back()->withErrors(['message' => 'Funding request has already been processed.']);
        }

        $user = $funding_request->user;
        $account = Account::where('user_id', $user->id)->first();
        if (!$account) {
            $account = Account::create([
                'user_id' => $user->id,
                'public_reference' => 'ACC-' . strtoupper(\Illuminate\Support\Str::random(10)),
                'available_balance' => 0.00,
                'ledger_balance' => 0.00,
                'total_deposit' => 0.00,
                'status' => 'active',
            ]);
        }

        // Credit user wallet
        $this->walletService->creditWallet(
            $account,
            (float) $funding_request->amount,
            $funding_request->currency_code,
            'manual_deposit',
            "Manual bank transfer approved: {$funding_request->provider_reference}",
            'DEP-MANUAL-' . $funding_request->id,
            'funding_req_cr_' . $funding_request->id,
            ['admin_id' => $admin->id, 'sender' => $funding_request->sender_name]
        );

        $funding_request->update([
            'status' => 'approved',
            'approved_by_admin_id' => $admin->id,
            'processed_at' => now(),
        ]);

        $user->notify(new \App\Notifications\FundingApprovedNotification($funding_request));

        $this->auditLogService->logAdmin(
            'funding_request_approved',
            FundingRequest::class,
            $funding_request->id,
            $funding_request->provider_reference,
            $request->input('reason', 'Manual bank transfer verified and approved'),
            ['amount' => $funding_request->amount, 'currency' => $funding_request->currency_code, 'user_id' => $user->id]
        );

        return back()->with('success', "Funding request of {$funding_request->amount} {$funding_request->currency_code} approved and wallet credited.");
    }

    public function reject(Request $request, FundingRequest $fundingRequest): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        if ($fundingRequest->status !== 'pending') {
            return back()->withErrors(['message' => 'Funding request has already been processed.']);
        }

        $reason = $request->input('reason', 'Payment verification failed');

        $fundingRequest->update([
            'status' => 'rejected',
            'rejected_by_admin_id' => $admin->id,
            'reason' => $reason,
            'processed_at' => now(),
        ]);

        $this->auditLogService->logAdmin(
            'funding_request_rejected',
            FundingRequest::class,
            $fundingRequest->id,
            $fundingRequest->provider_reference,
            $reason,
            ['user_id' => $fundingRequest->user_id]
        );

        return back()->with('success', "Funding request rejected.");
    }
}