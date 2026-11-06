import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://english-learning-backend-s2v4.onrender.com/api';
if (rawBaseUrl === 'https://english-learning-backend.onrender.com/api') {
  rawBaseUrl = 'https://english-learning-backend-s2v4.onrender.com/api';
}

const API_BASE_URL = rawBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface HealthCheckResponse {
  status: string;
  service: string;
  database: string;
  timestamp: string;
}

export interface CEFRLevel {
  id: number;
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  courses_count?: number;
}

export interface Course {
  id: number;
  level_id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  level_code?: string;
  level_name?: string;
  units?: Unit[];
}

export interface Unit {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  description: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: number;
  unit_id: number;
  title: string;
  slug: string;
  summary: string;
  lesson_type: string;
  objectives?: string[];
  estimated_minutes: number;
  contents?: LessonContent[];
  quiz?: Quiz;
}

export interface LessonContent {
  id: number;
  block_type: string;
  title: string;
  content_json: {
    body?: string;
    tips?: string;
    dialogue?: Array<{ speaker: string; en: string; vi: string }>;
  };
}

export interface VocabularyItem {
  id: number;
  word: string;
  ipa: string;
  part_of_speech: string;
  meanings: Array<{ meaning: string; usage_note?: string }>;
  examples: Array<{ sentence: string; translation?: string }>;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_seconds: number;
  pass_percent: number;
  questions?: Question[];
}

export interface Question {
  id: number;
  question_type: string;
  prompt: string;
  explanation: string;
  difficulty: number;
  points: number;
  options: Array<{ id: number; option_key: string; content: string }>;
}

export interface QuizSubmissionResult {
  quiz_id: number;
  title: string;
  earned_points: number;
  total_points: number;
  score_percent: number;
  pass_percent: number;
  passed: boolean;
  results: Array<{
    question_id: number;
    prompt: string;
    user_choice: string;
    correct_choice: string;
    is_correct: boolean;
    explanation: string;
    points: number;
  }>;
}

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

export const getLevels = async (): Promise<CEFRLevel[]> => {
  const res = await apiClient.get<{ data: CEFRLevel[] }>('/levels');
  return res.data.data;
};

export const getCourses = async (levelId?: number): Promise<Course[]> => {
  const params = levelId ? { level_id: levelId } : {};
  const res = await apiClient.get<{ data: Course[] }>('/courses', { params });
  return res.data.data;
};

export const getCourseDetails = async (id: number): Promise<Course> => {
  const res = await apiClient.get<{ data: Course }>(`/courses/${id}`);
  return res.data.data;
};

export const getLesson = async (id: number): Promise<Lesson> => {
  const res = await apiClient.get<{ data: Lesson }>(`/lessons/${id}`);
  return res.data.data;
};

export const getVocabulary = async (levelId?: number): Promise<VocabularyItem[]> => {
  const params = levelId ? { level_id: levelId } : {};
  const res = await apiClient.get<{ data: VocabularyItem[] }>('/vocabulary', { params });
  return res.data.data;
};

export const getQuiz = async (id: number): Promise<Quiz> => {
  const res = await apiClient.get<{ data: Quiz }>(`/quizzes/${id}`);
  return res.data.data;
};

export const submitQuiz = async (id: number, answers: Record<number, string>): Promise<QuizSubmissionResult> => {
  const res = await apiClient.post<QuizSubmissionResult>(`/quizzes/${id}/submit`, { answers });
  return res.data;
};

// ==========================================
// Authentication APIs
// ==========================================
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export const registerUser = async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/register', data);
  if (res.data.token) {
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/login', data);
  if (res.data.token) {
    localStorage.setItem('auth_token', res.data.token);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/logout');
  } catch {
    // Ignore error if token expired or unreachable
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const res = await apiClient.get<{ user: AuthUser }>('/me');
    if (res.data.user) {
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    return null;
  } catch {
    return null;
  }
};
