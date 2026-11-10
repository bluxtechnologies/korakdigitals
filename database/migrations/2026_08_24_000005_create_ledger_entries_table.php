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
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->string('category', 30)->index();
            $table->decimal('amount', 20, 4);
            $table->decimal('balance_after', 20, 4);
            $table->char('currency_code', 3);
            $table->string('reference', 40)->unique();
            $table->string('idempotency_key', 100)->nullable()->unique();
            $table->string('related_type')->nullable()->index();
            $table->unsignedBigInteger('related_id')->nullable()->index();
            $table->string('description');
            $table->json('metadata')->nullable();
            $table->foreignId('created_by_admin_id')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();

            $table->index(['account_id', 'created_at']);
            $table->index(['related_type', 'related_id']);
            $table->index(['type', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
