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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('public_reference', 40)->unique(); // e.g. CLQ-104829
            $table->string('service_category', 50)->index(); // numbers, growth, vpn, esim, airtime, accounts
            $table->decimal('total_amount', 20, 4);
            $table->char('currency_code', 3);
            $table->string('status', 30)->default('pending')->index(); // pending, processing, active, completed, expired, cancelled, failed, refunded
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
