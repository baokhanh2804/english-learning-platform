<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// Health Check
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

// 1. CEFR Levels
Route::get('/levels', function () {
    $levels = DB::table('levels')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    // Attach courses count
    foreach ($levels as $level) {
        $level->courses_count = DB::table('courses')
            ->where('level_id', $level->id)
            ->where('status', 'published')
            ->count();
    }

    return response()->json([
        'data' => $levels,
    ]);
});

// 2. Courses
Route::get('/courses', function (Request $request) {
    $query = DB::table('courses')
        ->join('levels', 'courses.level_id', '=', 'levels.id')
        ->select('courses.*', 'levels.code as level_code', 'levels.name as level_name')
        ->where('courses.status', 'published');

    if ($request->has('level_id')) {
        $query->where('courses.level_id', $request->query('level_id'));
    }

    $courses = $query->orderBy('courses.sort_order')->get();

    return response()->json([
        'data' => $courses,
    ]);
});

// 3. Course Details (with Units & Lessons)
Route::get('/courses/{id}', function ($id) {
    $course = DB::table('courses')
        ->join('levels', 'courses.level_id', '=', 'levels.id')
        ->select('courses.*', 'levels.code as level_code', 'levels.name as level_name')
        ->where('courses.id', $id)
        ->first();

    if (!$course) {
        return response()->json(['message' => 'Khóa học không tồn tại'], 404);
    }

    $units = DB::table('units')
        ->where('course_id', $course->id)
        ->where('status', 'published')
        ->orderBy('sort_order')
        ->get();

    foreach ($units as $unit) {
        $unit->lessons = DB::table('lessons')
            ->where('unit_id', $unit->id)
            ->where('status', 'published')
            ->orderBy('sort_order')
            ->get();
    }

    $course->units = $units;

    return response()->json([
        'data' => $course,
    ]);
});

// 4. Lesson Details
Route::get('/lessons/{id}', function ($id) {
    $lesson = DB::table('lessons')
        ->join('units', 'lessons.unit_id', '=', 'units.id')
        ->join('courses', 'units.course_id', '=', 'courses.id')
        ->select('lessons.*', 'units.title as unit_title', 'courses.title as course_title', 'courses.id as course_id')
        ->where('lessons.id', $id)
        ->first();

    if (!$lesson) {
        return response()->json(['message' => 'Bài học không tồn tại'], 404);
    }

    $lesson->objectives = json_decode($lesson->objectives ?? '[]');

    // Contents
    $contents = DB::table('lesson_contents')
        ->where('lesson_id', $lesson->id)
        ->where('status', 'active')
        ->orderBy('sort_order')
        ->get();

    foreach ($contents as $content) {
        $content->content_json = json_decode($content->content_json ?? '{}');
    }
    $lesson->contents = $contents;

    // Quiz attached
    $quiz = DB::table('quizzes')
        ->where('lesson_id', $lesson->id)
        ->where('status', 'published')
        ->first();

    $lesson->quiz = $quiz;

    return response()->json([
        'data' => $lesson,
    ]);
});

// 5. Vocabulary List
Route::get('/vocabulary', function (Request $request) {
    $query = DB::table('vocabulary')
        ->where('status', 'active');

    if ($request->has('level_id')) {
        $query->where('level_id', $request->query('level_id'));
    }

    $vocabularies = $query->orderBy('word')->get();

    foreach ($vocabularies as $item) {
        $item->meanings = DB::table('vocabulary_meanings')
            ->where('vocabulary_id', $item->id)
            ->get();

        $item->examples = DB::table('vocabulary_examples')
            ->where('vocabulary_id', $item->id)
            ->get();
    }

    return response()->json([
        'data' => $vocabularies,
    ]);
});

// 6. Quiz with questions (do not leak answer keys!)
Route::get('/quizzes/{id}', function ($id) {
    $quiz = DB::table('quizzes')->where('id', $id)->first();
    if (!$quiz) {
        return response()->json(['message' => 'Bài kiểm tra không tồn tại'], 404);
    }

    $questions = DB::table('quiz_questions')
        ->join('questions', 'quiz_questions.question_id', '=', 'questions.id')
        ->where('quiz_questions.quiz_id', $quiz->id)
        ->select('questions.id', 'questions.question_type', 'questions.prompt', 'questions.explanation', 'questions.difficulty', 'quiz_questions.points')
        ->orderBy('quiz_questions.sort_order')
        ->get();

    foreach ($questions as $q) {
        // Expose option_key and content only, hide is_correct
        $q->options = DB::table('question_options')
            ->where('question_id', $q->id)
            ->select('id', 'option_key', 'content')
            ->orderBy('sort_order')
            ->get();
    }

    $quiz->questions = $questions;

    return response()->json([
        'data' => $quiz,
    ]);
});

// 7. Quiz submission & Grading
Route::post('/quizzes/{id}/submit', function (Request $request, $id) {
    $quiz = DB::table('quizzes')->where('id', $id)->first();
    if (!$quiz) {
        return response()->json(['message' => 'Bài kiểm tra không tồn tại'], 404);
    }

    $answers = $request->input('answers', []); // [question_id => selected_option_key]
    $questions = DB::table('quiz_questions')
        ->join('questions', 'quiz_questions.question_id', '=', 'questions.id')
        ->where('quiz_questions.quiz_id', $quiz->id)
        ->select('questions.id', 'questions.prompt', 'questions.explanation', 'quiz_questions.points')
        ->get();

    $totalPoints = 0;
    $earnedPoints = 0;
    $results = [];

    foreach ($questions as $q) {
        $totalPoints += (float) $q->points;
        $userChoice = $answers[$q->id] ?? null;

        $correctOption = DB::table('question_options')
            ->where('question_id', $q->id)
            ->where('is_correct', true)
            ->first();

        $isCorrect = $correctOption && ($correctOption->option_key === $userChoice);
        $points = $isCorrect ? (float) $q->points : 0;
        $earnedPoints += $points;

        $results[] = [
            'question_id' => $q->id,
            'prompt' => $q->prompt,
            'user_choice' => $userChoice,
            'correct_choice' => $correctOption ? $correctOption->option_key : null,
            'is_correct' => $isCorrect,
            'explanation' => $q->explanation,
            'points' => $points,
        ];
    }

    $percent = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 1) : 0;
    $passed = $percent >= (float) $quiz->pass_percent;

    return response()->json([
        'quiz_id' => $quiz->id,
        'title' => $quiz->title,
        'earned_points' => $earnedPoints,
        'total_points' => $totalPoints,
        'score_percent' => $percent,
        'pass_percent' => (float) $quiz->pass_percent,
        'passed' => $passed,
        'results' => $results,
    ]);
});

// Authentication Routes
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:6',
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Đăng ký tài khoản thành công!',
        'user' => $user,
        'token' => $token,
    ], 201);
});

Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'Email hoặc mật khẩu không chính xác.',
        ], 401);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Đăng nhập thành công!',
        'user' => $user,
        'token' => $token,
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
        ]);
    });

    Route::get('/me', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
        ]);
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công!',
        ]);
    });
});
