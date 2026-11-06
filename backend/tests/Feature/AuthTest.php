<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Bao Khanh',
            'email' => 'khanh@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'khanh@example.com',
        ]);
    }

    public function test_user_can_login(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'test@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user',
                'token',
            ]);
    }

    public function test_user_can_get_profile_and_logout(): void
    {
        $user = User::create([
            'name' => 'Profile User',
            'email' => 'profile@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'profile@example.com');

        $logoutResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/logout');

        $logoutResponse->assertStatus(200)
            ->assertJsonPath('message', 'Đăng xuất thành công!');
    }

    public function test_unauthenticated_users_are_blocked_from_learning_resources(): void
    {
        // 1. Without token -> Blocked (401 Unauthorized)
        $unauthResponse = $this->getJson('/api/vocabulary');
        $unauthResponse->assertStatus(401);

        $unauthLevels = $this->getJson('/api/levels');
        $unauthLevels->assertStatus(401);

        // 2. With valid Sanctum token -> Allowed (200 OK)
        $user = User::create([
            'name' => 'Enrolled Student',
            'email' => 'student@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $authResponse = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/levels');

        $authResponse->assertStatus(200);
    }
}
