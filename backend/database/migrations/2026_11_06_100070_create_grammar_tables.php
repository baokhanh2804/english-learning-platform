<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grammar_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('grammar_categories')->nullOnDelete();
            $table->string('name', 150);
            $table->string('slug', 170)->unique();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('grammar_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('level_id')->nullable()->constrained('levels')->nullOnDelete();
            $table->foreignId('category_id')->constrained('grammar_categories')->cascadeOnDelete();
            $table->string('title', 180);
            $table->string('slug', 200)->unique();
            $table->text('summary')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestamps();

            $table->index(['level_id', 'status']);
        });

        Schema::create('grammar_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grammar_topic_id')->constrained('grammar_topics')->cascadeOnDelete();
            $table->string('content_type', 30); // explanation, formula, note, common_mistake
            $table->text('body');
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['grammar_topic_id', 'sort_order']);
        });

        Schema::create('grammar_examples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grammar_topic_id')->constrained('grammar_topics')->cascadeOnDelete();
            $table->text('sentence');
            $table->text('translation')->nullable();
            $table->text('explanation')->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_grammar_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('grammar_topic_id')->constrained('grammar_topics')->cascadeOnDelete();
            $table->string('status', 20)->default('not_started');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'grammar_topic_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_grammar_progress');
        Schema::dropIfExists('grammar_examples');
        Schema::dropIfExists('grammar_contents');
        Schema::dropIfExists('grammar_topics');
        Schema::dropIfExists('grammar_categories');
    }
};
