<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class UpdateServiceStatusesSeeder extends Seeder
{
    public function run(): void
    {
        // Deactivate all services except airtime and data
        Service::whereNotIn('category', ['airtime', 'data'])->update(['is_active' => false]);
        Service::whereIn('category', ['airtime', 'data'])->update(['is_active' => true]);
    }
}
