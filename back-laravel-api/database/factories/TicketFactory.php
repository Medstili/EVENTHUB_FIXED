<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
           'event_id' => $this->faker->numberBetween(1, 100), 
            'participant_id' => $this->faker->numberBetween(1, 50), 
            'status' => $this->faker->randomElement(['valide', 'invalide']),
            'price' => $this->faker->randomFloat(2, 10, 500), 
            'QR_code' => $this->faker->uuid(),
            'created_at' => now(),
            'updated_at' => now(),
            'currency' => $this->faker->currencyCode(),
            'payment_status' => $this->faker->randomElement(['paid', 'pending', 'failed']),
            'transaction_id' => $this->faker->uuid(),
            'payment_method' => $this->faker->randomElement(['card', 'paypal']),


        ];
    }
}
