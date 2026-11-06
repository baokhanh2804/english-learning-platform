<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vocabulary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('word', 150);
            $table->string('normalized_word', 150)->index();
            $table->string('ipa', 150)->nullable();
            $table->string('part_of_speech', 40)->nullable();
            $table->foreignId('pronunciation_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->smallInteger('difficulty')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['level_id', 'status']);
            $table->index(['category_id', 'status']);
        });

        Schema::create('vocabulary_meanings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->string('language_code', 10)->default('vi');
            $table->text('meaning');
            $table->text('usage_note')->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['vocabulary_id', 'language_code']);
        });

        Schema::create('vocabulary_examples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->text('sentence');
            $table->text('translation')->nullable();
            $table->foreignId('audio_media_id')->nullable()->constrained('media_assets')->nullOnDelete();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('vocabulary_id');
        });

        Schema::create('vocabulary_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->foreignId('related_vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->string('relation_type', 20); // synonym, antonym, related
            $table->timestamps();

            $table->unique(['vocabulary_id', 'related_vocabulary_id', 'relation_type']);
        });

        Schema::create('vocabulary_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('title', 180);
            $table->string('slug', 200)->unique();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();
        });

        Schema::create('vocabulary_set_items', function (Blueprint $table) {
            $table->foreignId('vocabulary_set_id')->constrained('vocabulary_sets')->cascadeOnDelete();
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->smallInteger('sort_order')->default(0);
            $table->primary(['vocabulary_set_id', 'vocabulary_id']);
            $table->unique(['vocabulary_set_id', 'sort_order']);
        });

        Schema::create('user_vocabulary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vocabulary_id')->constrained('vocabulary')->cascadeOnDelete();
            $table->boolean('is_favorite')->default(false);
            $table->string('learning_status', 20)->default('new'); // new, learning, mastered
            $table->smallInteger('repetition')->default(0);
            $table->integer('interval_days')->default(0);
            $table->decimal('ease_factor', 4, 2)->default(2.50);
            $table->timestamp('due_at')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'vocabulary_id']);
            $table->index(['user_id', 'due_at']);
            $table->index(['user_id', 'learning_status']);
        });

        Schema::create('flashcard_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_vocabulary_id')->constrained('user_vocabulary')->cascadeOnDelete();
            $table->smallInteger('rating'); // 1..4 (Again, Hard, Good, Easy)
            $table->timestamp('previous_due_at')->nullable();
            $table->timestamp('next_due_at')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->timestamp('reviewed_at');
            $table->timestamps();

            $table->index(['user_vocabulary_id', 'reviewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcard_reviews');
        Schema::dropIfExists('user_vocabulary');
        Schema::dropIfExists('vocabulary_set_items');
        Schema::dropIfExists('vocabulary_sets');
        Schema::dropIfExists('vocabulary_relations');
        Schema::dropIfExists('vocabulary_examples');
        Schema::dropIfExists('vocabulary_meanings');
        Schema::dropIfExists('vocabulary');
    }
};
