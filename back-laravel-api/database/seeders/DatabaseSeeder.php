<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
      
        $this->call(UserSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(EventSeeder::class);
        $this->call(TicketSeeder::class);
    }
}
