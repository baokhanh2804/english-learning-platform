<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('stat_date');
            $table->integer('learning_seconds')->default(0);
            $table->smallInteger('lessons_completed')->default(0);
            $table->integer('questions_answered')->default(0);
            $table->integer('vocabulary_reviewed')->default(0);
            $table->integer('xp_earned')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'stat_date']);
            $table->index(['user_id', 'stat_date']);
        });

        Schema::create('user_xp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('event_type', 40);
            $table->string('reference_type', 40)->nullable();
            $table->bigInteger('reference_id')->nullable();
            $table->integer('points');
            $table->string('idempotency_key', 120)->unique();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('user_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_activity_date')->nullable();
            $table->timestamps();
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 120);
            $table->text('description');
            $table->foreignId('icon_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->jsonb('criteria_json');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnDelete();
            $table->timestamp('unlocked_at');
            $table->primary(['user_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('user_streaks');
        Schema::dropIfExists('user_xp_logs');
        Schema::dropIfExists('user_daily_stats');
    }
};
