<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('services')) {
            // Deactivate all services except working airtime and data
            DB::table('services')
                ->whereNotIn('category', ['airtime', 'data'])
                ->update(['is_active' => false]);

            DB::table('services')
                ->whereIn('category', ['airtime', 'data'])
                ->update(['is_active' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('services')) {
            DB::table('services')->update(['is_active' => true]);
        }
    }
};
