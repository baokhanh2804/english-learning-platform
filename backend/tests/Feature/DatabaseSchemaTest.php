<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_cefr_levels_are_seeded(): void
    {
        $levels = DB::table('levels')->orderBy('sort_order')->pluck('code')->toArray();
        $this->assertEquals(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], $levels);
    }

    public function test_roles_and_permissions_are_seeded(): void
    {
        $this->assertDatabaseHas('roles', ['slug' => 'student']);
        $this->assertDatabaseHas('roles', ['slug' => 'admin']);
        $this->assertDatabaseHas('roles', ['slug' => 'teacher']);
        $this->assertDatabaseHas('permissions', ['slug' => 'learning.access']);
    }

    public function test_course_unit_lesson_hierarchy_can_be_created(): void
    {
        $level = DB::table('levels')->where('code', 'A1')->first();

        $courseId = DB::table('courses')->insertGetId([
            'level_id' => $level->id,
            'title' => 'Tiếng Anh Giao Tiếp A1 Cơ Bản',
            'slug' => 'tieng-anh-giao-tiep-a1-co-ban',
            'status' => 'published',
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitId = DB::table('units')->insertGetId([
            'course_id' => $courseId,
            'title' => 'Unit 1: Chào hỏi & Giới thiệu',
            'slug' => 'unit-1-chao-hoi',
            'sort_order' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $lessonId = DB::table('lessons')->insertGetId([
            'unit_id' => $unitId,
            'title' => 'Bài 1: Giới thiệu bản thân',
            'slug' => 'bai-1-gioi-thieu-ban-than',
            'lesson_type' => 'mixed',
            'objectives' => json_encode(['Biết cách chào hỏi', 'Nói tên và quốc tịch']),
            'estimated_minutes' => 15,
            'sort_order' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertDatabaseHas('courses', ['id' => $courseId]);
        $this->assertDatabaseHas('units', ['id' => $unitId]);
        $this->assertDatabaseHas('lessons', ['id' => $lessonId]);
    }

    public function test_vocabulary_and_srs_state_can_be_created(): void
    {
        $level = DB::table('levels')->where('code', 'A1')->first();
        $user = DB::table('users')->where('email', 'student@example.com')->first();

        $vocabId = DB::table('vocabulary')->insertGetId([
            'level_id' => $level->id,
            'word' => 'Hello',
            'normalized_word' => 'hello',
            'ipa' => '/həˈloʊ/',
            'part_of_speech' => 'interjection',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('vocabulary_meanings')->insert([
            'vocabulary_id' => $vocabId,
            'language_code' => 'vi',
            'meaning' => 'Xin chào (lời chào thông dụng)',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userVocabId = DB::table('user_vocabulary')->insertGetId([
            'user_id' => $user->id,
            'vocabulary_id' => $vocabId,
            'learning_status' => 'learning',
            'repetition' => 1,
            'interval_days' => 1,
            'ease_factor' => 2.50,
            'due_at' => now()->addDay(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertDatabaseHas('user_vocabulary', ['id' => $userVocabId, 'learning_status' => 'learning']);
    }
}
