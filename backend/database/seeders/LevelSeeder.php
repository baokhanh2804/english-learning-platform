<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [
                'code' => 'A1',
                'name' => 'Beginner (Cơ bản / Nhập môn)',
                'description' => 'Hiểu và sử dụng các biểu đạt quen thuộc hàng ngày và các câu đối thoại rất cơ bản.',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'A2',
                'name' => 'Elementary (Sơ cấp)',
                'description' => 'Hiểu các câu và cách diễn đạt thông dụng liên quan đến thông tin cá nhân và gia đình cơ bản.',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'B1',
                'name' => 'Intermediate (Trung cấp)',
                'description' => 'Hiểu được các điểm chính trong các chủ đề quen thuộc thường gặp trong công việc, học tập, giải trí.',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'B2',
                'name' => 'Upper-Intermediate (Trung cao cấp)',
                'description' => 'Hiểu ý chính của các văn bản phức tạp, có thể giao tiếp một cách tự nhiên và trôi chảy.',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'C1',
                'name' => 'Advanced (Cao cấp)',
                'description' => 'Hiểu nhiều loại văn bản dài và đòi hỏi khắt khe, nhận biết ý nghĩa tiềm ẩn, sử dụng ngôn ngữ linh hoạt.',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'C2',
                'name' => 'Proficiency (Thành thạo / Bản ngữ)',
                'description' => 'Hiểu một cách dễ dàng hầu như mọi thứ nghe hoặc đọc được, biểu đạt tự nhiên, chính xác và lưu loát.',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($levels as $level) {
            DB::table('levels')->updateOrInsert(
                ['code' => $level['code']],
                $level
            );
        }
    }
}
