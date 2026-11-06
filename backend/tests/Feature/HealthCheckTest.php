<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_check_returns_ok_status(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'service',
                'database',
                'timestamp',
            ])
            ->assertJson([
                'status' => 'ok',
                'service' => 'english-learning-backend',
            ]);
    }
}
