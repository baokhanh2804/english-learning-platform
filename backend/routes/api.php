<?php

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// ============================================================================
// 1. PUBLIC ROUTES (Mọi người đều có thể truy cập để kiểm tra health & xác thực)
// ============================================================================

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

// ============================================================================
// 2. PROTECTED ROUTES (CHẶN NGƯỜI NGOÀI - CHỈ CHO PHÉP KHI ĐÃ ĐĂNG NHẬP)
// ============================================================================

Route::middleware('auth:sanctum')->group(function () {
    // Thông tin tài khoản
    Route::get('/user', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });

    Route::get('/me', function (Request $request) {
        return response()->json(['user' => $request->user()]);
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công!']);
    });

    // Cấp độ CEFR
    Route::get('/levels', function () {
        $levels = DB::table('levels')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        foreach ($levels as $level) {
            $level->courses_count = DB::table('courses')
                ->where('level_id', $level->id)
                ->where('status', 'published')
                ->count();
        }

        return response()->json(['data' => $levels]);
    });

    // Khóa học
    Route::get('/courses', function (Request $request) {
        $query = DB::table('courses')
            ->join('levels', 'courses.level_id', '=', 'levels.id')
            ->select('courses.*', 'levels.code as level_code', 'levels.name as level_name')
            ->where('courses.status', 'published');

        if ($request->has('level_id')) {
            $query->where('courses.level_id', $request->query('level_id'));
        }

        $courses = $query->orderBy('courses.sort_order')->get();
        return response()->json(['data' => $courses]);
    });

    // Chi tiết khóa học
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
        return response()->json(['data' => $course]);
    });

    // Bài học chi tiết
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

        $contents = DB::table('lesson_contents')
            ->where('lesson_id', $lesson->id)
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        foreach ($contents as $content) {
            $content->content_json = json_decode($content->content_json ?? '{}');
        }
        $lesson->contents = $contents;

        $quiz = DB::table('quizzes')
            ->where('lesson_id', $lesson->id)
            ->where('status', 'published')
            ->first();

        $lesson->quiz = $quiz;
        return response()->json(['data' => $lesson]);
    });

    // Kho từ vựng (chỉ cho học viên đã đăng nhập)
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

        return response()->json(['data' => $vocabularies]);
    });

    // Quiz & Chấm điểm
    Route::get('/quizzes/{id}', function ($id) {
        $quiz = DB::table('quizzes')->where('id', $id)->first();

        if (!$quiz) {
            return response()->json(['message' => 'Bài kiểm tra không tồn tại'], 404);
        }

        $quizQuestions = DB::table('quiz_questions')
            ->join('questions', 'quiz_questions.question_id', '=', 'questions.id')
            ->where('quiz_questions.quiz_id', $quiz->id)
            ->orderBy('quiz_questions.sort_order')
            ->select('questions.*', 'quiz_questions.points')
            ->get();

        foreach ($quizQuestions as $q) {
            $q->options = DB::table('question_options')
                ->where('question_id', $q->id)
                ->select('id', 'option_key', 'content')
                ->orderBy('option_key')
                ->get();
        }

        $quiz->questions = $quizQuestions;
        return response()->json(['data' => $quiz]);
    });

    Route::post('/quizzes/{id}/submit', function (Request $request, $id) {
        $quiz = DB::table('quizzes')->where('id', $id)->first();

        if (!$quiz) {
            return response()->json(['message' => 'Bài kiểm tra không tồn tại'], 404);
        }

        $answers = $request->input('answers', []);

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
});
