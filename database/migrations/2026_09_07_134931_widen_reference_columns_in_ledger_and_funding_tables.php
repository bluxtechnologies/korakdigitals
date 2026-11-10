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
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->string('reference', 100)->change();
        });

        Schema::table('funding_requests', function (Blueprint $table) {
            $table->string('public_reference', 100)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->string('reference', 40)->change();
        });

        Schema::table('funding_requests', function (Blueprint $table) {
            $table->string('public_reference', 40)->change();
        });
    }
};
