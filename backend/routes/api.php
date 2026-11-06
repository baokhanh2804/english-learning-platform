<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    $dbStatus = 'disconnected';
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Throwable $e) {
        $dbStatus = 'unreachable';
    }

    return response()->json([
        'status' => 'ok',
        'service' => 'english-learning-backend',
        'database' => $dbStatus,
        'timestamp' => now()->toISOString(),
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
