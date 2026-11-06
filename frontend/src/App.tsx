import React, { useState, useEffect, useMemo } from 'react';
import {
  checkHealth,
  getVocabulary,
  getQuiz,
  submitQuiz,
  type HealthCheckResponse,
  type VocabularyItem,
  type Quiz,
  type QuizSubmissionResult,
} from './api/client';
import './App.css';

// Rich fallback vocabulary dataset with audio IPA & examples
const INITIAL_VOCABULARY: VocabularyItem[] = [
  {
    id: 1,
    word: 'Hello',
    ipa: '/həˈloʊ/',
    part_of_speech: 'interjection',
    meanings: [{ meaning: 'Xin chào (lời chào trang trọng và thân thiện)' }],
    examples: [{ sentence: 'Hello, nice to meet you!', translation: 'Xin chào, rất vui được gặp bạn!' }]
  },
  {
    id: 2,
    word: 'Welcome',
    ipa: '/ˈwel.kəm/',
    part_of_speech: 'exclamation',
    meanings: [{ meaning: 'Chào mừng / Hoan nghênh nhiệt liệt' }],
    examples: [{ sentence: 'Welcome to our vocabulary learning journey!', translation: 'Chào mừng bạn đến với hành trình học từ vựng!' }]
  },
  {
    id: 3,
    word: 'Gratitude',
    ipa: '/ˈɡræt̬.ə.tuːd/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Lòng biết ơn, sự cảm kích sâu sắc' }],
    examples: [{ sentence: 'Expressing gratitude improves happiness.', translation: 'Bày tỏ lòng biết ơn giúp nâng cao hạnh phúc.' }]
  },
  {
    id: 4,
    word: 'Opportunity',
    ipa: '/ˌɑː.pɚˈtuː.nə.t̬i/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Cơ hội, thời cơ thuận lợi để phát triển' }],
    examples: [{ sentence: 'Every challenge is an opportunity to learn.', translation: 'Mỗi thử thách là một cơ hội để học hỏi.' }]
  },
  {
    id: 5,
    word: 'Perseverance',
    ipa: '/ˌpɝː.səˈvɪr.əns/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Sự kiên trì, bền bỉ vượt qua khó khăn' }],
    examples: [{ sentence: 'Perseverance is the key to mastering English.', translation: 'Sự kiên trì là chìa khóa để tinh thông tiếng Anh.' }]
  },
  {
    id: 6,
    word: 'Resilient',
    ipa: '/rɪˈzɪl.jənt/',
    part_of_speech: 'adjective',
    meanings: [{ meaning: 'Kiên cường, có khả năng phục hồi nhanh' }],
    examples: [{ sentence: 'She remained resilient in the face of difficulties.', translation: 'Cô ấy luôn kiên cường trước mọi khó khăn.' }]
  },
  {
    id: 7,
    word: 'Curiosity',
    ipa: '/ˌkjʊr.iˈɑː.sə.t̬i/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Lòng hiếu kỳ, niềm khao khát học hỏi điều mới' }],
    examples: [{ sentence: 'Curiosity fuels creativity and intelligence.', translation: 'Sự tò mò nuôi dưỡng sáng tạo và trí tuệ.' }]
  },
  {
    id: 8,
    word: 'Accomplish',
    ipa: '/əˈkɑːm.plɪʃ/',
    part_of_speech: 'verb',
    meanings: [{ meaning: 'Hoàn thành xuất sắc, đạt được mục tiêu' }],
    examples: [{ sentence: 'You can accomplish anything with consistent practice.', translation: 'Bạn có thể đạt được mọi thứ nếu kiên trì luyện tập.' }]
  },
  {
    id: 9,
    word: 'Eloquent',
    ipa: '/ˈel.ə.kwənt/',
    part_of_speech: 'adjective',
    meanings: [{ meaning: 'Hùng biện, diễn đạt lưu loát và truyền cảm' }],
    examples: [{ sentence: 'He gave an eloquent speech at the conference.', translation: 'Anh ấy đã có một bài phát biểu hùng biện tại hội nghị.' }]
  },
  {
    id: 10,
    word: 'Serendipity',
    ipa: '/ˌser.ənˈdɪp.ə.t̬i/',
    part_of_speech: 'noun',
    meanings: [{ meaning: 'Sự may mắn tình cờ, duyên may bất ngờ' }],
    examples: [{ sentence: 'Finding this app was pure serendipity.', translation: 'Tìm thấy ứng dụng này thực sự là một duyên may bất ngờ.' }]
  }
];

const DEFAULT_QUIZ: Quiz = {
  id: 1,
  title: 'Quiz 1: Chào hỏi & Giao tiếp cơ bản A1',
  description: 'Kiểm tra 3 câu hỏi trắc nghiệm kiểm tra phản xạ từ vựng.',
  time_limit_seconds: 180,
  pass_percent: 66,
  questions: [
    {
      id: 101,
      question_type: 'single_choice',
      prompt: 'Khi gặp người bạn mới lần đầu tiên, câu chào lịch sự nhất là gì?',
      explanation: '"Nice to meet you" là lời chào tiêu chuẩn khi gặp mặt lần đầu.',
      difficulty: 1,
      points: 1,
      options: [
        { id: 1, option_key: 'A', content: 'Goodbye, see you later.' },
        { id: 2, option_key: 'B', content: 'Nice to meet you.' },
        { id: 3, option_key: 'C', content: 'Good night.' },
        { id: 4, option_key: 'D', content: 'You are welcome.' },
      ]
    },
    {
      id: 102,
      question_type: 'single_choice',
      prompt: 'Từ nào sau đây mang ý nghĩa "Sự kiên trì, bền bỉ"?',
      explanation: '"Perseverance" (/ˌpɝː.səˈvɪr.əns/) nghĩa là sự kiên trì vượt khó.',
      difficulty: 2,
      points: 1,
      options: [
        { id: 5, option_key: 'A', content: 'Opportunity' },
        { id: 6, option_key: 'B', content: 'Perseverance' },
        { id: 7, option_key: 'C', content: 'Curiosity' },
        { id: 8, option_key: 'D', content: 'Gratitude' },
      ]
    },
    {
      id: 103,
      question_type: 'single_choice',
      prompt: 'Từ "Resilient" thuộc loại từ nào và mang ý nghĩa gì?',
      explanation: '"Resilient" là tính từ (adjective), nghĩa là kiên cường, phục hồi nhanh.',
      difficulty: 2,
      points: 1,
      options: [
        { id: 9, option_key: 'A', content: 'Tính từ - Kiên cường, phục hồi nhanh' },
        { id: 10, option_key: 'B', content: 'Danh từ - Lòng biết ơn' },
        { id: 11, option_key: 'C', content: 'Động từ - Hoàn thành mục tiêu' },
        { id: 12, option_key: 'D', content: 'Trạng từ - Một cách may mắn' },
      ]
    }
  ]
};

// Web Audio sound effects (synthesized, 0 dependencies)
const playSoundEffect = (type: 'correct' | 'wrong' | 'flip' | 'win') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'correct') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.1);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.3);
    } else if (type === 'wrong') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.1;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }
  } catch {
    // Audio context may be blocked by browser policy before first interaction
  }
};

// Web Speech API Native Text-to-Speech
const speakWord = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88; // Natural, clear pacing for language learners
    window.speechSynthesis.speak(utterance);
  }
};

export default function App() {
  // Navigation tabs: 'flashcards' | 'match' | 'spell' | 'quiz' | 'deck' | 'courses' | 'health'
  const [activeTab, setActiveTab] = useState<'flashcards' | 'match' | 'spell' | 'quiz' | 'deck' | 'health'>('flashcards');

  // Gamification state
  const [streak] = useState<number>(3);
  const [xp, setXp] = useState<number>(180);
  const [gems, setGems] = useState<number>(95);
  const [hearts] = useState<number>(5);

  // Vocabulary dataset & filters
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(INITIAL_VOCABULARY);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set([1, 4]));
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 3D Flashcard State
  const [currentVocabIndex, setCurrentVocabIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [learnedCount, setLearnedCount] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Match Minigame State
  interface MatchCardItem {
    id: string;
    originalId: number;
    text: string;
    type: 'en' | 'vi';
  }
  const [matchCards, setMatchCards] = useState<MatchCardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchCardItem[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [matchGameWon, setMatchGameWon] = useState<boolean>(false);

  // Spell Practice State
  const [spellInput, setSpellInput] = useState<string>('');
  const [spellFeedback, setSpellFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  // Quiz State
  const [quiz, setQuiz] = useState<Quiz>(DEFAULT_QUIZ);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  // Backend Health State
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Initialize Match Game
  const initMatchGame = React.useCallback(() => {
    // Pick 4 words for a fast exciting round
    const sample = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 4);
    const cards: MatchCardItem[] = [];

    sample.forEach((item) => {
      cards.push({ id: `en-${item.id}`, originalId: item.id, text: item.word, type: 'en' });
      cards.push({ id: `vi-${item.id}`, originalId: item.id, text: item.meanings[0]?.meaning || item.word, type: 'vi' });
    });

    // Shuffle cards
    setMatchCards(cards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedIds(new Set());
    setWrongPair([]);
    setMatchGameWon(false);
  }, [vocabulary]);

  // Load dynamic data on mount
  useEffect(() => {
    fetchBackendHealth();

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

  useEffect(() => {
    if (activeTab === 'match') {
      initMatchGame();
    }
  }, [activeTab, initMatchGame]);

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

  const handlePronounce = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSpeaking(true);
    speakWord(text);
    setTimeout(() => setIsSpeaking(false), 800);
  };

  // Flip Flashcard
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
    playSoundEffect('flip');
  };

  // Rate Flashcard with SRS algorithm
  const handleRateCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    let earnedXp = 5;
    if (rating === 'again') {
      playSoundEffect('wrong');
    } else {
      playSoundEffect('correct');
      if (rating === 'easy') earnedXp = 20;
      else if (rating === 'good') earnedXp = 15;
      else earnedXp = 10;
      setLearnedCount((prev) => prev + 1);
    }

    setXp((prev) => prev + earnedXp);
    setIsFlipped(false);

    // Next card with loop
    setTimeout(() => {
      setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
    }, 200);
  };

  // Bookmark toggle
  const toggleBookmark = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Match Card click
  const handleMatchCardClick = (card: MatchCardItem) => {
    if (matchedIds.has(card.id) || selectedCards.some((c) => c.id === card.id) || selectedCards.length >= 2) {
      return;
    }

    // Play card click audio
    if (card.type === 'en') {
      speakWord(card.text);
    } else {
      playSoundEffect('flip');
    }

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      const [first, second] = newSelection;
      if (first.originalId === second.originalId && first.type !== second.type) {
        // Correct match!
        playSoundEffect('correct');
        const nextMatched = new Set(matchedIds);
        nextMatched.add(first.id);
        nextMatched.add(second.id);
        setMatchedIds(nextMatched);
        setSelectedCards([]);
        setXp((prev) => prev + 25);
        setGems((prev) => prev + 5);

        // Check if all matched
        if (nextMatched.size === matchCards.length) {
          setTimeout(() => {
            playSoundEffect('win');
            setMatchGameWon(true);
            setXp((prev) => prev + 50);
          }, 300);
        }
      } else {
        // Wrong pair
        playSoundEffect('wrong');
        setWrongPair([first.id, second.id]);
        setTimeout(() => {
          setSelectedCards([]);
          setWrongPair([]);
        }, 600);
      }
    }
  };

  // Spell Practice Submission
  const handleSpellCheck = () => {
    const currentWord = vocabulary[currentVocabIndex];
    if (!currentWord) return;

    if (spellInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setSpellFeedback('correct');
      playSoundEffect('correct');
      setXp((prev) => prev + 20);
      setGems((prev) => prev + 2);
    } else {
      setSpellFeedback('wrong');
      playSoundEffect('wrong');
    }
  };

  const handleNextSpellWord = () => {
    setSpellInput('');
    setSpellFeedback('none');
    setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
  };

  // Filtered vocabulary for dictionary deck
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter((v) => {
      const matchSearch =
        v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.meanings.some((m) => m.meaning.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [vocabulary, searchTerm]);

  const currentVocab = vocabulary[currentVocabIndex] || vocabulary[0];

  // Part of speech badge color helper
  const getPosBadgeColor = (pos: string) => {
    switch (pos.toLowerCase()) {
      case 'noun': return 'bg-primary text-white';
      case 'verb': return 'bg-success text-white';
      case 'adjective': return 'bg-info text-dark';
      case 'interjection':
      case 'exclamation': return 'bg-warning text-dark';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. TOP APP BAR - Duolingo / Anki Gamified Header */}
      <header className="app-topbar shadow-sm">
        <div className="app-container d-flex align-items-center justify-content-between">
          {/* Logo & Mascot */}
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '2rem' }}>🦉</span>
            <div>
              <div className="fw-bolder fs-5 text-dark" style={{ letterSpacing: '-0.5px' }}>
                Vocab<span style={{ color: '#10b981' }}>Master</span>
              </div>
              <small className="text-muted d-none d-sm-inline" style={{ fontSize: '0.75rem' }}>
                Học từ vựng thông minh SRS
              </small>
            </div>
          </div>

          {/* Gamification Stats Bar */}
          <div className="d-flex align-items-center gap-2">
            <div className="stat-chip stat-chip-streak" title="Chuỗi ngày học liên tục">
              <span>🔥</span>
              <span>{streak}</span>
            </div>

            <div className="stat-chip stat-chip-xp" title="Điểm kinh nghiệm XP">
              <span>⚡</span>
              <span>{xp}</span>
            </div>

            <div className="stat-chip stat-chip-gems" title="Kim cương tích lũy">
              <span>💎</span>
              <span>{gems}</span>
            </div>

            <div className="stat-chip stat-chip-hearts" title="Số tim còn lại">
              <span>❤️</span>
              <span>{hearts}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MODE SELECTOR TABS (App-like pills) */}
      <div className="bg-white border-bottom py-2">
        <div className="app-container d-flex gap-2 overflow-auto py-1">
          <button
            className={`app-nav-pill ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <span>🗂️</span> Thẻ Flashcards
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            <span>🎮</span> Ghép Từ Nhanh
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'spell' ? 'active' : ''}`}
            onClick={() => setActiveTab('spell')}
          >
            <span>✍️</span> Luyện Nghe & Gõ
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <span>📝</span> Trắc nghiệm Quiz
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'deck' ? 'active' : ''}`}
            onClick={() => setActiveTab('deck')}
          >
            <span>📚</span> Sổ Từ Vựng ({vocabulary.length})
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            <span>⚡</span> Trạng thái Cloud
          </button>
        </div>
      </div>

      {/* 3. MAIN APP CONTENT AREA */}
      <main className="app-container py-4 flex-grow-1">

        {/* TAB 1: 3D FLASHCARDS SRS */}
        {activeTab === 'flashcards' && currentVocab && (
          <div className="mx-auto" style={{ maxWidth: '520px' }}>
            {/* Top Card Progress Indicator */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-muted" style={{ fontSize: '0.9rem' }}>
                Thẻ {currentVocabIndex + 1} / {vocabulary.length}
              </span>
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                ✨ Đã nhớ: {learnedCount} từ
              </span>
            </div>

            {/* Duolingo style progress bar */}
            <div className="duo-progress mb-4">
              <div
                className="duo-progress-bar"
                style={{ width: `${((currentVocabIndex + 1) / vocabulary.length) * 100}%` }}
              />
            </div>

            {/* 3D Flip Card Container */}
            <div className="perspective-container mb-3">
              <div
                className={`flashcard-3d ${isFlipped ? 'is-flipped' : ''}`}
                onClick={handleCardFlip}
                title="Bấm vào thẻ để lật xem nghĩa"
              >
                {/* MẶT TRƯỚC (FRONT) */}
                <div className="card-face">
                  {/* Top Header of Card */}
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span className={`badge px-3 py-2 rounded-pill text-uppercase ${getPosBadgeColor(currentVocab.part_of_speech)}`}>
                      {currentVocab.part_of_speech}
                    </span>

                    <button
                      className="btn btn-sm btn-light rounded-circle p-2 text-warning"
                      onClick={(e) => toggleBookmark(currentVocab.id, e)}
                      title="Đánh dấu từ yêu thích"
                    >
                      {bookmarkedIds.has(currentVocab.id) ? '⭐' : '☆'}
                    </button>
                  </div>

                  {/* Word & Phonetic Center */}
                  <div className="text-center my-auto">
                    <h1 className="display-4 fw-bolder mb-2 text-dark" style={{ letterSpacing: '-1px' }}>
                      {currentVocab.word}
                    </h1>

                    <p className="fs-4 text-muted fw-semibold mb-3">
                      {currentVocab.ipa}
                    </p>

                    {/* Pronunciation Audio Button */}
                    <button
                      className={`audio-play-btn ${isSpeaking ? 'speaker-active' : ''}`}
                      onClick={(e) => handlePronounce(currentVocab.word, e)}
                      title="Phát âm từ vựng (giọng Anh-Mỹ bản ngữ)"
                    >
                      <span style={{ fontSize: '1.5rem' }}>🔊</span>
                    </button>
                  </div>

                  {/* Bottom hint */}
                  <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    <span>🔄 Chạm vào thẻ để lật xem nghĩa & ví dụ</span>
                  </div>
                </div>

                {/* MẶT SAU (BACK) */}
                <div className="card-face card-face-back">
                  {/* Top Header of Back Face */}
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span className="badge bg-success text-white px-3 py-2 rounded-pill">
                      Ý NGHĨA & NGỮ CẢNH
                    </span>
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill px-3 py-1"
                      onClick={(e) => handlePronounce(currentVocab.word, e)}
                    >
                      🔊 Nghe lại
                    </button>
                  </div>

                  {/* Vietnamese Definition */}
                  <div className="text-center my-auto">
                    <h2 className="fw-bolder text-success mb-3" style={{ fontSize: '1.75rem' }}>
                      {currentVocab.meanings[0]?.meaning}
                    </h2>

                    {currentVocab.examples && currentVocab.examples[0] && (
                      <div className="p-3 rounded-4 bg-white border border-success-subtle shadow-sm text-start mb-2">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                          <p className="fw-bold text-dark mb-1 fs-6">
                            "{currentVocab.examples[0].sentence}"
                          </p>
                          <button
                            className="btn btn-sm btn-light text-primary p-1 border-0"
                            onClick={(e) => handlePronounce(currentVocab.examples[0].sentence, e)}
                            title="Nghe phát âm cả câu"
                          >
                            🔊
                          </button>
                        </div>
                        <p className="text-muted mb-0 small fst-italic">
                          👉 {currentVocab.examples[0].translation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Flip back hint */}
                  <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    <span>🔄 Chạm để quay lại mặt trước</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SRS Rating Control Bar (4 Anki levels) */}
            <div className="bg-white p-3 rounded-4 shadow-sm border mb-3">
              <div className="text-center text-muted small fw-bold mb-2">
                BẠN ĐÃ NHỚ TỪ NÀY NHƯ THẾ NÀO? (SRS)
              </div>
              <div className="row g-2 text-center">
                <div className="col-3">
                  <button
                    className="btn btn-duo btn-duo-red w-100 py-2"
                    onClick={() => handleRateCard('again')}
                  >
                    <span>🔴</span>
                    <span className="d-none d-sm-inline">Lại</span>
                  </button>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>+1 phút</small>
                </div>

                <div className="col-3">
                  <button
                    className="btn btn-duo btn-duo-yellow w-100 py-2"
                    onClick={() => handleRateCard('hard')}
                  >
                    <span>🟡</span>
                    <span className="d-none d-sm-inline">Khó</span>
                  </button>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>+10 phút</small>
                </div>

                <div className="col-3">
                  <button
                    className="btn btn-duo btn-duo-green w-100 py-2"
                    onClick={() => handleRateCard('good')}
                  >
                    <span>🟢</span>
                    <span className="d-none d-sm-inline">Nhớ</span>
                  </button>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>+1 ngày</small>
                </div>

                <div className="col-3">
                  <button
                    className="btn btn-duo btn-duo-purple w-100 py-2"
                    onClick={() => handleRateCard('easy')}
                  >
                    <span>🔵</span>
                    <span className="d-none d-sm-inline">Dễ</span>
                  </button>
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>+4 ngày</small>
                </div>
              </div>
            </div>

            {/* Prev / Next controls */}
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-duo btn-duo-outline px-3"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentVocabIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
                }}
              >
                ← Thẻ trước
              </button>

              <button
                className="btn btn-duo btn-duo-outline px-3"
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
                }}
              >
                Thẻ kế tiếp →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MINIGAME GHÉP TỪ (MATCH GAME - QUIZLET STYLE) */}
        {activeTab === 'match' && (
          <div className="mx-auto" style={{ maxWidth: '640px' }}>
            <div className="text-center mb-4">
              <h2 className="fw-bolder mb-1">🎮 Minigame Ghép Từ Siêu Tốc</h2>
              <p className="text-muted small">
                Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng càng nhanh càng tốt!
              </p>
            </div>

            {matchGameWon ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <span style={{ fontSize: '4rem' }} className="mb-2">🏆</span>
                <h2 className="fw-bolder text-success mb-2">XUẤT SẮC! BẠN ĐÃ CHIẾN THẮNG!</h2>
                <p className="text-muted mb-4">
                  Bạn đã ghép chính xác toàn bộ cặp từ vựng! Thưởng <strong>+75 XP</strong> và <strong>+5 💎</strong>.
                </p>
                <button className="btn btn-duo btn-duo-green px-5 py-3 fs-5 mx-auto" onClick={initMatchGame}>
                  🔁 Chơi ván mới
                </button>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-muted">
                    Tiến độ: {matchedIds.size / 2} / {matchCards.length / 2} cặp
                  </span>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={initMatchGame}>
                    Trộn lại 🎲
                  </button>
                </div>

                {/* Match Cards Grid */}
                <div className="row g-3">
                  {matchCards.map((card) => {
                    const isSelected = selectedCards.some((c) => c.id === card.id);
                    const isMatched = matchedIds.has(card.id);
                    const isWrong = wrongPair.includes(card.id);

                    return (
                      <div key={card.id} className="col-6">
                        <div
                          className={`match-card ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''} ${isWrong ? 'wrong shake-animation' : ''}`}
                          onClick={() => handleMatchCardClick(card)}
                        >
                          <div className="py-2">
                            {card.text}
                          </div>
                          {card.type === 'en' && (
                            <small className="text-muted d-block fw-normal" style={{ fontSize: '0.75rem' }}>
                              🔊 Chạm để nghe
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LUYỆN NGHE & GÕ TỪ (SPELL & LISTEN) */}
        {activeTab === 'spell' && currentVocab && (
          <div className="mx-auto" style={{ maxWidth: '520px' }}>
            <div className="text-center mb-4">
              <h2 className="fw-bolder mb-1">✍️ Luyện Nghe & Gõ Từ Vựng</h2>
              <p className="text-muted small">
                Nghe phát âm bản ngữ và gõ lại chính xác từ vựng để rèn luyện phản xạ!
              </p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-3">
              {/* Audio Speaker */}
              <button
                className={`audio-play-btn mx-auto mb-3 ${isSpeaking ? 'speaker-active' : ''}`}
                style={{ width: '72px', height: '72px' }}
                onClick={() => handlePronounce(currentVocab.word)}
                title="Bấm để nghe phát âm"
              >
                <span style={{ fontSize: '2rem' }}>🔊</span>
              </button>

              <div className="mb-3">
                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold">
                  Gợi ý nghĩa: {currentVocab.meanings[0]?.meaning}
                </span>
              </div>

              <p className="text-muted small mb-3">
                Phiên âm gợi ý: <code className="fw-bold">{currentVocab.ipa}</code> ({currentVocab.part_of_speech})
              </p>

              {/* Text Input */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-lg text-center fw-bold rounded-pill"
                  placeholder="Gõ từ tiếng Anh bạn nghe được..."
                  value={spellInput}
                  onChange={(e) => {
                    setSpellInput(e.target.value);
                    setSpellFeedback('none');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSpellCheck();
                  }}
                  autoFocus
                />
              </div>

              {/* Feedback Alert */}
              {spellFeedback === 'correct' && (
                <div className="alert alert-success rounded-4 fw-bold mb-3">
                  🎉 CHÍNH XÁC! Bạn gõ đúng từ: <strong>{currentVocab.word}</strong> (+20 XP)
                </div>
              )}

              {spellFeedback === 'wrong' && (
                <div className="alert alert-danger rounded-4 fw-bold mb-3">
                  ❌ Chưa chính xác rồi! Đáp án đúng là: <strong>{currentVocab.word}</strong>
                </div>
              )}

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center">
                {spellFeedback === 'none' ? (
                  <button
                    className="btn btn-duo btn-duo-green px-4 py-2"
                    onClick={handleSpellCheck}
                    disabled={!spellInput.trim()}
                  >
                    Kiểm tra đáp án 🚀
                  </button>
                ) : (
                  <button
                    className="btn btn-duo btn-duo-purple px-4 py-2"
                    onClick={handleNextSpellWord}
                  >
                    Từ tiếp theo →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRẮC NGHIỆM QUIZ */}
        {activeTab === 'quiz' && (
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="text-center mb-4">
              <h2 className="fw-bolder mb-1">{quiz.title}</h2>
              <p className="text-muted small">{quiz.description}</p>
            </div>

            {/* Quiz Result Screen */}
            {quizResult && (
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
                <span style={{ fontSize: '3.5rem' }}>{quizResult.passed ? '🎉' : '💪'}</span>
                <h3 className={`fw-bolder mb-2 ${quizResult.passed ? 'text-success' : 'text-warning'}`}>
                  {quizResult.passed ? 'Chúc mừng! Bạn đã vượt qua bài test!' : 'Cố lên! Hãy ôn lại từ vựng nhé!'}
                </h3>
                <p className="fs-5 fw-bold text-dark mb-3">
                  Điểm số: {quizResult.earned_points} / {quizResult.total_points} ({quizResult.score_percent}%)
                </p>

                <div className="text-start mt-3">
                  <h6 className="fw-bold text-muted mb-3">Chi tiết từng câu hỏi:</h6>
                  {quizResult.results.map((res, i) => (
                    <div key={i} className={`p-3 rounded-4 mb-2 border ${res.is_correct ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'}`}>
                      <div className="fw-bold mb-1">
                        Câu {i + 1}: {res.prompt}
                      </div>
                      <div className="small">
                        Đáp án bạn chọn: <strong>{res.user_choice}</strong> | Đáp án đúng: <strong>{res.correct_choice}</strong>
                      </div>
                      <div className="small text-muted mt-1 fst-italic">
                        💡 Giải thích: {res.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-duo btn-duo-outline mt-3 mx-auto px-4"
                  onClick={() => {
                    setQuizResult(null);
                    setSelectedAnswers({});
                  }}
                >
                  Làm lại bài kiểm tra 🔄
                </button>
              </div>
            )}

            {/* Questions List */}
            {!quizResult && quiz.questions && (
              <div className="space-y-4">
                {quiz.questions.map((q, idx) => (
                  <div key={q.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-primary border rounded-pill px-3 py-1 fw-bold">
                        Câu hỏi {idx + 1}
                      </span>
                      <small className="text-muted fw-bold">1 điểm</small>
                    </div>

                    <h5 className="fw-bold text-dark mb-3">{q.prompt}</h5>

                    <div className="d-flex flex-column gap-2">
                      {q.options.map((opt) => {
                        const isSelected = selectedAnswers[q.id] === opt.option_key;
                        return (
                          <button
                            key={opt.id}
                            className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.option_key });
                              playSoundEffect('flip');
                            }}
                          >
                            <span className="badge bg-light text-dark border px-2 py-1 rounded-circle">
                              {opt.option_key}
                            </span>
                            <span>{opt.content}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-duo btn-duo-green w-100 py-3 fs-5"
                  onClick={async () => {
                    try {
                      const res = await submitQuiz(quiz.id, selectedAnswers);
                      setQuizResult(res);
                      if (res.passed) {
                        playSoundEffect('win');
                        setXp((prev) => prev + 50);
                      } else {
                        playSoundEffect('wrong');
                      }
                    } catch {
                      // Offline fallback grading
                      let earned = 0;
                      const results = (quiz.questions || []).map((q) => {
                        const userChoice = selectedAnswers[q.id] || '';
                        const isCorrect = (q.id === 101 && userChoice === 'B') ||
                                          (q.id === 102 && userChoice === 'B') ||
                                          (q.id === 103 && userChoice === 'A');
                        if (isCorrect) earned += 1;
                        return {
                          question_id: q.id,
                          prompt: q.prompt,
                          user_choice: userChoice || 'Chưa chọn',
                          correct_choice: q.id === 101 ? 'B' : q.id === 102 ? 'B' : 'A',
                          is_correct: isCorrect,
                          explanation: q.explanation,
                          points: isCorrect ? 1 : 0
                        };
                      });

                      const total = quiz.questions?.length || 3;
                      const percent = Math.round((earned / total) * 100);
                      const passed = percent >= quiz.pass_percent;
                      setQuizResult({
                        quiz_id: quiz.id,
                        title: quiz.title,
                        earned_points: earned,
                        total_points: total,
                        score_percent: percent,
                        pass_percent: quiz.pass_percent,
                        passed,
                        results
                      });

                      if (passed) {
                        playSoundEffect('win');
                        setXp((prev) => prev + 50);
                      }
                    }
                  }}
                  disabled={Object.keys(selectedAnswers).length === 0}
                >
                  Nộp bài & Chấm điểm tức thì 🎯
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SỔ TỪ VỰNG (DICTIONARY DECK) */}
        {activeTab === 'deck' && (
          <div>
            {/* Search Box & Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h3 className="fw-bolder mb-1">📚 Kho Từ Vựng Cá Nhân</h3>
                <p className="text-muted small mb-0">Tra cứu, nghe phát âm và đánh dấu từ vựng cần ôn tập</p>
              </div>

              <div style={{ maxWidth: '320px', width: '100%' }}>
                <input
                  type="text"
                  className="form-control rounded-pill px-3 shadow-sm"
                  placeholder="🔍 Tìm kiếm từ hoặc nghĩa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Word Grid */}
            <div className="row g-3">
              {filteredVocabulary.map((item) => (
                <div key={item.id} className="col-12 col-md-6">
                  <div className="vocab-deck-card h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className={`badge px-2 py-1 rounded-pill ${getPosBadgeColor(item.part_of_speech)}`}>
                          {item.part_of_speech}
                        </span>

                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-light rounded-circle text-primary p-1"
                            onClick={() => handlePronounce(item.word)}
                            title="Nghe phát âm"
                          >
                            🔊
                          </button>
                          <button
                            className="btn btn-sm btn-light rounded-circle text-warning p-1"
                            onClick={() => toggleBookmark(item.id)}
                            title="Lưu từ yêu thích"
                          >
                            {bookmarkedIds.has(item.id) ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>

                      <h4 className="fw-bolder text-dark mb-1">{item.word}</h4>
                      <div className="text-muted small mb-2">{item.ipa}</div>

                      <p className="fw-semibold text-success mb-2">
                        👉 {item.meanings[0]?.meaning}
                      </p>

                      {item.examples && item.examples[0] && (
                        <div className="p-2 rounded bg-light small text-muted">
                          "{item.examples[0].sentence}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CLOUD BACKEND & DATABASE STATUS */}
        {activeTab === 'health' && (
          <div className="mx-auto" style={{ maxWidth: '560px' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
              <span style={{ fontSize: '3rem' }} className="mb-2">☁️</span>
              <h4 className="fw-bolder mb-3">Trạng thái Hạ Tầng & Dữ Liệu</h4>

              {healthLoading ? (
                <div className="py-4 text-muted">Đang kiểm tra kết nối...</div>
              ) : health ? (
                <div className="text-start">
                  <div className="alert alert-success rounded-4 d-flex align-items-center gap-3 mb-3">
                    <span className="fs-3">✅</span>
                    <div>
                      <div className="fw-bold">Backend & Database hoạt động tốt!</div>
                      <small>Dịch vụ: {health.service} | Neon PostgreSQL: {health.database}</small>
                    </div>
                  </div>

                  <ul className="list-group rounded-4 mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Backend REST API</span>
                      <strong className="text-success">Laravel 12 (Docker on Render)</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Database</span>
                      <strong className="text-success">Neon Serverless PostgreSQL (SSL)</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Frontend Client</span>
                      <strong className="text-success">React 19 + Vite (Render Static Site)</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Chi phí vận hành</span>
                      <strong className="text-primary">0 VNĐ / Tháng (Miễn phí 100%)</strong>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="alert alert-warning rounded-4 text-start">
                  <div className="fw-bold mb-1">Lưu ý Cold Start Render Free Tier:</div>
                  <small>
                    {healthError || 'Máy chủ miễn phí của Render sẽ vào chế độ ngủ sau 15 phút không có request và mất ~30 giây để thức dậy.'}
                  </small>
                </div>
              )}

              <button
                className="btn btn-duo btn-duo-outline w-100 mt-2"
                onClick={fetchBackendHealth}
                disabled={healthLoading}
              >
                Kiểm tra lại kết nối 🔄
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
