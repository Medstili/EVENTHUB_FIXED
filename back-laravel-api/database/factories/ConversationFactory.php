<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            
        'guest_name' => $this->faker->name(),
        'guest_email' => $this->faker->unique()->safeEmail(),
        'status' => $this->faker->randomElement(['solved', 'unsolved']),
        'last_message_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
    
}
