<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Administrator', 'slug' => 'admin', 'description' => 'Quản trị viên toàn hệ thống'],
            ['name' => 'Teacher / Content Creator', 'slug' => 'teacher', 'description' => 'Biên tập viên và giáo viên'],
            ['name' => 'Student', 'slug' => 'student', 'description' => 'Người học'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['slug' => $role['slug']],
                array_merge($role, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        $permissions = [
            ['name' => 'Manage Users', 'slug' => 'users.manage', 'description' => 'Quản lý tài khoản người dùng'],
            ['name' => 'Manage Content', 'slug' => 'content.manage', 'description' => 'Tạo, sửa, xuất bản khóa học và bài học'],
            ['name' => 'Review Submissions', 'slug' => 'submissions.review', 'description' => 'Chấm bài viết và bài nói'],
            ['name' => 'Learn & Practice', 'slug' => 'learning.access', 'description' => 'Truy cập nội dung và làm bài tập'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => $perm['slug']],
                array_merge($perm, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // Link student role to learning.access
        $studentRole = DB::table('roles')->where('slug', 'student')->first();
        $learnPerm = DB::table('permissions')->where('slug', 'learning.access')->first();
        if ($studentRole && $learnPerm) {
            DB::table('permission_role')->updateOrInsert([
                'permission_id' => $learnPerm->id,
                'role_id' => $studentRole->id,
            ]);
        }
    }
}
