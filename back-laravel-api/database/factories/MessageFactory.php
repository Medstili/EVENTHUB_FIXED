<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Conversation;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::inRandomOrder()->first()->id,
            'sender_type' => $this->faker->randomElement(['user', 'admin']),
            'sender_id' => function (array $attributes) {
                if ($attributes['sender_type'] === 'admin') {
                    return User::where('role', 'admin')->inRandomOrder()->first()->id;
                }
                return null;
            },
            'body' => $this->faker->paragraph(),
            'is_read' => $this->faker->boolean(30),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),

        ];
    }
}
