<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('display_name', 120)->nullable();
            $table->foreignId('avatar_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('bio', 500)->nullable();
            $table->string('native_language', 20)->nullable();
            $table->string('timezone', 64)->default('Asia/Ho_Chi_Minh');
            $table->foreignId('current_level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->smallInteger('daily_goal_minutes')->default(15);
            $table->boolean('reminder_enabled')->default(false);
            $table->time('reminder_time')->nullable();
            $table->string('interface_language', 10)->default('vi');
            $table->boolean('audio_autoplay')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('user_profiles');
    }
};
