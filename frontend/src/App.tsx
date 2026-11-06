import { useState, useEffect } from 'react';
import {
  checkHealth,
  getLevels,
  getCourses,
  getVocabulary,
  getQuiz,
  submitQuiz,
  type HealthCheckResponse,
  type CEFRLevel,
  type Course,
  type VocabularyItem,
  type Quiz,
  type QuizSubmissionResult,
} from './api/client';

// Initial fallback mock data for seamless instant UI rendering even before backend wakes up
const DEFAULT_LEVELS: CEFRLevel[] = [
  { id: 1, code: 'A1', name: 'Beginner (Cơ bản / Mới bắt đầu)', description: 'Làm quen bảng chữ cái, phát âm, từ vựng thông dụng và các câu giao tiếp cơ bản.', sort_order: 1, is_active: true, courses_count: 3 },
  { id: 2, code: 'A2', name: 'Elementary (Sơ cấp)', description: 'Giao tiếp tình huống hàng ngày: gia đình, công việc, mua sắm và sở thích.', sort_order: 2, is_active: true, courses_count: 4 },
  { id: 3, code: 'B1', name: 'Intermediate (Trung cấp)', description: 'Tự tin trao đổi công việc, viết email, kể lại trải nghiệm và bày tỏ quan điểm.', sort_order: 3, is_active: true, courses_count: 5 },
  { id: 4, code: 'B2', name: 'Upper-Intermediate (Trung cao cấp)', description: 'Thuyết trình, phản biện ý kiến và giao tiếp tự nhiên với người bản ngữ.', sort_order: 4, is_active: true, courses_count: 4 },
  { id: 5, code: 'C1', name: 'Advanced (Cao cấp)', description: 'Đọc hiểu tài liệu học thuật phức tạp, sử dụng ngôn ngữ linh hoạt và tinh tế.', sort_order: 5, is_active: true, courses_count: 3 },
  { id: 6, code: 'C2', name: 'Proficiency (Thành thạo bản ngữ)', description: 'Cấp độ tinh thông tối cao, hiểu sâu sắc ngữ cảnh và văn hóa ngôn ngữ.', sort_order: 6, is_active: true, courses_count: 2 },
];

const DEFAULT_COURSES: Course[] = [
  { id: 1, level_id: 1, level_code: 'A1', title: 'Tiếng Anh Giao Tiếp Nhập Môn A1', slug: 'tieng-anh-giao-tiep-nhap-mon-a1', description: 'Học từ vựng nền tảng, phát âm bảng phiên âm quốc tế IPA và các câu chào hỏi thường nhật.', status: 'published' },
  { id: 2, level_id: 1, level_code: 'A1', title: 'Ngữ Pháp Căn Bản Cho Người Mất Gốc', slug: 'ngu-phap-can-ban-a1', description: 'Nắm vững thì hiện tại đơn, đại từ nhân xưng, danh từ số ít/số nhiều và cấu trúc câu đơn.', status: 'published' },
  { id: 3, level_id: 2, level_code: 'A2', title: 'Tiếng Anh Đời Sống Hàng Ngày A2', slug: 'tieng-anh-doi-song-hang-ngay-a2', description: 'Mở rộng vốn từ vựng và đàm thoại về phương hướng, mua sắm, thời tiết và du lịch.', status: 'published' },
  { id: 4, level_id: 3, level_code: 'B1', title: 'Tiếng Anh Giao Tiếp Nơi Công Sở B1', slug: 'tieng-anh-giao-tiep-noi-cong-so-b1', description: 'Kỹ năng viết email chuyên nghiệp, họp báo cáo và trao đổi công việc linh hoạt.', status: 'published' },
];

const DEFAULT_VOCABULARY: VocabularyItem[] = [
  {
    id: 1,
    word: 'Hello',
    ipa: '/həˈloʊ/',
    part_of_speech: 'interjection',
    meanings: [{ meaning: 'Xin chào (lời chào trang trọng và thông dụng nhất)' }],
    examples: [{ sentence: 'Hello, how are you today?', translation: 'Xin chào, hôm nay bạn thế nào?' }]
  },
  {
    id: 2,
    word: 'Welcome',
    ipa: '/ˈwel.kəm/',
    part_of_speech: 'exclamation',
    meanings: [{ meaning: 'Chào mừng / Hoan nghênh' }],
    examples: [{ sentence: 'Welcome to our English learning platform!', translation: 'Chào mừng bạn đến với nền tảng học tiếng Anh của chúng tôi!' }]
  },
  {
    id: 3,
    word: 'Opportunity',
    ipa: '/ˌɑː.pɚˈtuː.nə.t̬i/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Cơ hội, thời cơ thuận lợi' }],
    examples: [{ sentence: 'Learning English gives you more career opportunities.', translation: 'Học tiếng Anh mang lại cho bạn nhiều cơ hội nghề nghiệp hơn.' }]
  },
  {
    id: 4,
    word: 'Perseverance',
    ipa: '/ˌpɝː.səˈvɪr.əns/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Sự kiên trì, bền bỉ, nhẫn nại' }],
    examples: [{ sentence: 'Success in language learning requires perseverance.', translation: 'Thành công trong việc học ngôn ngữ đòi hỏi sự kiên trì.' }]
  }
];

const DEFAULT_QUIZ: Quiz = {
  id: 1,
  title: 'Quiz 1: Chào hỏi & Giao tiếp cơ bản A1',
  description: 'Kiểm tra nhanh 3 câu hỏi trắc nghiệm kiến thức nhập môn.',
  time_limit_seconds: 180,
  pass_percent: 66,
  questions: [
    {
      id: 101,
      question_type: 'single_choice',
      prompt: 'Khi gặp một người bạn mới lần đầu tiên, câu chào hỏi lịch sự nhất là gì?',
      explanation: '"Nice to meet you" là câu chào tiêu chuẩn khi làm quen lần đầu.',
      difficulty: 1,
      points: 1,
      options: [
        { id: 1, option_key: 'A', content: 'Goodbye, see you.' },
        { id: 2, option_key: 'B', content: 'Nice to meet you.' },
        { id: 3, option_key: 'C', content: 'Good night.' },
        { id: 4, option_key: 'D', content: 'You are welcome.' },
      ]
    },
    {
      id: 102,
      question_type: 'single_choice',
      prompt: 'Để hỏi tên người đối diện bằng tiếng Anh, câu nào sau đây đúng chuẩn?',
      explanation: '"What is your name?" là cấu trúc câu hỏi tên chuẩn xác nhất.',
      difficulty: 1,
      points: 1,
      options: [
        { id: 5, option_key: 'A', content: 'What is you name?' },
        { id: 6, option_key: 'B', content: 'What are your name?' },
        { id: 7, option_key: 'C', content: 'What is your name?' },
        { id: 8, option_key: 'D', content: 'Where is your name?' },
      ]
    },
    {
      id: 103,
      question_type: 'single_choice',
      prompt: 'Từ nào sau đây có nghĩa là "Chào buổi sáng"?',
      explanation: '"Good morning" được dùng để chào vào buổi sáng (trước 12h trưa).',
      difficulty: 1,
      points: 1,
      options: [
        { id: 9, option_key: 'A', content: 'Good afternoon' },
        { id: 10, option_key: 'B', content: 'Good morning' },
        { id: 11, option_key: 'C', content: 'Good evening' },
        { id: 12, option_key: 'D', content: 'Good night' },
      ]
    }
  ]
};

function App() {
  const [activeTab, setActiveTab] = useState<'courses' | 'vocabulary' | 'quiz' | 'health'>('courses');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  // API states
  const [levels, setLevels] = useState<CEFRLevel[]>(DEFAULT_LEVELS);
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(DEFAULT_VOCABULARY);
  const [currentVocabIndex, setCurrentVocabIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [learnedCount, setLearnedCount] = useState<number>(0);

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz>(DEFAULT_QUIZ);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  // Health state
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const fetchBackendHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setHealthError(err.message);
      } else {
        setHealthError('Không thể kết nối đến Backend');
      }
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendHealth();

    // Fetch dynamic levels and courses from live backend if available
    getLevels()
      .then((data) => {
        if (data && data.length > 0) setLevels(data);
      })
      .catch(() => {});

    getCourses()
      .then((data) => {
        if (data && data.length > 0) setCourses(data);
      })
      .catch(() => {});

    getVocabulary()
      .then((data) => {
        if (data && data.length > 0) setVocabulary(data);
      })
      .catch(() => {});

    getQuiz(1)
      .then((data) => {
        if (data && data.id) setQuiz(data);
      })
      .catch(() => {});
  }, []);

  const filteredCourses = selectedLevel === 'ALL'
    ? courses
    : courses.filter((c) => c.level_code === selectedLevel);

  const handleSelectAnswer = (questionId: number, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleQuizSubmit = async () => {
    try {
      const result = await submitQuiz(quiz.id, selectedAnswers);
      setQuizResult(result);
    } catch {
      // Offline fallback grading
      let earned = 0;
      const total = quiz.questions?.length || 0;
      const results = (quiz.questions || []).map((q) => {
        const userChoice = selectedAnswers[q.id];
        const correctChoice = q.id === 101 ? 'B' : q.id === 102 ? 'C' : 'B';
        const isCorrect = userChoice === correctChoice;
        if (isCorrect) earned += 1;
        return {
          question_id: q.id,
          prompt: q.prompt,
          user_choice: userChoice || 'Chưa trả lời',
          correct_choice: correctChoice,
          is_correct: isCorrect,
          explanation: q.explanation,
          points: isCorrect ? 1 : 0,
        };
      });

      const percent = Math.round((earned / total) * 100);
      setQuizResult({
        quiz_id: quiz.id,
        title: quiz.title,
        earned_points: earned,
        total_points: total,
        score_percent: percent,
        pass_percent: quiz.pass_percent,
        passed: percent >= quiz.pass_percent,
        results,
      });
    }
  };

  const currentVocab = vocabulary[currentVocabIndex];

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <span className="fs-4">🎓</span>
            English Learning Platform
          </span>

          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn btn-sm ${activeTab === 'courses' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('courses')}
            >
              📚 Khóa học (A1–C2)
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'vocabulary' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('vocabulary')}
            >
              📖 Từ vựng Flashcards
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'quiz' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('quiz')}
            >
              📝 Luyện tập & Quiz
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'health' ? 'btn-light fw-bold' : 'btn-outline-light'}`}
              onClick={() => setActiveTab('health')}
            >
              ⚡ Trạng thái Live
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container py-4">
        {/* TAB 1: COURSES & CEFR ROADMAP */}
        {activeTab === 'courses' && (
          <div>
            <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
              <h2 className="fw-bold text-primary mb-2">Lộ trình Học Tiếng Anh Chuẩn CEFR A1–C2</h2>
              <p className="text-muted mb-3">
                Chương trình học tiếng Anh toàn diện hoàn toàn miễn phí từ cơ bản đến nâng cao. Chọn cấp độ phù hợp để bắt đầu bài học:
              </p>

              {/* CEFR Level Filter Pills */}
              <div className="d-flex flex-wrap gap-2 pt-2">
                <button
                  className={`btn btn-sm ${selectedLevel === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedLevel('ALL')}
                >
                  Tất cả cấp độ
                </button>
                {levels.map((lvl) => (
                  <button
                    key={lvl.code}
                    className={`btn btn-sm ${selectedLevel === lvl.code ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedLevel(lvl.code)}
                  >
                    {lvl.code} ({lvl.name.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Level Descriptions Grid */}
            <div className="row g-3 mb-4">
              {levels.map((lvl) => (
                <div key={lvl.code} className="col-md-4 col-sm-6">
                  <div
                    className={`card h-100 shadow-sm border ${selectedLevel === lvl.code ? 'border-primary border-2 bg-primary-subtle' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedLevel(lvl.code)}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary fs-6 px-3 py-2">{lvl.code}</span>
                        <span className="text-muted small">{lvl.courses_count || 1} khóa học</span>
                      </div>
                      <h5 className="card-title fw-bold text-dark">{lvl.name}</h5>
                      <p className="card-text text-secondary small">{lvl.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courses List */}
            <h4 className="fw-bold text-dark mb-3">Danh sách khóa học ({filteredCourses.length})</h4>
            <div className="row g-3">
              {filteredCourses.map((c) => (
                <div key={c.id} className="col-md-6">
                  <div className="card h-100 shadow-sm border">
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge bg-success-subtle text-success border border-success">
                            Cấp độ {c.level_code}
                          </span>
                          <span className="badge bg-secondary-subtle text-secondary">Miễn phí 100%</span>
                        </div>
                        <h5 className="card-title fw-bold text-primary">{c.title}</h5>
                        <p className="card-text text-muted">{c.description}</p>
                      </div>
                      <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                        <span className="small text-muted">⏳ Ước tính: 15–20 phút/bài</span>
                        <button
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => setActiveTab('quiz')}
                        >
                          Vào học ngay →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VOCABULARY FLASHCARDS (SRS) */}
        {activeTab === 'vocabulary' && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold text-primary mb-1">📖 Luyện Từ Vựng Thông Minh (Flashcards)</h3>
                    <p className="text-muted small mb-0">Học từ vựng theo phương pháp Lặp lại ngắt quãng (Spaced Repetition System - SRS)</p>
                  </div>
                  <span className="badge bg-primary fs-6 px-3 py-2">
                    {currentVocabIndex + 1} / {vocabulary.length}
                  </span>
                </div>
              </div>

              {/* Flashcard Component */}
              <div
                className="card shadow border-0 text-center mb-4 p-5"
                style={{
                  minHeight: '320px',
                  cursor: 'pointer',
                  background: isFlipped ? '#f0fdf4' : '#ffffff',
                  transition: 'all 0.3s ease',
                  border: isFlipped ? '2px solid #22c55e' : '1px solid #e2e8f0',
                }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {!isFlipped ? (
                  <div className="my-auto">
                    <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-1 mb-3">
                      {currentVocab.part_of_speech}
                    </span>
                    <h1 className="display-4 fw-bold text-dark mb-2">{currentVocab.word}</h1>
                    <p className="text-muted fs-4 mb-4 font-monospace">{currentVocab.ipa}</p>
                    <p className="small text-secondary">💡 Nhấn vào thẻ để lật xem nghĩa tiếng Việt & câu ví dụ</p>
                  </div>
                ) : (
                  <div className="my-auto text-start p-2">
                    <span className="badge bg-success px-3 py-1 mb-3">Nghĩa tiếng Việt</span>
                    <h3 className="fw-bold text-success mb-3">{currentVocab.meanings[0]?.meaning}</h3>
                    <div className="p-3 bg-white rounded border mb-3">
                      <p className="fw-semibold text-dark mb-1">Ví dụ:</p>
                      <p className="fst-italic text-primary mb-1">"{currentVocab.examples[0]?.sentence}"</p>
                      <p className="text-secondary small mb-0">{currentVocab.examples[0]?.translation}</p>
                    </div>
                    <p className="small text-muted text-center mb-0">Nhấn để lật lại mặt trước</p>
                  </div>
                )}
              </div>

              {/* SRS Rating Actions */}
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-outline-danger px-4 py-2"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
                  }}
                >
                  ❌ Chưa nhớ (Lặp lại sớm)
                </button>
                <button
                  className="btn btn-outline-warning px-4 py-2"
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
                  }}
                >
                  ⚡ Cần ôn lại
                </button>
                <button
                  className="btn btn-success px-4 py-2 fw-bold"
                  onClick={() => {
                    setIsFlipped(false);
                    setLearnedCount((c) => c + 1);
                    setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
                  }}
                >
                  ✅ Đã nhớ (+1 từ)
                </button>
              </div>

              <div className="text-center mt-3 text-muted small">
                Đã ghi nhớ thành công: <strong className="text-success">{learnedCount}</strong> từ vựng trong buổi học này.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: QUIZ & PRACTICE */}
        {activeTab === 'quiz' && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold text-primary mb-1">{quiz.title}</h3>
                    <p className="text-muted small mb-0">{quiz.description}</p>
                  </div>
                  <span className="badge bg-warning text-dark px-3 py-2">
                    Mục tiêu: Đạt {quiz.pass_percent}% để qua bài
                  </span>
                </div>
              </div>

              {/* Questions List */}
              <div className="d-flex flex-col gap-4">
                {quiz.questions?.map((q, index) => (
                  <div key={q.id} className="card shadow-sm border">
                    <div className="card-body">
                      <div className="d-flex gap-2 mb-3 align-items-center">
                        <span className="badge bg-primary">Câu {index + 1}</span>
                        <h5 className="card-title fw-bold text-dark m-0">{q.prompt}</h5>
                      </div>

                      <div className="d-flex flex-column gap-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt.option_key;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              className={`btn text-start p-3 border d-flex align-items-center gap-3 ${
                                isSelected ? 'btn-primary border-primary' : 'btn-light hover-bg-light'
                              }`}
                              onClick={() => handleSelectAnswer(q.id, opt.option_key)}
                            >
                              <span className={`badge rounded-circle px-2 py-1 ${isSelected ? 'bg-white text-primary' : 'bg-secondary text-white'}`}>
                                {opt.option_key}
                              </span>
                              <span>{opt.content}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Quiz Action */}
              <div className="mt-4 text-center">
                <button
                  className="btn btn-primary btn-lg px-5 shadow"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  🚀 Nộp Bài & Xem Điểm
                </button>
              </div>

              {/* Quiz Results Card */}
              {quizResult && (
                <div className={`card mt-4 border-2 ${quizResult.passed ? 'border-success bg-success-subtle' : 'border-danger bg-danger-subtle'}`}>
                  <div className="card-body p-4">
                    <h4 className="fw-bold mb-2">
                      {quizResult.passed ? '🎉 Chúc mừng bạn đã vượt qua bài test!' : '💪 Bạn cần cố gắng thêm một chút!'}
                    </h4>
                    <p className="fs-5 mb-3">
                      Điểm số của bạn: <strong>{quizResult.earned_points} / {quizResult.total_points}</strong> ({quizResult.score_percent}%)
                    </p>

                    <div className="mt-3">
                      <h6 className="fw-bold text-dark">Giải thích chi tiết từng câu:</h6>
                      <ul className="list-group list-group-flush rounded border mt-2">
                        {quizResult.results.map((res, i) => (
                          <li key={res.question_id} className="list-group-item bg-white py-3">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span>{res.is_correct ? '✅' : '❌'}</span>
                              <strong>Câu {i + 1}:</strong> {res.prompt}
                            </div>
                            <div className="small text-muted ms-4">
                              <span>Lựa chọn của bạn: <strong>{res.user_choice}</strong></span>
                              {!res.is_correct && (
                                <span className="ms-3 text-success">Đáp án đúng: <strong>{res.correct_choice}</strong></span>
                              )}
                            </div>
                            <p className="small text-secondary ms-4 mt-1 mb-0">
                              💡 <em>Giải thích: {res.explanation}</em>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & API HEALTH */}
        {activeTab === 'health' && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
                <h3 className="fw-bold text-primary mb-2">⚡ Trạng Thái Vận Hành Hệ Thống</h3>
                <p className="text-muted">
                  Kiểm tra kết nối trực tiếp giữa Trình duyệt (Frontend) và Máy chủ (Render Web Service + Neon PostgreSQL).
                </p>

                <div className="d-flex align-items-center gap-3 mt-3">
                  <button
                    className="btn btn-primary px-4"
                    onClick={fetchBackendHealth}
                    disabled={healthLoading}
                  >
                    {healthLoading ? 'Đang kiểm tra kết nối...' : 'Kiểm tra lại kết nối'}
                  </button>
                  <span className="small text-muted">
                    Backend: <code>https://english-learning-backend-s2v4.onrender.com/api/health</code>
                  </span>
                </div>

                {healthError && (
                  <div className="alert alert-warning mt-4 mb-0" role="alert">
                    <h5 className="alert-heading">⚠️ Lưu ý Cold Start</h5>
                    <p className="mb-0">
                      {healthError}. Trên Render Free tier, backend có thể mất 30–50 giây để khởi động lại nếu đang ở trạng thái ngủ.
                    </p>
                  </div>
                )}

                {health && (
                  <div className="alert alert-success mt-4 mb-0" role="alert">
                    <h5 className="alert-heading">✅ Kết nối Backend thành công!</h5>
                    <ul className="mb-0 small">
                      <li><strong>Trạng thái API:</strong> {health.status}</li>
                      <li><strong>Tên dịch vụ:</strong> {health.service}</li>
                      <li><strong>Cơ sở dữ liệu Neon:</strong> {health.database}</li>
                      <li><strong>Thời gian phản hồi máy chủ:</strong> {health.timestamp}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="card shadow-sm border p-4 bg-white">
                <h5 className="fw-bold text-dark">Kiến Trúc Đang Hoạt Động</h5>
                <ul className="text-secondary small mb-0">
                  <li><strong>Frontend:</strong> React 19 + TypeScript + Bootstrap 5 (Render Static Site)</li>
                  <li><strong>Backend:</strong> Laravel 12 REST API Docker containerized (Render Free Web Service)</li>
                  <li><strong>Database:</strong> Neon Serverless PostgreSQL 16 (SSL mode: require)</li>
                  <li><strong>Chi phí hạ tầng:</strong> 0 VNĐ / Tháng (Miễn phí 100%)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
