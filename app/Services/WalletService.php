<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Currency;
use App\Models\LedgerEntry;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class WalletService
{
    /**
     * Credit account wallet with double-entry ledger entry.
     */
    public function creditWallet(
        Account $account,
        float $amount,
        string $currencyCode,
        string $category,
        string $description,
        ?string $reference = null,
        ?string $idempotencyKey = null,
        ?array $metadata = null
    ): LedgerEntry {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Credit amount must be greater than zero.');
        }

        return DB::transaction(function () use ($account, $amount, $currencyCode, $category, $description, $reference, $idempotencyKey, $metadata) {
            // Check idempotency if key provided
            if ($idempotencyKey) {
                $existing = LedgerEntry::where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    return $existing;
                }
            }

            // Lock account row for update
            $account = Account::where('id', $account->id)->lockForUpdate()->firstOrFail();

            $newBalance = $account->available_balance + $amount;
            $account->available_balance = $newBalance;
            $account->ledger_balance = $newBalance;
            $account->total_deposit += $amount;
            $account->save();

            $txRef = $reference ?? 'CR-' . strtoupper(Str::random(12));

            return LedgerEntry::create([
                'account_id' => $account->id,
                'type' => 'credit',
                'category' => $category,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'currency_code' => $currencyCode,
                'reference' => $txRef,
                'idempotency_key' => $idempotencyKey,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Debit account wallet with double-entry ledger entry.
     */
    public function debitWallet(
        Account $account,
        float $amount,
        string $currencyCode,
        string $category,
        string $description,
        ?string $reference = null,
        ?string $idempotencyKey = null,
        ?array $metadata = null
    ): LedgerEntry {
        if ($amount <= 0) {
            throw new InvalidArgumentException('Debit amount must be greater than zero.');
        }

        return DB::transaction(function () use ($account, $amount, $currencyCode, $category, $description, $reference, $idempotencyKey, $metadata) {
            if ($idempotencyKey) {
                $existing = LedgerEntry::where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    return $existing;
                }
            }

            $account = Account::where('id', $account->id)->lockForUpdate()->firstOrFail();

            if ($account->available_balance < $amount) {
                throw new InvalidArgumentException('Insufficient wallet balance.');
            }

            $newBalance = $account->available_balance - $amount;
            $account->available_balance = $newBalance;
            $account->ledger_balance = $newBalance;
            $account->save();

            $txRef = $reference ?? 'DR-' . strtoupper(Str::random(12));

            return LedgerEntry::create([
                'account_id' => $account->id,
                'type' => 'debit',
                'category' => $category,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'currency_code' => $currencyCode,
                'reference' => $txRef,
                'idempotency_key' => $idempotencyKey,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Convert wallet balance when user switches account currency.
     * Records an adjustment ledger entry for transaction transparency.
     */
    public function convertWalletCurrency(
        Account $account,
        Currency $oldCurrency,
        Currency $newCurrency
    ): void {
        if ($oldCurrency->id === $newCurrency->id) {
            return;
        }

        $oldRate = (float) $oldCurrency->rate;
        $newRate = (float) $newCurrency->rate;

        if ($oldRate <= 0 || $newRate <= 0) {
            return;
        }

        DB::transaction(function () use ($account, $oldCurrency, $newCurrency, $oldRate, $newRate) {
            $account = Account::where('id', $account->id)->lockForUpdate()->firstOrFail();

            $oldBalance = (float) $account->available_balance;
            $oldLedger = (float) $account->ledger_balance;
            $oldDeposit = (float) $account->total_deposit;

            $multiplier = $newRate / $oldRate;
            $decimals = $newCurrency->decimal_places ?? 2;

            $newBalance = round($oldBalance * $multiplier, $decimals);
            $newLedger = round($oldLedger * $multiplier, $decimals);
            $newDeposit = round($oldDeposit * $multiplier, $decimals);

            $account->available_balance = $newBalance;
            $account->ledger_balance = $newLedger;
            $account->total_deposit = $newDeposit;
            $account->save();

            LedgerEntry::create([
                'account_id' => $account->id,
                'type' => 'adjustment',
                'category' => 'currency_conversion',
                'amount' => $newBalance,
                'balance_after' => $newBalance,
                'currency_code' => $newCurrency->code,
                'reference' => 'FX-' . strtoupper(Str::random(12)),
                'description' => "Currency converted from {$oldCurrency->code} to {$newCurrency->code}",
                'metadata' => [
                    'old_currency' => $oldCurrency->code,
                    'new_currency' => $newCurrency->code,
                    'old_balance' => $oldBalance,
                    'new_balance' => $newBalance,
                    'rate' => $multiplier,
                ],
            ]);

            return null;
        });
    }
}
