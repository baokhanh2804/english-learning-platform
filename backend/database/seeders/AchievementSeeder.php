<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'code' => 'first_lesson',
                'name' => 'Bước khởi đầu',
                'description' => 'Hoàn thành bài học đầu tiên trên nền tảng.',
                'criteria_json' => json_encode(['type' => 'lessons_completed', 'count' => 1]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'streak_7',
                'name' => 'Chiến binh bền bỉ',
                'description' => 'Duy trì chuỗi học tập liên tục trong 7 ngày.',
                'criteria_json' => json_encode(['type' => 'streak_days', 'count' => 7]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'vocab_50',
                'name' => 'Nhà sưu tầm từ vựng',
                'description' => 'Ghi nhớ thành thạo 50 từ vựng theo phương pháp Spaced Repetition (SRS).',
                'criteria_json' => json_encode(['type' => 'mastered_vocab', 'count' => 50]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($achievements as $achieve) {
            DB::table('achievements')->updateOrInsert(
                ['code' => $achieve['code']],
                $achieve
            );
        }
    }
}
