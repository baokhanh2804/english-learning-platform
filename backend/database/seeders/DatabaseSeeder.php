<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LevelSeeder::class,
            RolePermissionSeeder::class,
            CategorySeeder::class,
            AchievementSeeder::class,
        ]);

        if (app()->environment('local', 'testing')) {
            User::factory()->create([
                'name' => 'Demo Student',
                'email' => 'student@example.com',
            ]);
        }
    }
}
