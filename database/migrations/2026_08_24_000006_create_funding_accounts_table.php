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
        Schema::create('funding_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 50)->index();
            $table->string('account_number', 50)->index();
            $table->string('bank_name', 120);
            $table->string('account_name', 150);
            $table->string('external_reference', 100)->nullable()->unique();
            $table->string('status', 20)->default('active')->index();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'account_number']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funding_accounts');
    }
};
