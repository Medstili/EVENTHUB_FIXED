<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\event as ModelsEvent;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ModelsEvent::factory()->count(300)->create();
    }
}
