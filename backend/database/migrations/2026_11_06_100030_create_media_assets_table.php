<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('disk', 40)->default('local');
            $table->string('storage_key', 500)->unique();
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 120);
            $table->bigInteger('file_size');
            $table->decimal('duration_seconds', 9, 2)->nullable();
            $table->string('visibility', 20)->default('public');
            $table->string('checksum', 128)->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            $table->index(['owner_id', 'visibility', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
