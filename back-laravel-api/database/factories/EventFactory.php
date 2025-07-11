<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Log;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
 
        $categoryIds = Category::pluck('id')->toArray();
        $organizerIds = User::pluck('id')->toArray();

        if (empty($categoryIds) || empty($organizerIds)) {
            Log::info('No categories or organizers found.');
            return [];
        }

        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'date' => $this->faker->dateTimeBetween('2023-01-01', '2025-12-31')->format('Y-m-d'),
            'time' => $this->faker->time('H:i'),
            'location' => $this->faker->address(),
            'image' => 'events/ImX0KLAGCzHLlBtcnqN8wBnrq9X8aHeORZLta4cl.jpg',     
            'capacity' => $this->faker->numberBetween(10, 500),
            'is_public' => $this->faker->boolean(),
            'category_id' => $categoryIds[array_rand($categoryIds)],
            'organizer_id' => $organizerIds[array_rand($organizerIds)],
            'city'=>$this->faker->city()
        ];
    }
}
