<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('funding_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('funding_account_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('public_reference', 40)->unique();
            $table->string('provider', 50)->index();
            $table->decimal('amount', 20, 4);
            $table->char('currency_code', 3);
            $table->string('status', 20)->default('pending')->index();
            $table->string('payment_method', 50)->default('bank_transfer');
            $table->string('sender_name')->nullable();
            $table->string('sender_bank_name', 120)->nullable();
            $table->string('sender_account_number', 50)->nullable();
            $table->string('proof_path')->nullable();
            $table->string('provider_reference', 100)->nullable()->unique();
            $table->foreignId('approved_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->foreignId('rejected_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['account_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['provider', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funding_requests');
    }
};
