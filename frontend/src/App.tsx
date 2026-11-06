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

// Rich expanded vocabulary dataset with Free Unsplash Photos & Curated Categories
const INITIAL_VOCABULARY: VocabularyItem[] = [
  // 1. Giao tiếp hàng ngày (Daily Life)
  {
    id: 1,
    word: 'Hello',
    ipa: '/həˈloʊ/',
    part_of_speech: 'interjection',
    topic: 'daily',
    image_url: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Xin chào (lời chào trang trọng và thân thiện)' }],
    examples: [{ sentence: 'Hello, nice to meet you today!', translation: 'Xin chào, rất vui được gặp bạn hôm nay!' }]
  },
  {
    id: 2,
    word: 'Welcome',
    ipa: '/ˈwel.kəm/',
    part_of_speech: 'exclamation',
    topic: 'daily',
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Chào mừng / Hoan nghênh nhiệt liệt' }],
    examples: [{ sentence: 'Welcome to our friendly learning community!', translation: 'Chào mừng bạn đến với cộng đồng học tập thân thiện!' }]
  },
  {
    id: 3,
    word: 'Gratitude',
    ipa: '/ˈɡræt̬.ə.tuːd/',
    part_of_speech: 'noun',
    topic: 'daily',
    image_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Lòng biết ơn, sự cảm kích sâu sắc' }],
    examples: [{ sentence: 'Expressing gratitude brings happiness into your life.', translation: 'Bày tỏ lòng biết ơn mang lại hạnh phúc cho cuộc sống của bạn.' }]
  },
  {
    id: 4,
    word: 'Curiosity',
    ipa: '/ˌkjʊr.iˈɑː.sə.t̬i/',
    part_of_speech: 'noun',
    topic: 'daily',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Lòng hiếu kỳ, niềm khao khát học hỏi điều mới' }],
    examples: [{ sentence: 'Curiosity fuels creativity and rapid personal growth.', translation: 'Sự tò mò nuôi dưỡng sáng tạo và sự phát triển cá nhân nhanh chóng.' }]
  },

  // 2. Du lịch & Sân bay (Travel & Hospitality)
  {
    id: 5,
    word: 'Passport',
    ipa: '/ˈpæs.pɔːrt/',
    part_of_speech: 'noun',
    topic: 'travel',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Hộ chiếu (giấy thông hành quốc tế)' }],
    examples: [{ sentence: 'Please have your passport and ticket ready for boarding.', translation: 'Vui lòng chuẩn bị sẵn hộ chiếu và vé để lên máy bay.' }]
  },
  {
    id: 6,
    word: 'Journey',
    ipa: '/ˈdʒɝː.ni/',
    part_of_speech: 'noun',
    topic: 'travel',
    image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Hành trình, chuyến đi khám phá' }],
    examples: [{ sentence: 'A journey of a thousand miles begins with a single step.', translation: 'Hành trình vạn dặm bắt đầu từ một bước chân.' }]
  },
  {
    id: 7,
    word: 'Destination',
    ipa: '/ˌdes.təˈneɪ.ʃən/',
    part_of_speech: 'noun',
    topic: 'travel',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Điểm đến, đích đến của chuyến đi' }],
    examples: [{ sentence: 'Da Nang is a popular travel destination in Vietnam.', translation: 'Đà Nẵng là một điểm đến du lịch nổi tiếng ở Việt Nam.' }]
  },

  // 3. Công sở & Nghề nghiệp (Business & Career)
  {
    id: 8,
    word: 'Opportunity',
    ipa: '/ˌɑː.pɚˈtuː.nə.t̬i/',
    part_of_speech: 'noun',
    topic: 'business',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Cơ hội, thời cơ thuận lợi để phát triển' }],
    examples: [{ sentence: 'English opens doors to countless career opportunities.', translation: 'Tiếng Anh mở ra cánh cửa dẫn đến vô số cơ hội nghề nghiệp.' }]
  },
  {
    id: 9,
    word: 'Perseverance',
    ipa: '/ˌpɝː.səˈvɪr.əns/',
    part_of_speech: 'noun',
    topic: 'business',
    image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Sự kiên trì, bền bỉ vượt qua khó khăn' }],
    examples: [{ sentence: 'Perseverance and discipline guarantee long-term success.', translation: 'Sự kiên trì và kỷ luật đảm bảo thành công lâu dài.' }]
  },
  {
    id: 10,
    word: 'Accomplish',
    ipa: '/əˈkɑːm.plɪʃ/',
    part_of_speech: 'verb',
    topic: 'business',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Hoàn thành xuất sắc, đạt được mục tiêu' }],
    examples: [{ sentence: 'We can accomplish our goals if we work together effectively.', translation: 'Chúng ta có thể hoàn thành mục tiêu nếu hợp tác hiệu quả.' }]
  },

  // 4. Luyện thi TOEIC / IELTS (Academic)
  {
    id: 11,
    word: 'Resilient',
    ipa: '/rɪˈzɪl.jənt/',
    part_of_speech: 'adjective',
    topic: 'academic',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Kiên cường, có khả năng phục hồi nhanh' }],
    examples: [{ sentence: 'A resilient mindset helps you overcome setbacks easily.', translation: 'Tư duy kiên cường giúp bạn vượt qua thất bại một cách dễ dàng.' }]
  },
  {
    id: 12,
    word: 'Eloquent',
    ipa: '/ˈel.ə.kwənt/',
    part_of_speech: 'adjective',
    topic: 'academic',
    image_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Hùng biện, diễn đạt lưu loát và truyền cảm' }],
    examples: [{ sentence: 'She delivered an eloquent presentation at the university conference.', translation: 'Cô ấy đã trình bày một bài thuyết trình hùng biện tại hội thảo đại học.' }]
  },
  {
    id: 13,
    word: 'Serendipity',
    ipa: '/ˌser.ənˈdɪp.ə.t̬i/',
    part_of_speech: 'noun',
    topic: 'academic',
    image_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=500&auto=format&fit=crop&q=80',
    meanings: [{ meaning: 'Sự may mắn tình cờ, duyên may bất ngờ' }],
    examples: [{ sentence: 'Meeting my best friend here was a wonderful serendipity.', translation: 'Gặp được người bạn thân nhất ở đây là một duyên may tuyệt vời.' }]
  }
];

// Roadmap Milestones
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

// Writing Prompts
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

// AI Roleplay Scenarios
interface RoleplayScenario {
  id: string;
  title: string;
  icon: string;
  character: string;
  context: string;
  initialMessage: string;
  quickReplies: string[];
}

const AI_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'coffee',
    title: 'Gọi cà phê tại London',
    icon: '☕',
    character: 'Barista Oliver',
    context: 'Bạn đang ở một quán cà phê tại trung tâm London và muốn gọi đồ uống.',
    initialMessage: "Good morning! Welcome to London Roast Café. What can I get started for you today?",
    quickReplies: [
      "I would like an iced latte with oat milk, please.",
      "Could I see your pastry menu as well?",
      "Can I get a hot cappuccino to go, please?"
    ]
  },
  {
    id: 'airport',
    title: 'Thủ tục Check-in sân bay',
    icon: '✈️',
    character: 'Officer Emma',
    context: 'Bạn đang làm thủ tục tại quầy check-in sân bay quốc tế Heathrow.',
    initialMessage: "Hello! May I see your passport and flight booking confirmation, please?",
    quickReplies: [
      "Here is my passport and boarding pass.",
      "Can I request a window seat, please?",
      "Is this carry-on bag the right size for the cabin?"
    ]
  },
  {
    id: 'interview',
    title: 'Phỏng vấn xin việc tiếng Anh',
    icon: '💼',
    character: 'HR Manager David',
    context: 'Bạn đang tham gia buổi phỏng vấn vị trí mới tại một công ty đa quốc gia.',
    initialMessage: "Welcome to our interview! Could you please introduce yourself and share why you want to work with us?",
    quickReplies: [
      "Certainly! I have a strong passion for continuous learning and teamwork.",
      "I believe my background and problem-solving skills align well with your team.",
      "I am very excited about your company's mission and future vision."
    ]
  }
];

interface ChatMessage {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  coachTip?: string;
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

// Web Speech API Native Text-to-Speech
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
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'roadmap' | 'flashcards' | 'speech' | 'ai_chat' | 'spell' | 'writing' | 'match' | 'quiz' | 'deck' | 'health'>('roadmap');

  // Gamification state
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

  // Vocabulary dataset & topic filter
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(INITIAL_VOCABULARY);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set([1, 4]));
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 3D Flashcard State
  const [currentVocabIndex, setCurrentVocabIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [learnedCount, setLearnedCount] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // ELSA Speak: Speech Recognition & Pronunciation Assessment State
  const [isListeningSpeech, setIsListeningSpeech] = useState<boolean>(false);
  const [speechResultText, setSpeechResultText] = useState<string>('');
  const [pronunciationScore, setPronunciationScore] = useState<{ score: number; feedback: string; endingSoundAlert?: string } | null>(null);

  // AI Roleplay Chat State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('coffee');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: AI_SCENARIOS[0].initialMessage,
      coachTip: 'Gợi ý: Bạn có thể bắt đầu bằng lời chào và gọi một món đồ uống yêu thích.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

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

  // Listening / Dictation Practice State
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // PWA Install State
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);

  // Update XP helper
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

  // Mount logic: PWA event, Daily decay, Auth check
  useEffect(() => {
    fetchBackendHealth();

    // Daily Decay check
    const lastActiveStr = localStorage.getItem('last_active_date');
    const todayStr = new Date().toISOString().slice(0, 10);

    if (lastActiveStr) {
      const lastActiveTime = new Date(lastActiveStr).getTime();
      const todayTime = new Date(todayStr).getTime();
      const diffDays = Math.floor((todayTime - lastActiveTime) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        const missedDays = diffDays - 1;
        const penalty = missedDays * 20;
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
    setPronunciationScore(null);
    setSpeechResultText('');

    setTimeout(() => {
      setCurrentVocabIndex((prev) => (prev + 1) % filteredVocabList.length);
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

  // ELSA Speak: Pronunciation Assessment with Speech Recognition
  const handleStartSpeechPractice = (targetWord: string) => {
    const SpeechRecognitionClass = (window as unknown as { webkitSpeechRecognition?: typeof EventTarget; SpeechRecognition?: typeof EventTarget }).webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: typeof EventTarget }).SpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert('Trình duyệt hiện tại chưa hỗ trợ Web Speech API. Bạn nên mở trang trên Google Chrome hoặc Microsoft Edge để luyện nói nhé!');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionClass as any)();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningSpeech(true);
      setPronunciationScore(null);
      setSpeechResultText('Đang lắng nghe giọng bạn nói...');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setSpeechResultText(`Bạn vừa đọc: "${spoken}"`);

        // Calculate score
        const cleanTarget = targetWord.trim().toLowerCase();
        const cleanSpoken = spoken.trim().toLowerCase();

        const endingChars = ['s', 't', 'd', 'k', 'p'];
        const lastTarget = cleanTarget[cleanTarget.length - 1];
        const lastSpoken = cleanSpoken[cleanSpoken.length - 1];
        let endingAlert: string | undefined;

        if (endingChars.includes(lastTarget) && lastSpoken !== lastTarget) {
          endingAlert = `Lưu ý âm đuôi: Hãy nhấn rõ âm đuôi /${lastTarget}/ hơn nhé!`;
        }

        if (cleanSpoken.includes(cleanTarget) || cleanTarget === cleanSpoken) {
          setPronunciationScore({
            score: 95,
            feedback: 'Tuyệt vời! Bạn phát âm rất chuẩn xác người bản ngữ! ⭐⭐⭐',
            endingSoundAlert: endingAlert
          });
          playSoundEffect('win');
          addXp(25);
        } else {
          // Similarity estimate
          let matches = 0;
          for (let i = 0; i < Math.min(cleanTarget.length, cleanSpoken.length); i++) {
            if (cleanTarget[i] === cleanSpoken[i]) matches++;
          }
          const score = Math.max(45, Math.round((matches / cleanTarget.length) * 100));

          if (score >= 70) {
            setPronunciationScore({
              score,
              feedback: 'Khá tốt! Hãy nghe lại phát âm mẫu và thử lại để hoàn thiện hơn.',
              endingSoundAlert: endingAlert
            });
            playSoundEffect('correct');
            addXp(10);
          } else {
            setPronunciationScore({
              score,
              feedback: 'Chưa chính xác! Bấm loa nghe lại rồi nhấn Micro đọc lại nhé.',
              endingSoundAlert: endingAlert
            });
            playSoundEffect('wrong');
          }
        }
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
        setSpeechResultText('Không bắt được giọng nói. Vui lòng bấm Micro và nói to rõ hơn nhé.');
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognition.start();
    } catch {
      setIsListeningSpeech(false);
    }
  };

  // AI Roleplay Chat: Send message & simulated tutor coaching
  const activeScenario = AI_SCENARIOS.find((s) => s.id === selectedScenarioId) || AI_SCENARIOS[0];

  const handleSendAiChatMessage = (textToSend?: string) => {
    const message = (textToSend || chatInput).trim();
    if (!message) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: message
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    playSoundEffect('flip');
    addXp(15);

    // AI Response Simulation with Audio & Coaching
    setTimeout(() => {
      let replyText = "That sounds wonderful! Is there anything else I can assist you with?";
      let tip = "✅ Câu trả lời rất tự nhiên, từ vựng chuẩn ngữ cảnh!";

      if (selectedScenarioId === 'coffee') {
        replyText = "Perfect choice! That will be £3.80. Would you like anything to eat with your coffee today?";
        tip = "💡 Mẹo bản ngữ: Người Anh thường nói 'Can I have...' hoặc 'Could I get...' khi gọi món lịch sự.";
      } else if (selectedScenarioId === 'airport') {
        replyText = "Thank you. Your documents look great. I have assigned you seat 14A by the window. Have a great flight!";
        tip = "💡 Tuyệt vời: Bạn đã sử dụng chính xác các thuật ngữ 'boarding pass' và 'window seat'.";
      } else if (selectedScenarioId === 'interview') {
        replyText = "Thank you for sharing. How do you handle stressful situations and tight deadlines?";
        tip = "💡 Gợi ý: Hãy dùng cấu trúc STAR (Situation, Task, Action, Result) khi trả lời câu hỏi phỏng vấn.";
      }

      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        coachTip: tip
      };

      setChatMessages([...updated, aiMsg]);
      speakWord(replyText, 0.9);
      playSoundEffect('correct');
    }, 900);
  };

  const handleSelectScenario = (scenario: RoleplayScenario) => {
    setSelectedScenarioId(scenario.id);
    setChatMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: scenario.initialMessage,
        coachTip: `Bối cảnh: ${scenario.context}`
      }
    ]);
  };

  // Match Game Handler
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

  // Simulate Missed Day Penalty
  const handleSimulateMissedDay = () => {
    const penalty = 20;
    deductXp(penalty);
    setStreak(0);
    localStorage.setItem('user_streak', '0');
    setDecayWarning(`⚠️ [Mô Phỏng Không Online]: Bạn đã bỏ lỡ 1 ngày học bài! Bị phạt trừ -${penalty} XP và chuỗi Streak đã bị gãy về 0.`);
    playSoundEffect('wrong');
  };

  // Filtered Vocab by topic
  const filteredVocabList = useMemo(() => {
    return vocabulary.filter((v) => {
      const matchTopic = selectedTopic === 'all' || v.topic === selectedTopic;
      const matchSearch =
        v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.meanings.some((m) => m.meaning.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTopic && matchSearch;
    });
  }, [vocabulary, selectedTopic, searchTerm]);

  const currentVocab = filteredVocabList[currentVocabIndex] || vocabulary[0];

  // Listening / Dictation Practice
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
    setCurrentVocabIndex((prev) => (prev + 1) % filteredVocabList.length);
  };

  // Writing & Journaling Logic with AI Grammar Feedback
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

    const aiGrammarAdvice = journalWordCount >= 40
      ? "Ngữ pháp xuất sắc! Độ dài bài viết đạt chuẩn B1. Đề xuất dùng thêm liên từ 'Moreover' và 'Consequently' để bài viết học thuật hơn."
      : "Ngữ pháp rất tốt, cấu trúc câu mạch lạc. Bạn đã ứng dụng từ vựng đúng ngữ cảnh!";

    const feedback = `Xuất sắc! Bạn đã viết được ${journalWordCount} từ và ứng dụng thành công ${matchedKeywords.length}/${activePrompt.targetKeywords.length} từ vựng mục tiêu. ${aiGrammarAdvice} Nhận ngay +${earnedXp} XP và +${earnedGems} 💎!`;
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

  // Helper for part of speech colors
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
          setAuthSuccess(null);
        }, 800);
      } else {
        const res = await registerUser({ name: authForm.name, email: authForm.email, password: authForm.password });
        setCurrentUser(res.user);
        setAuthSuccess('Đăng ký tài khoản thành công! Tặng bạn +50 XP!');
        playSoundEffect('win');
        addXp(50);
        setTimeout(() => {
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
                CEFR Lộ Trình • ELSA Nói • AI Tutor
              </small>
            </div>
          </div>

          {/* Gamification Stats Bar (Only when logged in) OR Clean Switcher */}
          {currentUser ? (
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

              {/* PWA Install Button */}
              <button
                className="btn btn-sm btn-outline-success rounded-pill px-2 py-1 text-nowrap d-none d-sm-inline-flex align-items-center gap-1"
                onClick={() => setShowPwaBanner(true)}
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
                title="Cài đặt App lên màn hình chính điện thoại iOS / Android"
              >
                <span>📲</span>
                <span>Cài App</span>
              </button>

              {/* Test Simulation Button: Simulate missed day & decay */}
              <button
                className="btn btn-sm btn-outline-warning rounded-pill px-2 py-1 text-nowrap d-none d-lg-inline-block"
                onClick={handleSimulateMissedDay}
                title="Bấm để thử nghiệm cơ chế trừ 20 XP khi quên online học bài"
                style={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                ⏳ Thử trừ 20 XP
              </button>

              {/* User Profile / Logout Button */}
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
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small d-none d-sm-inline">
                {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </span>
              <button
                className="btn btn-sm btn-outline-success rounded-pill px-3 py-1 fw-bold"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
              >
                {authMode === 'login' ? 'Đăng ký ngay ✨' : 'Đăng nhập 🔑'}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* PWA Installation Instructions Modal */}
      {showPwaBanner && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', zIndex: 9999 }}
          onClick={() => setShowPwaBanner(false)}
        >
          <div
            className="card border-0 rounded-4 shadow-lg p-4 bg-white"
            style={{ maxWidth: '440px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <span style={{ fontSize: '3rem' }}>📲</span>
              <h4 className="fw-bolder mt-2 mb-1">Cài đặt VocabMaster lên Điện Thoại</h4>
              <p className="text-muted small">Dùng như một ứng dụng gốc (App Store / CH Play) với tốc độ tức thì và học ngoại tuyến!</p>
            </div>

            <div className="bg-light p-3 rounded-4 mb-3 small text-start">
              <div className="fw-bold mb-2 text-dark">📱 Đối với iPhone / iPad (Safari):</div>
              <ol className="mb-0 ps-3">
                <li>Bấm vào biểu tượng <strong>Chia sẻ (Share) 📤</strong> ở thanh công cụ dưới cùng Safari.</li>
                <li>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen) ➕</strong>.</li>
                <li>Bấm <strong>"Thêm" (Add)</strong> ở góc trên bên phải.</li>
              </ol>

              <hr />

              <div className="fw-bold mb-2 text-dark">🤖 Đối với Android (Chrome):</div>
              <ol className="mb-0 ps-3">
                <li>Bấm vào biểu tượng <strong>3 chấm dọc ⋮</strong> ở góc trên bên phải Chrome.</li>
                <li>Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.</li>
              </ol>
            </div>

            <button className="btn btn-duo btn-duo-green w-100 py-2" onClick={() => setShowPwaBanner(false)}>
              Đã hiểu, đóng hướng dẫn 👍
            </button>
          </div>
        </div>
      )}

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

      {/* 2. MODE SELECTOR TABS (Chỉ hiển thị khi đã đăng nhập) */}
      {currentUser && (
        <div className="bg-white border-bottom py-2">
          <div className="app-container d-flex gap-2 overflow-auto py-1">
            <button
              className={`app-nav-pill ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <span>🗺️</span> Lộ Trình
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              <span>🗂️</span> Thẻ 3D Có Ảnh
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'speech' ? 'active' : ''}`}
              onClick={() => setActiveTab('speech')}
            >
              <span>🎙️</span> Luyện Nói (ELSA)
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'ai_chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai_chat')}
            >
              <span>🤖</span> Trợ Lý AI Chat
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
              <span>🎮</span> Ghép Từ
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              <span>📝</span> Trắc nghiệm
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'deck' ? 'active' : ''}`}
              onClick={() => setActiveTab('deck')}
            >
              <span>📚</span> Sổ Từ ({vocabulary.length})
            </button>

            <button
              className={`app-nav-pill ${activeTab === 'health' ? 'active' : ''}`}
              onClick={() => setActiveTab('health')}
            >
              <span>⚡</span> Trạng thái Cloud
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN APP CONTENT AREA */}
      <main className="app-container py-4 flex-grow-1">

        {/* TRANG ĐĂNG NHẬP / ĐĂNG KÝ: TINH GỌN, HIỆN ĐẠI & TẬP TRUNG */}
        {!currentUser ? (
          <div className="auth-page-wrapper">
            <div className="auth-card">
              {/* Mascot & Header */}
              <div className="text-center mb-4">
                <div className="mb-2" style={{ fontSize: '3.6rem', lineHeight: 1 }}>🦉</div>
                <h3 className="fw-bolder text-dark mb-1">
                  {authMode === 'login' ? 'Chào mừng bạn trở lại!' : 'Bắt đầu cùng VocabMaster'}
                </h3>
                <p className="text-muted small mb-0">
                  {authMode === 'login'
                    ? 'Đăng nhập để tiếp tục lộ trình học và bảo vệ chuỗi streak'
                    : 'Tạo tài khoản học viên miễn phí và nhận ngay +50 XP'}
                </p>
              </div>

              {/* Segmented Switcher Pill */}
              <div className="d-flex rounded-pill bg-light p-1 mb-4 border">
                <button
                  type="button"
                  className={`auth-tab-pill ${authMode === 'login' ? 'active' : ''}`}
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
                  className={`auth-tab-pill ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                >
                  Đăng ký mới
                </button>
              </div>

              {/* Alerts */}
              {authError && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <span>⚠️</span>
                  <div>{authError}</div>
                </div>
              )}

              {authSuccess && (
                <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <span>🎉</span>
                  <div>{authSuccess}</div>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <div className="auth-input-group">
                    <span className="auth-input-icon">👤</span>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="Họ và tên của bạn"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    />
                  </div>
                )}

                <div className="auth-input-group">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="Email học viên"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  />
                </div>

                <div className="auth-input-group">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-control"
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-duo btn-duo-green w-100 py-3 mt-2"
                  disabled={authLoading}
                  style={{ fontSize: '1rem', fontWeight: 800 }}
                >
                  {authLoading
                    ? 'Đang kết nối Cloud...'
                    : authMode === 'login'
                    ? 'Đăng nhập ngay 🚀'
                    : 'Tạo tài khoản & Mở khóa (+50 XP) ✨'}
                </button>
              </form>

              {/* Footer Trust Info */}
              <div className="text-center mt-4">
                <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                  🔒 Dữ liệu học tập được đồng bộ đám mây và mã hóa an toàn.
                </small>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* NỘI DUNG HỌC TẬP: CHỈ DÀNH CHO HỌC VIÊN ĐÃ ĐĂNG NHẬP        */
          /* ============================================================ */
          <>
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

            {/* TAB 1: 3D FLASHCARDS SRS VỚI HÌNH ẢNH TRỰC QUAN */}
            {activeTab === 'flashcards' && currentVocab && (
              <div className="mx-auto" style={{ maxWidth: '520px' }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-muted" style={{ fontSize: '0.9rem' }}>
                    Thẻ {currentVocabIndex + 1} / {filteredVocabList.length}
                  </span>
                  <span className="badge bg-success-subtle text-success fw-bold px-3 py-1 rounded-pill">
                    ✨ Đã nhớ: {learnedCount} từ
                  </span>
                </div>

                <div className="duo-progress mb-3">
                  <div
                    className="duo-progress-bar"
                    style={{ width: `${((currentVocabIndex + 1) / filteredVocabList.length) * 100}%` }}
                  />
                </div>

                {/* Topic Filter Pills */}
                <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${selectedTopic === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setSelectedTopic('all'); setCurrentVocabIndex(0); }}
                  >
                    Tất cả chủ đề
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${selectedTopic === 'daily' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setSelectedTopic('daily'); setCurrentVocabIndex(0); }}
                  >
                    ☕ Đời sống
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${selectedTopic === 'travel' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setSelectedTopic('travel'); setCurrentVocabIndex(0); }}
                  >
                    ✈️ Du lịch
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${selectedTopic === 'business' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setSelectedTopic('business'); setCurrentVocabIndex(0); }}
                  >
                    💼 Công sở
                  </button>
                  <button
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-bold ${selectedTopic === 'academic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setSelectedTopic('academic'); setCurrentVocabIndex(0); }}
                  >
                    🎯 Học thuật
                  </button>
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
                      <div className="d-flex justify-content-between align-items-center w-100 mb-2">
                        <span className={`badge px-3 py-1 rounded-pill text-uppercase ${getPosBadgeColor(currentVocab.part_of_speech)}`}>
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

                      {/* Visual Photo Header */}
                      {currentVocab.image_url && (
                        <img
                          src={currentVocab.image_url}
                          alt={currentVocab.word}
                          className="card-thumb-img shadow-sm"
                          loading="lazy"
                        />
                      )}

                      <div className="text-center my-auto">
                        <h2 className="display-5 fw-bolder mb-1 text-dark" style={{ letterSpacing: '-1px' }}>
                          {currentVocab.word}
                        </h2>

                        <p className="fs-5 text-muted fw-semibold mb-2">
                          {currentVocab.ipa}
                        </p>

                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className={`audio-play-btn ${isSpeaking ? 'speaker-active' : ''}`}
                            onClick={(e) => handlePronounce(currentVocab.word, 0.88, e)}
                            title="Nghe phát âm chuẩn bản ngữ"
                          >
                            <span style={{ fontSize: '1.4rem' }}>🔊</span>
                          </button>

                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('speech');
                            }}
                            title="Chuyển sang chế độ luyện nói chấm điểm ELSA"
                          >
                            🎙️ Luyện phát âm
                          </button>
                        </div>
                      </div>

                      <div className="text-center text-muted" style={{ fontSize: '0.82rem' }}>
                        <span>🔄 Chạm vào thẻ để lật xem nghĩa & câu ví dụ</span>
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

                {/* SRS Rating Control Bar */}
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
                      setCurrentVocabIndex((prev) => (prev - 1 + filteredVocabList.length) % filteredVocabList.length);
                    }}
                  >
                    ← Thẻ trước
                  </button>

                  <button
                    className="btn btn-duo btn-duo-outline px-3"
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentVocabIndex((prev) => (prev + 1) % filteredVocabList.length);
                    }}
                  >
                    Thẻ kế tiếp →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LUYỆN NÓI & NHẬN DIỆN PHÁT ÂM (ELSA SPEAK STYLE) */}
            {activeTab === 'speech' && currentVocab && (
              <div className="mx-auto" style={{ maxWidth: '580px' }}>
                <div className="text-center mb-4">
                  <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill fw-bold mb-2">
                    🎙️ AI PRONUNCIATION COACH
                  </span>
                  <h2 className="fw-bolder mb-1">Luyện Nói & Chấm Điểm Phát Âm</h2>
                  <p className="text-muted small">
                    Bấm Micro, đọc từ tiếng Anh to rõ để hệ thống phân tích và chấm điểm chuẩn âm bản ngữ!
                  </p>
                </div>

                <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-3">
                  {/* Target Word */}
                  <div className="mb-3">
                    <span className="badge bg-light text-muted border px-3 py-1 rounded-pill small mb-2">
                      Từ vựng cần luyện đọc:
                    </span>
                    <h1 className="display-4 fw-bolder text-primary mb-1">{currentVocab.word}</h1>
                    <p className="fs-5 text-muted fw-semibold">{currentVocab.ipa}</p>
                    <p className="text-success fw-bold">👉 Nghĩa: {currentVocab.meanings[0]?.meaning}</p>
                  </div>

                  {/* Audio Sample Button */}
                  <button
                    className="btn btn-sm btn-outline-primary rounded-pill px-4 py-2 mx-auto mb-4 fw-bold"
                    onClick={() => handlePronounce(currentVocab.word, 0.85)}
                  >
                    🔊 Nghe phát âm mẫu
                  </button>

                  {/* Big Microphone Recording Button */}
                  <div className="mb-4">
                    <button
                      className={`mic-record-btn mx-auto ${isListeningSpeech ? 'recording' : ''}`}
                      onClick={() => handleStartSpeechPractice(currentVocab.word)}
                      title="Bấm để bắt đầu nói"
                    >
                      <span style={{ fontSize: '2.2rem' }}>🎙️</span>
                    </button>
                    <small className="text-muted d-block mt-2 fw-bold">
                      {isListeningSpeech ? '🔴 Đang lắng nghe... Hãy nói ngay!' : 'Chạm vào Micro để đọc'}
                    </small>
                  </div>

                  {/* Live Speech Recognition Transcript */}
                  {speechResultText && (
                    <div className="alert alert-light border rounded-pill py-2 px-3 small mb-3">
                      {speechResultText}
                    </div>
                  )}

                  {/* Pronunciation Score Box */}
                  {pronunciationScore && (
                    <div className={`pronunciation-score-box mb-3 ${pronunciationScore.score >= 85 ? 'score-excellent' : pronunciationScore.score >= 70 ? 'score-good' : 'score-retry'}`}>
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                        <span className="fs-3">{pronunciationScore.score >= 85 ? '🌟' : '🎯'}</span>
                        <h3 className="fw-bolder mb-0">Độ chuẩn xác: {pronunciationScore.score}%</h3>
                      </div>
                      <p className="mb-1 fw-bold">{pronunciationScore.feedback}</p>
                      {pronunciationScore.endingSoundAlert && (
                        <div className="small text-danger fw-bold mt-1">
                          ⚠️ {pronunciationScore.endingSoundAlert}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-duo btn-duo-outline px-4"
                      onClick={() => {
                        setPronunciationScore(null);
                        setSpeechResultText('');
                        setCurrentVocabIndex((prev) => (prev + 1) % filteredVocabList.length);
                      }}
                    >
                      Luyện từ tiếp theo →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRỢ LÝ AI ĐÀM THOẠI NHẬP VAI (AI ROLEPLAY CHAT) */}
            {activeTab === 'ai_chat' && (
              <div className="mx-auto" style={{ maxWidth: '680px' }}>
                <div className="text-center mb-4">
                  <span className="badge bg-purple-subtle text-primary px-3 py-1 rounded-pill fw-bold mb-2">
                    🤖 AI CONVERSATION PARTNER
                  </span>
                  <h2 className="fw-bolder mb-1">Trợ Lý AI Đàm Thoại Nhập Vai</h2>
                  <p className="text-muted small">
                    Trò chuyện tự do với gia sư AI theo tình huống thực tế. Có kèm phát âm bản ngữ và nhận xét ngữ pháp tức thì!
                  </p>
                </div>

                {/* Scenario Selector */}
                <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
                  {AI_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      className={`btn btn-sm rounded-pill px-3 py-2 text-nowrap fw-bold ${selectedScenarioId === sc.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleSelectScenario(sc)}
                    >
                      <span>{sc.icon}</span> {sc.title}
                    </button>
                  ))}
                </div>

                {/* Scenario Context Banner */}
                <div className="alert alert-info py-2 px-3 rounded-4 small mb-3">
                  <strong>Bối cảnh:</strong> {activeScenario.context}
                </div>

                {/* Chat Window */}
                <div className="ai-chat-window mb-3 shadow-sm">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={msg.sender === 'ai' ? 'ai-bubble-ai' : 'ai-bubble-user'}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="small">{msg.sender === 'ai' ? `🤖 ${activeScenario.character}` : '👤 Bạn'}</strong>
                        {msg.sender === 'ai' && (
                          <button
                            className="btn btn-sm btn-light p-1 rounded-circle"
                            onClick={() => handlePronounce(msg.text, 0.9)}
                            title="Nghe AI đọc câu này"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                      <div className="fs-6">{msg.text}</div>
                      {msg.coachTip && (
                        <div className="mt-2 pt-2 border-top small text-muted fst-italic">
                          {msg.coachTip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Suggested Quick Replies */}
                <div className="mb-3">
                  <small className="fw-bold text-muted d-block mb-2">Gợi ý câu trả lời nhanh:</small>
                  <div className="d-flex flex-wrap gap-2">
                    {activeScenario.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        className="ai-suggest-chip"
                        onClick={() => handleSendAiChatMessage(reply)}
                      >
                        💬 "{reply}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Input Box */}
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control rounded-start-pill px-3"
                    placeholder="Gõ tin nhắn tiếng Anh để trò chuyện với AI..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendAiChatMessage();
                    }}
                  />
                  <button
                    className="btn btn-duo btn-duo-green rounded-end-pill px-4"
                    onClick={() => handleSendAiChatMessage()}
                    disabled={!chatInput.trim()}
                  >
                    Gửi tin 🚀
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: LUYỆN NGHE CHÍNH TẢ (DICTATION - ẨN CHỮ) */}
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
                  <button
                    className={`audio-play-btn mx-auto mb-3 ${isSpeaking ? 'speaker-active' : ''}`}
                    style={{ width: '84px', height: '84px' }}
                    onClick={() => handlePronounce(currentVocab.word, listenSpeed)}
                    title="Bấm để nghe phát âm"
                  >
                    <span style={{ fontSize: '2.4rem' }}>🔊</span>
                  </button>

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

            {/* TAB 5: VIẾT NHẬT KÝ & AI CHẤM ĐIỂM (JOURNAL) */}
            {activeTab === 'writing' && (
              <div className="mx-auto" style={{ maxWidth: '720px' }}>
                <div className="text-center mb-4">
                  <span className="badge bg-purple-subtle text-primary px-3 py-1 rounded-pill fw-bold mb-2">
                    ✍️ RÈN LUYỆN KỸ NĂNG VIẾT
                  </span>
                  <h2 className="fw-bolder mb-1">Nhật Ký & Viết Văn Theo Lộ Trình</h2>
                  <p className="text-muted small">
                    Chọn chủ đề phù hợp với cấp độ của bạn, vận dụng từ vựng đã học và nhận phản hồi chấm điểm AI ngay lập tức!
                  </p>
                </div>

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

                  <div className="mb-3">
                    <textarea
                      className="form-control rounded-4 p-3 fs-6"
                      rows={6}
                      placeholder="Bắt đầu viết nhật ký bằng tiếng Anh của bạn tại đây..."
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="small fw-bold">
                      Số từ đã viết: <span className={journalWordCount >= activePrompt.minWords ? 'text-success' : 'text-danger'}>{journalWordCount}</span> / {activePrompt.minWords} từ
                    </div>

                    <div className="small text-muted">
                      Từ vựng mục tiêu: {matchedKeywords.length} / {activePrompt.targetKeywords.length} từ
                    </div>
                  </div>

                  {journalFeedback && (
                    <div className="alert alert-success rounded-4 p-3 mb-3">
                      <div className="fw-bold mb-1">🤖 Phân tích & Đánh giá của AI Tutor:</div>
                      <div>{journalFeedback}</div>
                    </div>
                  )}

                  <button
                    className="btn btn-duo btn-duo-green w-100 py-3 fs-5"
                    onClick={handleSubmitJournal}
                    disabled={journalWordCount === 0}
                  >
                    Nộp bài nhật ký & Nhờ AI chấm điểm (+50 XP) 🚀
                  </button>
                </div>

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

            {/* TAB 6: MINIGAME GHÉP TỪ */}
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

            {/* TAB 7: TRẮC NGHIỆM QUIZ */}
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

            {/* TAB 8: SỔ TỪ VỰNG CÓ HÌNH ẢNH */}
            {activeTab === 'deck' && (
              <div>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                  <div>
                    <h3 className="fw-bolder mb-1">📚 Kho Từ Vựng Trực Quan</h3>
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
                  {filteredVocabList.map((item) => (
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

                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.word}
                              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.5rem' }}
                              loading="lazy"
                            />
                          )}

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

            {/* TAB 9: CLOUD BACKEND & DATABASE STATUS */}
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
          </>
        )}
      </main>
    </div>
  );
}
