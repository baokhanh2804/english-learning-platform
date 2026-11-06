<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listening_lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->string('title', 180);
            $table->foreignId('audio_media_id')->constrained('media_assets')->cascadeOnDelete();
            $table->string('transcript_mode', 20)->default('toggle');
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('listening_transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listening_lesson_id')->constrained('listening_lessons')->cascadeOnDelete();
            $table->string('speaker', 80)->nullable();
            $table->integer('start_ms')->nullable();
            $table->integer('end_ms')->nullable();
            $table->text('text');
            $table->text('translation')->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['listening_lesson_id', 'sort_order']);
        });

        Schema::create('reading_passages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->string('title', 180);
            $table->text('body');
            $table->integer('word_count')->default(0);
            $table->smallInteger('estimated_minutes')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['level_id', 'status']);
        });

        Schema::create('reading_paragraphs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reading_passage_id')->constrained('reading_passages')->cascadeOnDelete();
            $table->text('body');
            $table->smallInteger('sort_order');
            $table->timestamps();

            $table->unique(['reading_passage_id', 'sort_order']);
        });

        Schema::create('writing_prompts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->constrained('levels')->cascadeOnDelete();
            $table->string('title', 180);
            $table->text('instructions');
            $table->string('task_type', 40);
            $table->smallInteger('min_words')->nullable();
            $table->smallInteger('max_words')->nullable();
            $table->jsonb('rubric_json')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('writing_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('writing_prompt_id')->constrained('writing_prompts')->cascadeOnDelete();
            $table->text('body');
            $table->integer('word_count');
            $table->string('status', 20)->default('draft'); // draft, submitted, reviewed
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'updated_at']);
        });

        Schema::create('speaking_prompts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->constrained('levels')->cascadeOnDelete();
            $table->string('title', 180);
            $table->text('instructions');
            $table->text('sample_text')->nullable();
            $table->foreignId('sample_audio_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('speaking_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('speaking_prompt_id')->constrained('speaking_prompts')->cascadeOnDelete();
            $table->foreignId('media_asset_id')->constrained('media_assets')->cascadeOnDelete();
            $table->timestamp('consent_at');
            $table->timestamp('retention_expires_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('speaking_recordings');
        Schema::dropIfExists('speaking_prompts');
        Schema::dropIfExists('writing_submissions');
        Schema::dropIfExists('writing_prompts');
        Schema::dropIfExists('reading_paragraphs');
        Schema::dropIfExists('reading_passages');
        Schema::dropIfExists('listening_transcripts');
        Schema::dropIfExists('listening_lessons');
    }
};
