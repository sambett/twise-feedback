// API client for Universal Feedback Platform
// All communication with backend goes through these functions

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  
  return data;
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// ====================================
// EVENT MANAGEMENT API
// ====================================

export const eventApi = {
  // Get all events
  getAll: async () => {
    return apiRequest('/api/events');
  },

  // Get specific event
  get: async (eventId: string) => {
    return apiRequest(`/api/events/${eventId}`);
  },

  // Create new event
  create: async (eventData: {
    title: string;
    subtitle?: string;
    activities: string[];
    theme?: any;
    activityLabel?: string;
    feedbackLabel?: string;
    feedbackPlaceholder?: string;
  }) => {
    return apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update event
  update: async (eventId: string, updates: Partial<{
    title: string;
    subtitle: string;
    activities: string[];
    theme: any;
    activityLabel: string;
    feedbackLabel: string;
    feedbackPlaceholder: string;
  }>) => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete event
  delete: async (eventId: string) => {
    return apiRequest(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};

// ====================================
// FEEDBACK API
// ====================================

export const feedbackApi = {
  // Submit new feedback
  submit: async (feedbackData: {
    starRating: number;
    activity: string;
    comment?: string;
    eventId: string;
    userName?: string;
    userEmail?: string;
  }) => {
    return apiRequest('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Get feedback with optional filters
  get: async (filters?: {
    eventId?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    activity?: string;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/feedback${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  // Get feedback statistics  
  getStats: async (eventId?: string) => {
    const params = eventId ? `?eventId=${eventId}` : '';
    return apiRequest(`/api/feedback/stats${params}`);
  },

  // Clear feedback (testing only)
  clear: async (eventId?: string) => {
    const params = eventId ? `?eventId=${eventId}` : '';
    return apiRequest(`/api/feedback/clear${params}`, {
      method: 'DELETE',
    });
  },
};

// ====================================
// ANALYTICS API
// ====================================

export const analyticsApi = {
  // Get detailed event analytics
  getEventAnalytics: async (eventId: string) => {
    return apiRequest(`/api/analytics/${eventId}`);
  },

  // Get platform-wide statistics
  getPlatformStats: async () => {
    return apiRequest('/api/analytics/platform/stats');
  },

  // Set up real-time analytics via Server-Sent Events
  subscribeToRealtimeUpdates: (eventId: string, onUpdate: (data: any) => void, onError?: (error: Error) => void) => {
    const eventSource = new EventSource(`${API_URL}/api/analytics/${eventId}/realtime`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        onError?.(error as Error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError?.(new Error('Real-time connection lost'));
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  },
};

// ====================================
// SENTIMENT ANALYSIS API
// ====================================

export const sentimentApi = {
  // Test sentiment analysis on single text
  analyze: async (text: string) => {
    return apiRequest('/api/sentiment/test', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Batch sentiment analysis
  analyzeBatch: async (texts: string[]) => {
    return apiRequest('/api/sentiment/batch', {
      method: 'POST',
      body: JSON.stringify({ texts }),
    });
  },
};

// ====================================
// SYSTEM API
// ====================================

export const systemApi = {
  // Get health status
  getHealth: async () => {
    return apiRequest('/health');
  },

  // Get API information
  getApiInfo: async () => {
    return apiRequest('/api');
  },

  // Get system metrics
  getMetrics: async () => {
    return apiRequest('/api/metrics');
  },
};

// ====================================
// COMBINED API OBJECT
// ====================================

export const api = {
  events: eventApi,
  feedback: feedbackApi,
  analytics: analyticsApi,
  sentiment: sentimentApi,
  system: systemApi,
};

export default api;

// ====================================
// TYPES
// ====================================

export interface Event {
  id: string;
  firebaseId?: string;
  title: string;
  subtitle?: string;
  activities: string[];
  theme?: any;
  activityLabel?: string;
  feedbackLabel?: string;
  feedbackPlaceholder?: string;
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface Feedback {
  feedbackId?: string;
  starRating: number;
  activity: string;
  comment?: string;
  eventId: string;
  userName?: string;
  userEmail?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  sentimentConfidence?: number;
  language?: string;
  timestamp?: string;
  processingTime?: number;
}

export interface Analytics {
  event: Event;
  analytics: {
    totalFeedback: number;
    averageRating: number;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    activityBreakdown: {
      [key: string]: {
        count: number;
        averageRating: number;
        sentiments: {
          positive: number;
          neutral: number;
          negative: number;
        };
      };
    };
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    languageDistribution: {
      [key: string]: number;
    };
    timeAnalysis: {
      last24Hours: number;
      last7Days: number;
      last30Days: number;
    };
    trends: {
      hourly: number[];
      daily: number[];
      recentSentiment: Array<{
        sentiment: string;
        rating: number;
        timestamp: string;
      }>;
    };
    lastUpdated: string;
  };
}
