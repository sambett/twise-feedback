// TypeScript interfaces for Universal Feedback Platform

export interface EventTheme {
  background: string;
  titleGradient: string;
  buttonGradient: string;
  buttonHover: string;
  accent: string;
}

export interface EventConfig {
  id: string;
  title: string;
  subtitle?: string;
  activities: string[];
  theme?: EventTheme;
  activityLabel?: string;
  feedbackLabel?: string;
  feedbackPlaceholder?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FirebaseEvent extends EventConfig {
  firebaseId?: string;
  isCustom?: boolean;
}

export interface FeedbackInput {
  starRating: number;
  activity: string;
  comment?: string;
  eventId: string;
  userName?: string;
  userEmail?: string;
}

export interface FeedbackData extends FeedbackInput {
  feedbackId?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  sentimentConfidence?: number;
  language?: string;
  timestamp?: string;
  processingTime?: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ActivityBreakdown {
  [key: string]: {
    count: number;
    averageRating: number;
    sentiments: SentimentBreakdown;
  };
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TimeAnalysis {
  last24Hours: number;
  last7Days: number;
  last30Days: number;
}

export interface Trends {
  hourly: number[];
  daily: number[];
  recentSentiment: Array<{
    sentiment: string;
    rating: number;
    timestamp: string;
  }>;
}

export interface EventAnalytics {
  totalFeedback: number;
  averageRating: number;
  sentimentBreakdown: SentimentBreakdown;
  activityBreakdown: ActivityBreakdown;
  ratingDistribution: RatingDistribution;
  languageDistribution: { [key: string]: number };
  timeAnalysis: TimeAnalysis;
  trends: Trends;
  lastUpdated: string;
}

export interface AnalyticsResponse {
  event: FirebaseEvent;
  analytics: EventAnalytics;
}

export interface PlatformStats {
  totalEvents: number;
  totalFeedback: number;
  averageRating: number;
  sentimentBreakdown: SentimentBreakdown;
  activeEvents: number;
  lastUpdated: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  total?: number;
  error?: string;
  message?: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
  language?: string;
  processingTime?: number;
}

export interface RealtimeUpdate {
  type: 'connected' | 'update' | 'ping' | 'error';
  timestamp: string;
  eventId?: string;
  data?: {
    totalFeedback: number;
    averageRating: number;
    sentimentCounts: SentimentBreakdown;
    latestFeedback: FeedbackData[];
  };
  message?: string;
}

export interface SystemHealth {
  success: boolean;
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  version: string;
  environment: string;
  features: {
    sentimentAnalysis: boolean;
    localAI: boolean;
    requiresAPIKey: boolean;
    multilingual: boolean;
    firebase: {
      available: boolean;
      projectId: string;
      databaseUrl: string;
      hasCredentials: boolean;
    };
  };
}

export interface ApiInfo {
  success: boolean;
  name: string;
  version: string;
  description: string;
  features: string[];
  endpoints: {
    events: { [key: string]: string };
    feedback: { [key: string]: string };
    analytics: { [key: string]: string };
    sentiment: { [key: string]: string };
    monitoring: { [key: string]: string };
  };
  examples: {
    createEvent: {
      method: string;
      url: string;
      body: any;
    };
    submitFeedback: {
      method: string;
      url: string;
      body: any;
    };
  };
}

// Default theme constant
export const DEFAULT_THEME: EventTheme = {
  background: 'from-indigo-900 via-purple-900 to-blue-900',
  titleGradient: 'from-indigo-300 to-purple-300',
  buttonGradient: 'from-indigo-600 to-purple-600',
  buttonHover: 'from-indigo-700 to-purple-700',
  accent: 'indigo-400'
};

// Theme presets for easy selection
export const THEME_PRESETS = [
  {
    name: 'Research Purple',
    theme: {
      background: 'from-indigo-900 via-purple-900 to-blue-900',
      titleGradient: 'from-indigo-300 to-purple-300',
      buttonGradient: 'from-indigo-600 to-purple-600',
      buttonHover: 'from-indigo-700 to-purple-700',
      accent: 'indigo-400'
    }
  },
  {
    name: 'Wedding Rose',
    theme: {
      background: 'from-rose-800 via-pink-800 to-purple-800',
      titleGradient: 'from-rose-200 to-pink-200',
      buttonGradient: 'from-rose-600 to-pink-600',
      buttonHover: 'from-rose-700 to-pink-700',
      accent: 'rose-400'
    }
  },
  {
    name: 'Corporate Gray',
    theme: {
      background: 'from-slate-800 via-gray-800 to-zinc-800',
      titleGradient: 'from-slate-200 to-gray-200',
      buttonGradient: 'from-slate-600 to-gray-600',
      buttonHover: 'from-slate-700 to-gray-700',
      accent: 'slate-400'
    }
  },
  {
    name: 'Ocean Blue',
    theme: {
      background: 'from-blue-800 via-cyan-800 to-teal-800',
      titleGradient: 'from-blue-200 to-cyan-200',
      buttonGradient: 'from-blue-600 to-cyan-600',
      buttonHover: 'from-blue-700 to-cyan-700',
      accent: 'blue-400'
    }
  },
  {
    name: 'Forest Green',
    theme: {
      background: 'from-emerald-800 via-green-800 to-teal-800',
      titleGradient: 'from-emerald-200 to-green-200',
      buttonGradient: 'from-emerald-600 to-green-600',
      buttonHover: 'from-emerald-700 to-green-700',
      accent: 'emerald-400'
    }
  }
] as const;

export type ThemePreset = typeof THEME_PRESETS[number];
