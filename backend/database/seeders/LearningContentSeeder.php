<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LearningContentSeeder extends Seeder
{
    public function run(): void
    {
        $levelA1 = DB::table('levels')->where('code', 'A1')->first();
        $levelA2 = DB::table('levels')->where('code', 'A2')->first();
        $levelB1 = DB::table('levels')->where('code', 'B1')->first();
        $levelB2 = DB::table('levels')->where('code', 'B2')->first();
        $levelC1 = DB::table('levels')->where('code', 'C1')->first();
        $levelC2 = DB::table('levels')->where('code', 'C2')->first();

        if (!$levelA1) {
            return;
        }

        // ==========================================
        // 1. Khóa học A1
        // ==========================================
        $courseA1Id = DB::table('courses')->insertGetId([
            'level_id' => $levelA1->id,
            'title' => 'Tiếng Anh Giao Tiếp Nhập Môn A1',
            'slug' => 'tieng-anh-giao-tiep-nhap-mon-a1',
            'description' => 'Khóa học nền tảng dành cho người mới bắt đầu hoặc mất gốc tiếng Anh. Học từ vựng cốt lõi, phát âm chuẩn và các mẫu câu thông dụng hàng ngày.',
            'status' => 'published',
            'sort_order' => 1,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $unitA1_1 = DB::table('units')->insertGetId([
            'course_id' => $courseA1Id,
            'title' => 'Unit 1: Chào hỏi & Tự giới thiệu bản thân',
            'slug' => 'unit-1-chao-hoi-va-tu-gioi-thieu',
            'description' => 'Làm quen với các câu chào hỏi, xưng hô, hỏi tên, tuổi và quốc tịch.',
            'sort_order' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $lessonA1_1 = DB::table('lessons')->insertGetId([
            'unit_id' => $unitA1_1,
            'title' => 'Bài 1: Làm quen & Lời chào đầu tiên',
            'slug' => 'bai-1-lam-quen-va-loi-chao-dau-tien',
            'summary' => 'Nắm vững cách chào hỏi lịch sự, tự giới thiệu tên và cảm ơn.',
            'lesson_type' => 'mixed',
            'objectives' => json_encode(['Phân biệt Hello và Hi', 'Biết cách hỏi và trả lời tên: What is your name?', 'Mẫu câu Nice to meet you']),
            'estimated_minutes' => 15,
            'sort_order' => 1,
            'status' => 'published',
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Nội dung bài học 1
        DB::table('lesson_contents')->insert([
            [
                'lesson_id' => $lessonA1_1,
                'block_type' => 'theory',
                'title' => '1. Các cách chào hỏi thông dụng',
                'content_json' => json_encode([
                    'body' => 'Trong tiếng Anh, có hai cách chào hỏi chính:\n- **Thân mật (Informal):** "Hi!", "Hey!" dùng cho bạn bè, người đồng trang lứa.\n- **Trang trọng (Formal):** "Hello!", "Good morning" (Chào buổi sáng), "Good afternoon" (Chào buổi chiều), "Good evening" (Chào buổi tối).',
                    'tips' => 'Khi gặp ai đó lần đầu tiên, câu chào lịch sự chuẩn mực nhất là: "Nice to meet you!" (Rất vui được gặp bạn).'
                ]),
                'schema_version' => 1,
                'sort_order' => 1,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'lesson_id' => $lessonA1_1,
                'block_type' => 'dialogue',
                'title' => '2. Đoạn hội thoại mẫu',
                'content_json' => json_encode([
                    'dialogue' => [
                        ['speaker' => 'Anna', 'en' => 'Hello, my name is Anna. What is your name?', 'vi' => 'Xin chào, tên tôi là Anna. Tên bạn là gì?'],
                        ['speaker' => 'David', 'en' => 'Hi Anna! I am David. Nice to meet you.', 'vi' => 'Chào Anna! Tôi là David. Rất vui được gặp bạn.'],
                        ['speaker' => 'Anna', 'en' => 'Nice to meet you too, David!', 'vi' => 'Tôi cũng rất vui được gặp bạn, David!']
                    ]
                ]),
                'schema_version' => 1,
                'sort_order' => 2,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        // Từ vựng kèm theo bài học
        $vocab1 = DB::table('vocabulary')->insertGetId([
            'level_id' => $levelA1->id,
            'word' => 'Hello',
            'normalized_word' => 'hello',
            'ipa' => '/həˈloʊ/',
            'part_of_speech' => 'interjection',
            'difficulty' => 1,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('vocabulary_meanings')->insert([
            'vocabulary_id' => $vocab1,
            'language_code' => 'vi',
            'meaning' => 'Xin chào (lời chào trang trọng và thông dụng nhất)',
            'usage_note' => 'Có thể dùng vào bất kỳ thời điểm nào trong ngày.',
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('vocabulary_examples')->insert([
            'vocabulary_id' => $vocab1,
            'sentence' => 'Hello, how are you today?',
            'translation' => 'Xin chào, hôm nay bạn thế nào?',
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $vocab2 = DB::table('vocabulary')->insertGetId([
            'level_id' => $levelA1->id,
            'word' => 'Welcome',
            'normalized_word' => 'welcome',
            'ipa' => '/ˈwel.kəm/',
            'part_of_speech' => 'exclamation',
            'difficulty' => 1,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('vocabulary_meanings')->insert([
            'vocabulary_id' => $vocab2,
            'language_code' => 'vi',
            'meaning' => 'Chào mừng / Hoan nghênh',
            'usage_note' => 'Thường dùng để đón tiếp ai đó đến một nơi mới.',
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('vocabulary_examples')->insert([
            'vocabulary_id' => $vocab2,
            'sentence' => 'Welcome to our English learning platform!',
            'translation' => 'Chào mừng bạn đến với nền tảng học tiếng Anh của chúng tôi!',
            'sort_order' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Bài kiểm tra Quiz cho bài học 1
        $quizA1 = DB::table('quizzes')->insertGetId([
            'lesson_id' => $lessonA1_1,
            'title' => 'Quiz kiểm tra nhanh Bài 1',
            'description' => 'Kiểm tra mức độ ghi nhớ các mẫu câu chào hỏi cơ bản.',
            'time_limit_seconds' => 300,
            'pass_percent' => 70,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $q1 = DB::table('questions')->insertGetId([
            'level_id' => $levelA1->id,
            'question_type' => 'single_choice',
            'prompt' => 'Khi gặp ai đó lần đầu tiên một cách lịch sự, bạn nên nói câu nào?',
            'explanation' => '"Nice to meet you" là câu chào lịch sự chuẩn mực mang ý nghĩa "Rất hân hạnh được gặp bạn".',
            'difficulty' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('question_options')->insert([
            ['question_id' => $q1, 'option_key' => 'A', 'content' => 'Goodbye, see you again.', 'is_correct' => false, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q1, 'option_key' => 'B', 'content' => 'Nice to meet you.', 'is_correct' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q1, 'option_key' => 'C', 'content' => 'Good night.', 'is_correct' => false, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q1, 'option_key' => 'D', 'content' => 'You are welcome.', 'is_correct' => false, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('quiz_questions')->insert([
            'quiz_id' => $quizA1,
            'question_id' => $q1,
            'sort_order' => 1,
            'points' => 1,
        ]);

        $q2 = DB::table('questions')->insertGetId([
            'level_id' => $levelA1->id,
            'question_type' => 'single_choice',
            'prompt' => 'Để hỏi tên người đối diện bằng tiếng Anh, câu nào sau đây đúng ngữ pháp?',
            'explanation' => '"What is your name?" (Tên bạn là gì?) là câu hỏi chuẩn xác nhất.',
            'difficulty' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('question_options')->insert([
            ['question_id' => $q2, 'option_key' => 'A', 'content' => 'What is you name?', 'is_correct' => false, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q2, 'option_key' => 'B', 'content' => 'What are your name?', 'is_correct' => false, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q2, 'option_key' => 'C', 'content' => 'What is your name?', 'is_correct' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['question_id' => $q2, 'option_key' => 'D', 'content' => 'Where your name?', 'is_correct' => false, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);
        DB::table('quiz_questions')->insert([
            'quiz_id' => $quizA1,
            'question_id' => $q2,
            'sort_order' => 2,
            'points' => 1,
        ]);

        // ==========================================
        // 2. Khóa học A2, B1, B2, C1, C2 (Mẫu khung)
        // ==========================================
        if ($levelA2) {
            DB::table('courses')->insert([
                'level_id' => $levelA2->id,
                'title' => 'Tiếng Anh Đời Sống Hàng Ngày A2',
                'slug' => 'tieng-anh-doi-song-hang-ngay-a2',
                'description' => 'Mở rộng vốn từ vựng về gia đình, sở thích, mua sắm và công việc thường nhật.',
                'status' => 'published',
                'sort_order' => 2,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($levelB1) {
            DB::table('courses')->insert([
                'level_id' => $levelB1->id,
                'title' => 'Tiếng Anh Giao Tiếp Nơi Công Sở B1',
                'slug' => 'tieng-anh-giao-tiep-noi-cong-so-b1',
                'description' => 'Rèn luyện kỹ năng trao đổi công việc, viết email và trình bày ý kiến rõ ràng.',
                'status' => 'published',
                'sort_order' => 3,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($levelB2) {
            DB::table('courses')->insert([
                'level_id' => $levelB2->id,
                'title' => 'Tiếng Anh Thuyết Trình & Tranh Luận B2',
                'slug' => 'tieng-anh-thuyet-trinh-tranh-luan-b2',
                'description' => 'Tự tin trình bày quan điểm, phản biện và giao tiếp trôi chảy với người bản xứ.',
                'status' => 'published',
                'sort_order' => 4,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($levelC1) {
            DB::table('courses')->insert([
                'level_id' => $levelC1->id,
                'title' => 'Tiếng Anh Học Thuật & Chuyên Sâu C1',
                'slug' => 'tieng-anh-hoc-thuat-chuyen-sau-c1',
                'description' => 'Đọc hiểu tài liệu phức tạp, phân tích chuyên môn và sử dụng ngôn ngữ linh hoạt.',
                'status' => 'published',
                'sort_order' => 5,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        if ($levelC2) {
            DB::table('courses')->insert([
                'level_id' => $levelC2->id,
                'title' => 'Tiếng Anh Tinh Hoa & Thành Thạo Bản Ngữ C2',
                'slug' => 'tieng-anh-tinh-hoa-thanh-thao-ban-ngu-c2',
                'description' => 'Cấp độ tinh thông tối cao: hiểu sâu sắc ngữ cảnh văn hóa, sắc thái biểu đạt tinh tế.',
                'status' => 'published',
                'sort_order' => 6,
                'published_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
