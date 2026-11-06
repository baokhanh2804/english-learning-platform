import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  checkHealth,
  getVocabulary,
  getQuiz,
  submitQuiz,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  type HealthCheckResponse,
  type VocabularyItem,
  type Quiz,
  type QuizSubmissionResult,
  type AuthUser,
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

// Roadmap Milestones (Duolingo Style Progression)
interface RoadmapMilestone {
  id: number;
  level: string;
  title: string;
  description: string;
  requiredXp: number;
  icon: string;
}

const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  { id: 1, level: 'A1', title: 'Khởi động & Chào hỏi', description: 'Học từ vựng nhập môn, chào hỏi lịch sự và tự giới thiệu bản thân.', requiredXp: 0, icon: '🌱' },
  { id: 2, level: 'A1', title: 'Đời sống thường nhật', description: 'Giao tiếp tình huống hàng ngày: thời gian, gia đình, sở thích.', requiredXp: 120, icon: '🏠' },
  { id: 3, level: 'A2', title: 'Mua sắm & Du lịch', description: 'Hỏi đường, gọi món, đi máy bay và đàm thoại đời sống.', requiredXp: 260, icon: '✈️' },
  { id: 4, level: 'B1', title: 'Công sở & Cơ hội', description: 'Viết email chuyên nghiệp, thảo luận công việc và phỏng vấn.', requiredXp: 450, icon: '💼' },
  { id: 5, level: 'B2', title: 'Phản biện & Kiên cường', description: 'Thuyết trình tự tin, tranh luận ý kiến và nghị luận xã hội.', requiredXp: 700, icon: '🎯' },
  { id: 6, level: 'C1-C2', title: 'Bậc thầy Tinh thông', description: 'Hiểu sâu tài liệu học thuật và phong thái giao tiếp bản ngữ.', requiredXp: 1000, icon: '👑' },
];

// Writing Prompts according to Roadmap Levels
interface WritingPrompt {
  id: number;
  level: string;
  title: string;
  instructions: string;
  minWords: number;
  targetKeywords: string[];
}

const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 1,
    level: 'Lộ trình A1',
    title: 'Giới thiệu bản thân & Lời chào (Self-Introduction)',
    instructions: 'Hãy viết đoạn văn ngắn (tối thiểu 15 từ) giới thiệu tên, quê quán và lời chào bạn bè bằng tiếng Anh.',
    minWords: 15,
    targetKeywords: ['hello', 'welcome', 'name', 'from', 'learn']
  },
  {
    id: 2,
    level: 'Lộ trình A2',
    title: 'Một ngày ý nghĩa & Lòng biết ơn (My Daily Journal)',
    instructions: 'Viết nhật ký về một ngày của bạn và bày tỏ lòng biết ơn về những điều tốt đẹp xung quanh.',
    minWords: 25,
    targetKeywords: ['gratitude', 'happy', 'morning', 'friend', 'curiosity']
  },
  {
    id: 3,
    level: 'Lộ trình B1',
    title: 'Mục tiêu nghề nghiệp & Nỗ lực (Goals & Perseverance)',
    instructions: 'Chia sẻ về mục tiêu tương lai, những cơ hội bạn muốn nắm bắt và sự kiên trì cần có.',
    minWords: 35,
    targetKeywords: ['opportunity', 'perseverance', 'accomplish', 'goal', 'career']
  },
  {
    id: 4,
    level: 'Lộ trình B2',
    title: 'Sức mạnh của sự Kiên cường (The Power of Resilience)',
    instructions: 'Viết về một thử thách trong cuộc sống và cách con người giữ tinh thần kiên cường, lưu loát để vượt qua.',
    minWords: 45,
    targetKeywords: ['resilient', 'eloquent', 'challenge', 'success', 'serendipity']
  }
];

interface SavedJournalEntry {
  id: number;
  title: string;
  level: string;
  body: string;
  wordCount: number;
  matchedKeywords: string[];
  feedback: string;
  createdAt: string;
}

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

      osc1.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(659.25, now + 0.1);

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
      const notes = [523.25, 659.25, 783.99, 1046.50];
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
    // Handled silently
  }
};

// Web Speech API Native Text-to-Speech with customizable playback rate
const speakWord = (text: string, rate: number = 0.88) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
};

export default function App() {
  // Navigation tabs: 'roadmap' | 'flashcards' | 'spell' | 'writing' | 'match' | 'quiz' | 'deck' | 'health'
  const [activeTab, setActiveTab] = useState<'roadmap' | 'flashcards' | 'spell' | 'writing' | 'match' | 'quiz' | 'deck' | 'health'>('roadmap');

  // Gamification state with localStorage persistence
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('user_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('user_xp');
    return saved ? parseInt(saved, 10) : 210;
  });

  const [gems, setGems] = useState<number>(() => {
    const saved = localStorage.getItem('user_gems');
    return saved ? parseInt(saved, 10) : 110;
  });

  const [hearts] = useState<number>(5);
  const [decayWarning, setDecayWarning] = useState<string | null>(null);

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

  // Listening / Dictation Practice State (PROMPT FIX: No Vietnamese / IPA upfront!)
  const [spellInput, setSpellInput] = useState<string>('');
  const [spellFeedback, setSpellFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [listenSpeed, setListenSpeed] = useState<number>(0.9);
  const [showListenHint, setShowListenHint] = useState<boolean>(false);

  // Writing / Journal State
  const [selectedPromptId, setSelectedPromptId] = useState<number>(1);
  const [journalText, setJournalText] = useState<string>('');
  const [journalFeedback, setJournalFeedback] = useState<string | null>(null);
  const [savedEntries, setSavedEntries] = useState<SavedJournalEntry[]>(() => {
    const saved = localStorage.getItem('user_journal_entries');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        title: 'Giới thiệu bản thân & Lời chào (Self-Introduction)',
        level: 'Lộ trình A1',
        body: 'Hello everyone! Welcome to my profile. My name is Bao Khanh and I am from Vietnam. I am very happy to learn English here!',
        wordCount: 25,
        matchedKeywords: ['hello', 'welcome', 'name', 'from', 'learn'],
        feedback: 'Xuất sắc! Bạn đã sử dụng đầy đủ 5/5 từ vựng mục tiêu với văn phong tự nhiên.',
        createdAt: 'Hôm nay lúc 21:30'
      }
    ];
  });

  // Quiz State
  const [quiz, setQuiz] = useState<Quiz>(DEFAULT_QUIZ);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmissionResult | null>(null);

  // Backend Health State
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Update XP helper with storage sync
  const addXp = (amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      localStorage.setItem('user_xp', next.toString());
      return next;
    });
  };

  const deductXp = (amount: number) => {
    setXp((prev) => {
      const next = Math.max(0, prev - amount);
      localStorage.setItem('user_xp', next.toString());
      return next;
    });
  };

  // Check Daily Decay / XP penalty for missed days
  useEffect(() => {
    fetchBackendHealth();

    // Daily Decay check: Compare today with last active date
    const lastActiveStr = localStorage.getItem('last_active_date');
    const todayStr = new Date().toISOString().slice(0, 10);

    if (lastActiveStr) {
      const lastActiveTime = new Date(lastActiveStr).getTime();
      const todayTime = new Date(todayStr).getTime();
      const diffDays = Math.floor((todayTime - lastActiveTime) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        const missedDays = diffDays - 1;
        const penalty = missedDays * 20; // 20 XP per missed day
        deductXp(penalty);
        setStreak(0);
        localStorage.setItem('user_streak', '0');
        setDecayWarning(`⚠️ CẢNH BÁO BỎ LỠ NGÀY HỌC: Bạn đã không online học bài trong ${missedDays} ngày qua! Bị trừ -${penalty} XP và chuỗi Streak đã bị gãy về 0.`);
      }
    }
    localStorage.setItem('last_active_date', todayStr);

    // Stored auth verification
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {}
    }
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

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

  // Initialize Match Game
  const initMatchGame = React.useCallback(() => {
    const sample = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 4);
    const cards: MatchCardItem[] = [];

    sample.forEach((item) => {
      cards.push({ id: `en-${item.id}`, originalId: item.id, text: item.word, type: 'en' });
      cards.push({ id: `vi-${item.id}`, originalId: item.id, text: item.meanings[0]?.meaning || item.word, type: 'vi' });
    });

    setMatchCards(cards.sort(() => 0.5 - Math.random()));
    setSelectedCards([]);
    setMatchedIds(new Set());
    setWrongPair([]);
    setMatchGameWon(false);
  }, [vocabulary]);

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

  const handlePronounce = (text: string, rate: number = 0.88, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsSpeaking(true);
    speakWord(text, rate);
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

    addXp(earnedXp);
    setIsFlipped(false);

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
        playSoundEffect('correct');
        const nextMatched = new Set(matchedIds);
        nextMatched.add(first.id);
        nextMatched.add(second.id);
        setMatchedIds(nextMatched);
        setSelectedCards([]);
        addXp(25);
        setGems((prev) => {
          const next = prev + 5;
          localStorage.setItem('user_gems', next.toString());
          return next;
        });

        if (nextMatched.size === matchCards.length) {
          setTimeout(() => {
            playSoundEffect('win');
            setMatchGameWon(true);
            addXp(50);
          }, 300);
        }
      } else {
        playSoundEffect('wrong');
        setWrongPair([first.id, second.id]);
        setTimeout(() => {
          setSelectedCards([]);
          setWrongPair([]);
        }, 600);
      }
    }
  };

  // Simulate Missed Day Penalty (Requested by User)
  const handleSimulateMissedDay = () => {
    const penalty = 20;
    deductXp(penalty);
    setStreak(0);
    localStorage.setItem('user_streak', '0');
    setDecayWarning(`⚠️ [Mô Phỏng Không Online]: Bạn đã bỏ lỡ 1 ngày học bài! Bị phạt trừ -${penalty} XP và chuỗi Streak đã bị gãy về 0.`);
    playSoundEffect('wrong');
  };

  // Listening / Dictation Practice (PROMPT FIX: ONLY Audio, NO English/Vietnamese upfront)
  const currentVocab = vocabulary[currentVocabIndex] || vocabulary[0];

  const handleSpellCheck = () => {
    if (!currentVocab) return;

    if (spellInput.trim().toLowerCase() === currentVocab.word.toLowerCase()) {
      setSpellFeedback('correct');
      playSoundEffect('correct');
      addXp(20);
      setGems((prev) => {
        const next = prev + 2;
        localStorage.setItem('user_gems', next.toString());
        return next;
      });
    } else {
      setSpellFeedback('wrong');
      playSoundEffect('wrong');
    }
  };

  const handleNextSpellWord = () => {
    setSpellInput('');
    setSpellFeedback('none');
    setShowListenHint(false);
    setCurrentVocabIndex((prev) => (prev + 1) % vocabulary.length);
  };

  // Writing & Journaling Logic
  const activePrompt = WRITING_PROMPTS.find((p) => p.id === selectedPromptId) || WRITING_PROMPTS[0];

  const journalWordCount = useMemo(() => {
    const trimmed = journalText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [journalText]);

  const matchedKeywords = useMemo(() => {
    const textLower = journalText.toLowerCase();
    return activePrompt.targetKeywords.filter((kw) => textLower.includes(kw.toLowerCase()));
  }, [journalText, activePrompt]);

  const handleSubmitJournal = () => {
    if (journalWordCount < activePrompt.minWords) {
      alert(`Bài viết cần tối thiểu ${activePrompt.minWords} từ để nộp (Hiện tại: ${journalWordCount} từ). Hãy viết thêm nhé!`);
      return;
    }

    const earnedXp = 50 + matchedKeywords.length * 10;
    const earnedGems = 10;
    addXp(earnedXp);
    setGems((prev) => {
      const next = prev + earnedGems;
      localStorage.setItem('user_gems', next.toString());
      return next;
    });

    const feedback = `Xuất sắc! Bạn đã viết được ${journalWordCount} từ và ứng dụng thành công ${matchedKeywords.length}/${activePrompt.targetKeywords.length} từ vựng mục tiêu. Nhận ngay +${earnedXp} XP và +${earnedGems} 💎!`;
    setJournalFeedback(feedback);
    playSoundEffect('win');

    const newEntry: SavedJournalEntry = {
      id: Date.now(),
      title: activePrompt.title,
      level: activePrompt.level,
      body: journalText,
      wordCount: journalWordCount,
      matchedKeywords,
      feedback,
      createdAt: 'Vừa xong'
    };

    const updatedEntries = [newEntry, ...savedEntries];
    setSavedEntries(updatedEntries);
    localStorage.setItem('user_journal_entries', JSON.stringify(updatedEntries));
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

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      if (authMode === 'login') {
        const res = await loginUser({ email: authForm.email, password: authForm.password });
        setCurrentUser(res.user);
        setAuthSuccess('Đăng nhập thành công! Chúc bạn học tốt!');
        playSoundEffect('win');
        addXp(30);
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthSuccess(null);
        }, 800);
      } else {
        const res = await registerUser({ name: authForm.name, email: authForm.email, password: authForm.password });
        setCurrentUser(res.user);
        setAuthSuccess('Đăng ký tài khoản thành công! Tặng bạn +50 XP!');
        playSoundEffect('win');
        addXp(50);
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthSuccess(null);
        }, 800);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setAuthError(err.response.data.message);
      } else if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError('Có lỗi xảy ra, vui lòng thử lại.');
      }
      playSoundEffect('wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  return (
    <div className="app-wrapper">
      {/* 1. TOP APP BAR - Duolingo Gamified Header */}
      <header className="app-topbar shadow-sm">
        <div className="app-container d-flex align-items-center justify-content-between">
          {/* Logo & Mascot */}
          <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => setActiveTab('roadmap')}>
            <span style={{ fontSize: '2rem' }}>🦉</span>
            <div>
              <div className="fw-bolder fs-5 text-dark" style={{ letterSpacing: '-0.5px' }}>
                Vocab<span style={{ color: '#10b981' }}>Master</span>
              </div>
              <small className="text-muted d-none d-sm-inline" style={{ fontSize: '0.75rem' }}>
                Lộ trình học & Kỷ luật thông minh
              </small>
            </div>
          </div>

          {/* Gamification Stats Bar & User Auth */}
          <div className="d-flex align-items-center gap-2">
            <div className="stat-chip stat-chip-streak" title="Chuỗi ngày học liên tục">
              <span>🔥</span>
              <span>{streak} ngày</span>
            </div>

            <div className="stat-chip stat-chip-xp" title="Điểm kinh nghiệm XP">
              <span>⚡</span>
              <span>{xp} XP</span>
            </div>

            <div className="stat-chip stat-chip-gems d-none d-md-inline-flex" title="Kim cương tích lũy">
              <span>💎</span>
              <span>{gems}</span>
            </div>

            <div className="stat-chip stat-chip-hearts d-none d-md-inline-flex" title="Số tim còn lại">
              <span>❤️</span>
              <span>{hearts}</span>
            </div>

            {/* Test Simulation Button: Simulate missed day & decay */}
            <button
              className="btn btn-sm btn-outline-warning rounded-pill px-2 py-1 text-nowrap d-none d-lg-inline-block"
              onClick={handleSimulateMissedDay}
              title="Bấm để thử nghiệm cơ chế trừ 20 XP khi quên online học bài"
              style={{ fontSize: '0.75rem', fontWeight: 700 }}
            >
              ⏳ Thử trừ 20 XP
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <div className="d-flex align-items-center gap-2 ms-1">
                <div className="stat-chip bg-light text-dark border px-2 py-1" title={currentUser.email}>
                  <span>👤</span>
                  <span className="fw-bold text-truncate" style={{ maxWidth: '100px' }}>
                    {currentUser.name}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                  onClick={handleLogout}
                  title="Đăng xuất khỏi tài khoản"
                  style={{ fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                className="btn-duo btn-duo-green px-3 py-1 ms-1"
                style={{ fontSize: '0.85rem' }}
                onClick={() => {
                  setAuthError(null);
                  setAuthSuccess(null);
                  setShowAuthModal(true);
                }}
              >
                <span>🔑</span>
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Daily Decay / Missed Day Alert Banner */}
      {decayWarning && (
        <div className="app-container pt-3">
          <div className="decay-alert-banner">
            <div className="d-flex align-items-center gap-3">
              <span className="fs-3">⚠️</span>
              <div>
                <div className="fw-bold text-danger">Kỷ luật học tập & Trừ điểm kinh nghiệm:</div>
                <div className="small text-danger-emphasis">{decayWarning}</div>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
              onClick={() => setDecayWarning(null)}
            >
              Đã hiểu ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. MODE SELECTOR TABS (App-like pills) */}
      <div className="bg-white border-bottom py-2">
        <div className="app-container d-flex gap-2 overflow-auto py-1">
          <button
            className={`app-nav-pill ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            <span>🗺️</span> Lộ Trình (Roadmap)
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <span>🗂️</span> Thẻ Flashcards
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'spell' ? 'active' : ''}`}
            onClick={() => setActiveTab('spell')}
          >
            <span>🎧</span> Luyện Nghe (Ẩn chữ)
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'writing' ? 'active' : ''}`}
            onClick={() => setActiveTab('writing')}
          >
            <span>✍️</span> Viết Nhật Ký
          </button>

          <button
            className={`app-nav-pill ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            <span>🎮</span> Ghép Từ Nhanh
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

        {/* TAB 0: ROADMAP (CƠ CHẾ LỘ TRÌNH DUOLINGO STYLE) */}
        {activeTab === 'roadmap' && (
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="text-center mb-4">
              <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-bold mb-2">
                KHUNG CHUẨN CHÂU ÂU CEFR (A1 – C2)
              </span>
              <h2 className="fw-bolder mb-1">🗺️ Bản Đồ Lộ Trình Học Tập</h2>
              <p className="text-muted small">
                Tích lũy XP để mở khóa các mốc kiến thức cao hơn. Không học bài sẽ bị trừ XP và gãy chuỗi Streak!
              </p>
            </div>

            {/* Current XP Progress to Next Level */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark">
                  ⚡ Điểm hiện tại: <span className="text-primary">{xp} XP</span>
                </span>
                <span className="small text-muted fw-bold">
                  {xp >= 1000 ? 'Đã đạt cấp độ Tinh thông 👑' : `Cần ${Math.max(0, (ROADMAP_MILESTONES.find(m => m.requiredXp > xp)?.requiredXp || 1000) - xp)} XP nữa để mở mốc kế`}
                </span>
              </div>
              <div className="duo-progress">
                <div
                  className="duo-progress-bar"
                  style={{ width: `${Math.min(100, (xp / 1000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Roadmap Visual Tree */}
            <div className="roadmap-container">
              <div className="roadmap-path-line" />

              {ROADMAP_MILESTONES.map((milestone, idx) => {
                const isUnlocked = xp >= milestone.requiredXp;
                const isCurrent = isUnlocked && (idx === ROADMAP_MILESTONES.length - 1 || xp < ROADMAP_MILESTONES[idx + 1].requiredXp);
                const isCompleted = isUnlocked && !isCurrent;

                return (
                  <div key={milestone.id} className="roadmap-checkpoint">
                    <button
                      className={`roadmap-node-btn ${isCompleted ? 'completed' : isCurrent ? 'current' : 'locked'}`}
                      onClick={() => {
                        if (isUnlocked) {
                          setActiveTab('flashcards');
                          playSoundEffect('flip');
                        } else {
                          playSoundEffect('wrong');
                          alert(`Mốc này yêu cầu ${milestone.requiredXp} XP để mở khóa! Hiện tại bạn có ${xp} XP. Hãy hoàn thành các bài học để kiếm thêm điểm.`);
                        }
                      }}
                      title={isUnlocked ? 'Nhấn để vào học' : `Khóa - Cần ${milestone.requiredXp} XP`}
                    >
                      <span style={{ fontSize: '1.85rem' }}>{milestone.icon}</span>
                      {isCompleted && (
                        <span style={{ fontSize: '0.65rem' }}>⭐⭐⭐</span>
                      )}
                      {!isUnlocked && (
                        <span style={{ fontSize: '0.75rem' }}>🔒</span>
                      )}
                    </button>

                    <div className="roadmap-info-box">
                      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                        <span className="badge bg-light text-dark border px-2 py-0 small fw-bold">
                          {milestone.level}
                        </span>
                        <strong className="fs-6 text-dark">{milestone.title}</strong>
                      </div>
                      <p className="text-muted small mb-2" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                        {milestone.description}
                      </p>
                      {isCurrent && (
                        <button
                          className="btn btn-sm btn-duo btn-duo-green py-1 px-3 w-100"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setActiveTab('flashcards')}
                        >
                          Học bài ngay 🎯
                        </button>
                      )}
                      {!isUnlocked && (
                        <small className="text-danger fw-bold" style={{ fontSize: '0.7rem' }}>
                          Cần {milestone.requiredXp} XP để mở
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 1: 3D FLASHCARDS SRS */}
        {activeTab === 'flashcards' && currentVocab && (
          <div className="mx-auto" style={{ maxWidth: '520px' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-bold text-muted" style={{ fontSize: '0.9rem' }}>
                Thẻ {currentVocabIndex + 1} / {vocabulary.length}
              </span>
              <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                ✨ Đã nhớ: {learnedCount} từ
              </span>
            </div>

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

                  <div className="text-center my-auto">
                    <h1 className="display-4 fw-bolder mb-2 text-dark" style={{ letterSpacing: '-1px' }}>
                      {currentVocab.word}
                    </h1>

                    <p className="fs-4 text-muted fw-semibold mb-3">
                      {currentVocab.ipa}
                    </p>

                    <button
                      className={`audio-play-btn ${isSpeaking ? 'speaker-active' : ''}`}
                      onClick={(e) => handlePronounce(currentVocab.word, 0.88, e)}
                      title="Phát âm từ vựng (giọng Anh-Mỹ bản ngữ)"
                    >
                      <span style={{ fontSize: '1.5rem' }}>🔊</span>
                    </button>
                  </div>

                  <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    <span>🔄 Chạm vào thẻ để lật xem nghĩa & ví dụ</span>
                  </div>
                </div>

                {/* MẶT SAU (BACK) */}
                <div className="card-face card-face-back">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span className="badge bg-success text-white px-3 py-2 rounded-pill">
                      Ý NGHĨA & NGỮ CẢNH
                    </span>
                    <button
                      className="btn btn-sm btn-outline-success rounded-pill px-3 py-1"
                      onClick={(e) => handlePronounce(currentVocab.word, 0.88, e)}
                    >
                      🔊 Nghe lại
                    </button>
                  </div>

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
                            onClick={(e) => handlePronounce(currentVocab.examples[0].sentence, 0.85, e)}
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

        {/* TAB 2: LUYỆN NGHE CHÍNH TẢ (DICTATION - ẨN CHỮ & TIẾNG VIỆT ĐÚNG THEO GÓP Ý) */}
        {activeTab === 'spell' && currentVocab && (
          <div className="mx-auto" style={{ maxWidth: '520px' }}>
            <div className="text-center mb-4">
              <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill fw-bold mb-2">
                🎧 LUYỆN TAI BẢN NGỮ
              </span>
              <h2 className="fw-bolder mb-1">Luyện Nghe & Viết Chính Tả</h2>
              <p className="text-muted small">
                Chỉ lắng nghe âm thanh và gõ lại từ vựng. Nghĩa và phiên âm đã được ẩn hoàn toàn để rèn luyện phản xạ nghe thật!
              </p>
            </div>

            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-3">
              {/* Big Speaker Button */}
              <button
                className={`audio-play-btn mx-auto mb-3 ${isSpeaking ? 'speaker-active' : ''}`}
                style={{ width: '84px', height: '84px' }}
                onClick={() => handlePronounce(currentVocab.word, listenSpeed)}
                title="Bấm để nghe phát âm"
              >
                <span style={{ fontSize: '2.4rem' }}>🔊</span>
              </button>

              {/* Speed Controls: Normal vs Turtle Slow */}
              <div className="d-flex justify-content-center gap-2 mb-3">
                <button
                  type="button"
                  className={`audio-speed-btn ${listenSpeed === 0.9 ? 'active' : ''}`}
                  onClick={() => {
                    setListenSpeed(0.9);
                    handlePronounce(currentVocab.word, 0.9);
                  }}
                >
                  ⚡ Bình thường (1.0x)
                </button>
                <button
                  type="button"
                  className={`audio-speed-btn ${listenSpeed === 0.65 ? 'active' : ''}`}
                  onClick={() => {
                    setListenSpeed(0.65);
                    handlePronounce(currentVocab.word, 0.65);
                  }}
                >
                  🐢 Chậm (0.65x)
                </button>
              </div>

              {/* Optional Hint Button (cost 5 XP) */}
              {!showListenHint && spellFeedback === 'none' && (
                <div className="mb-3">
                  <button
                    className="btn btn-sm btn-link text-muted text-decoration-none"
                    onClick={() => {
                      setShowListenHint(true);
                      deductXp(5);
                    }}
                    style={{ fontSize: '0.8rem' }}
                  >
                    💡 Cần gợi ý chữ cái đầu? (-5 XP)
                  </button>
                </div>
              )}

              {showListenHint && spellFeedback === 'none' && (
                <div className="alert alert-secondary py-2 px-3 small rounded-pill mb-3">
                  Gợi ý: Bắt đầu bằng chữ <strong>"{currentVocab.word[0].toUpperCase()}"</strong> ({currentVocab.word.length} chữ cái)
                </div>
              )}

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

              {/* Feedback Alert: ONLY reveal meaning & IPA AFTER check */}
              {spellFeedback === 'correct' && (
                <div className="alert alert-success rounded-4 text-start p-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-4">🎉</span>
                    <strong className="fs-5 text-success">CHÍNH XÁC! (+20 XP)</strong>
                  </div>
                  <div>
                    Từ bạn vừa nghe: <strong className="fs-5">{currentVocab.word}</strong> <span className="text-muted">{currentVocab.ipa}</span>
                  </div>
                  <div className="text-success-emphasis fw-bold mt-1">
                    👉 Nghĩa: {currentVocab.meanings[0]?.meaning}
                  </div>
                </div>
              )}

              {spellFeedback === 'wrong' && (
                <div className="alert alert-danger rounded-4 text-start p-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-4">❌</span>
                    <strong className="fs-5 text-danger">Chưa chính xác rồi!</strong>
                  </div>
                  <div>
                    Đáp án đúng là: <strong className="fs-5">{currentVocab.word}</strong> <span className="text-muted">{currentVocab.ipa}</span>
                  </div>
                  <div className="text-danger-emphasis fw-bold mt-1">
                    👉 Nghĩa: {currentVocab.meanings[0]?.meaning}
                  </div>
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

        {/* TAB 3: VIẾT ĐOẠN VĂN HOẶC NHẬT KÝ THEO LỘ TRÌNH (JOURNAL & WRITING) */}
        {activeTab === 'writing' && (
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <div className="text-center mb-4">
              <span className="badge bg-purple-subtle text-primary px-3 py-1 rounded-pill fw-bold mb-2">
                ✍️ RÈN LUYỆN KỸ NĂNG VIẾT
              </span>
              <h2 className="fw-bolder mb-1">Nhật Ký & Viết Văn Theo Lộ Trình</h2>
              <p className="text-muted small">
                Chọn chủ đề phù hợp với cấp độ của bạn, vận dụng từ vựng đã học và nhận phản hồi chấm điểm ngay lập tức!
              </p>
            </div>

            {/* Prompt Selector Pills */}
            <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
              {WRITING_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  className={`btn btn-sm rounded-pill px-3 py-2 text-nowrap fw-bold ${selectedPromptId === p.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => {
                    setSelectedPromptId(p.id);
                    setJournalFeedback(null);
                  }}
                >
                  <span className="badge bg-light text-dark me-1">{p.level}</span>
                  {p.title.split('(')[0]}
                </button>
              ))}
            </div>

            {/* Writing Prompt Instruction Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-bold">
                  {activePrompt.level}
                </span>
                <span className="small text-muted fw-bold">
                  Yêu cầu: Tối thiểu {activePrompt.minWords} từ
                </span>
              </div>

              <h4 className="fw-bolder text-dark mb-2">{activePrompt.title}</h4>
              <p className="text-muted mb-3">{activePrompt.instructions}</p>

              {/* Target Keywords Tags */}
              <div className="mb-3">
                <span className="small fw-bold text-muted d-block mb-2">
                  Từ vựng mục tiêu cần áp dụng (Gõ vào bài để sáng xanh ✅):
                </span>
                <div className="d-flex flex-wrap gap-2">
                  {activePrompt.targetKeywords.map((kw) => {
                    const isUsed = matchedKeywords.includes(kw);
                    return (
                      <span key={kw} className={`keyword-chip ${isUsed ? 'matched' : ''}`}>
                        {isUsed ? '✅ ' : '○ '}
                        {kw}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Journal Editor Textarea */}
              <div className="mb-3">
                <textarea
                  className="form-control rounded-4 p-3 fs-6"
                  rows={6}
                  placeholder="Bắt đầu viết nhật ký bằng tiếng Anh của bạn tại đây..."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                />
              </div>

              {/* Word count & Progress */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="small fw-bold">
                  Số từ đã viết: <span className={journalWordCount >= activePrompt.minWords ? 'text-success' : 'text-danger'}>{journalWordCount}</span> / {activePrompt.minWords} từ
                </div>

                <div className="small text-muted">
                  Từ vựng mục tiêu: {matchedKeywords.length} / {activePrompt.targetKeywords.length} từ
                </div>
              </div>

              {/* Feedback Alert */}
              {journalFeedback && (
                <div className="alert alert-success rounded-4 p-3 mb-3">
                  <div className="fw-bold mb-1">🎉 Nhận xét bài viết:</div>
                  <div>{journalFeedback}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="btn btn-duo btn-duo-green w-100 py-3 fs-5"
                onClick={handleSubmitJournal}
                disabled={journalWordCount === 0}
              >
                Nộp bài nhật ký & Chấm điểm (+50 XP) 🚀
              </button>
            </div>

            {/* Saved Journal History */}
            <div className="mt-5">
              <h4 className="fw-bolder mb-3">📖 Lịch Sử Nhật Ký Của Bạn ({savedEntries.length})</h4>

              <div className="d-flex flex-column gap-3">
                {savedEntries.map((entry) => (
                  <div key={entry.id} className="journal-entry-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-primary border rounded-pill px-2 py-1 small fw-bold">
                        {entry.level}
                      </span>
                      <small className="text-muted">{entry.createdAt}</small>
                    </div>

                    <h5 className="fw-bold text-dark mb-2">{entry.title}</h5>

                    <p className="p-3 rounded-3 bg-light text-dark mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                      "{entry.body}"
                    </p>

                    <div className="d-flex justify-content-between align-items-center small text-muted">
                      <span>Độ dài: {entry.wordCount} từ</span>
                      <span className="text-success fw-bold">
                        Đã áp dụng: {entry.matchedKeywords.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MINIGAME GHÉP TỪ */}
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

        {/* TAB 5: TRẮC NGHIỆM QUIZ */}
        {activeTab === 'quiz' && (
          <div className="mx-auto" style={{ maxWidth: '680px' }}>
            <div className="text-center mb-4">
              <h2 className="fw-bolder mb-1">{quiz.title}</h2>
              <p className="text-muted small">{quiz.description}</p>
            </div>

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
                        addXp(50);
                      } else {
                        playSoundEffect('wrong');
                      }
                    } catch {
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
                        addXp(50);
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

        {/* TAB 6: SỔ TỪ VỰNG */}
        {activeTab === 'deck' && (
          <div>
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

        {/* TAB 7: CLOUD BACKEND & DATABASE STATUS */}
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

      {/* 4. AUTH MODAL (ĐĂNG NHẬP / ĐĂNG KÝ) */}
      {showAuthModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white"
            style={{ maxWidth: '420px', width: '100%', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setShowAuthModal(false)}
              aria-label="Close"
            />

            <div className="text-center mb-3">
              <span style={{ fontSize: '2.5rem' }}>🦉</span>
              <h4 className="fw-bolder mt-1 mb-1">
                {authMode === 'login' ? 'Đăng nhập VocabMaster' : 'Tạo tài khoản mới'}
              </h4>
              <p className="text-muted small mb-0">
                {authMode === 'login'
                  ? 'Đăng nhập để lưu tiến độ và giữ chuỗi ngày học!'
                  : 'Tạo tài khoản hoàn toàn miễn phí và nhận ngay +50 XP!'}
              </p>
            </div>

            <div className="d-flex rounded-pill bg-light p-1 mb-3 border">
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-pill fw-bold ${authMode === 'login' ? 'bg-white shadow-sm text-success' : 'text-muted'}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`btn btn-sm flex-fill rounded-pill fw-bold ${authMode === 'register' ? 'bg-white shadow-sm text-success' : 'text-muted'}`}
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
              >
                Đăng ký mới
              </button>
            </div>

            {authError && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
                {authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className="mb-3 text-start">
                  <label className="form-label small fw-bold text-muted">Họ và tên của bạn</label>
                  <input
                    type="text"
                    required
                    className="form-control rounded-3"
                    placeholder="VD: Nguyễn Bảo Khánh"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                </div>
              )}

              <div className="mb-3 text-start">
                <label className="form-label small fw-bold text-muted">Email</label>
                <input
                  type="email"
                  required
                  className="form-control rounded-3"
                  placeholder="name@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
              </div>

              <div className="mb-4 text-start">
                <label className="form-label small fw-bold text-muted">Mật khẩu</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control rounded-3"
                  placeholder="Tối thiểu 6 ký tự"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-duo btn-duo-green w-100 py-2 fs-6 mb-2"
                disabled={authLoading}
              >
                {authLoading ? (
                  <span>Đang xử lý...</span>
                ) : authMode === 'login' ? (
                  'Đăng nhập ngay 🚀'
                ) : (
                  'Tạo tài khoản (+50 XP) ✨'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
