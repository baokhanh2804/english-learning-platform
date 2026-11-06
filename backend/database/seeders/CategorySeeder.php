<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Từ vựng thông dụng', 'slug' => 'common-vocabulary', 'category_type' => 'vocabulary', 'sort_order' => 1],
            ['name' => 'Giao tiếp hàng ngày', 'slug' => 'daily-conversations', 'category_type' => 'general', 'sort_order' => 2],
            ['name' => 'Ngữ pháp căn bản', 'slug' => 'basic-grammar', 'category_type' => 'grammar', 'sort_order' => 3],
            ['name' => 'Luyện nghe phản xạ', 'slug' => 'listening-skills', 'category_type' => 'listening', 'sort_order' => 4],
            ['name' => 'Đọc hiểu & Ngữ cảnh', 'slug' => 'reading-comprehension', 'category_type' => 'reading', 'sort_order' => 5],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $cat['slug']],
                array_merge($cat, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
