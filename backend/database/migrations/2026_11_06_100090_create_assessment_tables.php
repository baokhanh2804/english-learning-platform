<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('question_type', 30); // single_choice, multiple_choice, true_false, fill_blank, ordering, matching
            $table->text('prompt');
            $table->text('explanation')->nullable();
            $table->smallInteger('difficulty')->nullable();
            $table->string('status', 20)->default('draft');
            $table->integer('version')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['level_id', 'question_type', 'status']);
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('option_key', 20);
            $table->text('content');
            $table->boolean('is_correct')->default(false); // never expose before submission
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['question_id', 'option_key']);
        });

        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->integer('time_limit_seconds')->nullable();
            $table->decimal('pass_percent', 5, 2)->default(60);
            $table->boolean('shuffle_questions')->default(true);
            $table->boolean('shuffle_options')->default(true);
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->smallInteger('sort_order');
            $table->decimal('points', 6, 2)->default(1);
            $table->primary(['quiz_id', 'question_id']);
        });

        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->integer('time_limit_seconds')->nullable();
            $table->decimal('pass_percent', 5, 2)->default(60);
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('exam_quizzes', function (Blueprint $table) {
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->smallInteger('sort_order');
            $table->primary(['exam_id', 'quiz_id']);
        });

        Schema::create('assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('assessment_type', 20); // quiz, exam
            $table->bigInteger('assessment_id');
            $table->string('status', 20)->default('in_progress');
            $table->timestamp('started_at');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->decimal('score', 7, 2)->nullable();
            $table->decimal('max_score', 7, 2)->nullable();
            $table->jsonb('question_snapshot');
            $table->jsonb('result_summary')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'started_at']);
            $table->index(['assessment_type', 'assessment_id']);
        });

        Schema::create('assessment_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('assessment_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->jsonb('answer_json');
            $table->boolean('is_correct')->nullable();
            $table->decimal('points_awarded', 6, 2)->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_answers');
        Schema::dropIfExists('assessment_attempts');
        Schema::dropIfExists('exam_quizzes');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
    }
};
