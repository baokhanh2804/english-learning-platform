<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'English Learning Platform API'),
        'status' => 'online',
        'environment' => app()->environment(),
        'health' => url('/api/health'),
        'frontend' => env('FRONTEND_URL'),
    ]);
});
