<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->constrained('levels')->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('slug', 200)->unique();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft');
            $table->smallInteger('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['level_id', 'status', 'sort_order']);
        });

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('slug', 200);
            $table->text('description')->nullable();
            $table->smallInteger('sort_order');
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->unique(['course_id', 'slug']);
            $table->unique(['course_id', 'sort_order']);
            $table->index(['course_id', 'status']);
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('slug', 200);
            $table->string('summary', 500)->nullable();
            $table->string('lesson_type', 30)->default('mixed');
            $table->jsonb('objectives')->nullable();
            $table->smallInteger('estimated_minutes')->default(10);
            $table->smallInteger('sort_order');
            $table->string('status', 20)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['unit_id', 'slug']);
            $table->unique(['unit_id', 'sort_order']);
            $table->index(['unit_id', 'status', 'sort_order']);
        });

        Schema::create('lesson_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->string('block_type', 40);
            $table->string('title', 180)->nullable();
            $table->jsonb('content_json');
            $table->smallInteger('schema_version')->default(1);
            $table->smallInteger('sort_order');
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->unique(['lesson_id', 'sort_order']);
            $table->index(['lesson_id', 'status']);
        });

        Schema::create('lesson_prerequisites', function (Blueprint $table) {
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->foreignId('prerequisite_lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->primary(['lesson_id', 'prerequisite_lesson_id']);
        });

        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained('lessons')->cascadeOnDelete();
            $table->timestamp('completed_at');
            $table->decimal('score', 5, 2)->nullable();
            $table->string('source', 30)->default('lesson');
            $table->timestamps();

            $table->unique(['user_id', 'lesson_id']);
            $table->index(['user_id', 'completed_at']);
        });

        Schema::create('user_level_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('level_id')->constrained('levels')->cascadeOnDelete();
            $table->integer('completed_lessons')->default(0);
            $table->integer('total_lessons')->default(0);
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->string('status', 20)->default('not_started');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'level_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_level_progress');
        Schema::dropIfExists('lesson_completions');
        Schema::dropIfExists('lesson_prerequisites');
        Schema::dropIfExists('lesson_contents');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('units');
        Schema::dropIfExists('courses');
    }
};
