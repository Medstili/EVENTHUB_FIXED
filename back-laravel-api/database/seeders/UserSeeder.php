<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'), 
            'role' => 'organizer', 
        ]);
        
        User::factory(500)->create([
            'role' => 'participant',
        ]);

        User::factory(100)->create([
            'role' => 'organizer',
        ]);

        User::factory(1)->create([
            'role' => 'admin',
        ]);

    }
}
