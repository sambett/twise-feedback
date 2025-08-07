'use client';

import React, { useState, useEffect, use } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Star, TrendingUp, MessageSquare, ArrowLeft, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { getEventConfig, EventConfig } from '../../lib/eventConfigs';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase';
import Link from 'next/link';

interface FeedbackItem {
  id: string;
  activity: string;
  rating: number;
  feedback: string;
  sentiment: 'pos' | 'neg' | 'neu' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  timestamp: string;
  // 🆕 Enhanced fields from AI backend
  confidence?: number;
  language_detected?: string;
  ai_powered?: boolean;
  model?: string;
  provider?: string;
  entities?: string[] | Array<{name: string}>;
  key_phrases?: string[];
}

interface ActivityStats {
  name: string;
  participants: number;
  totalRating: number;
  positiveFeedback: number;
  avgRating?: number;
}

interface DashboardStats {
  totalParticipants: number;
  averageRating: number;
  sentimentScore: number;
  totalFeedback: number;
  // 🆕 Enhanced AI stats
  averageConfidence?: number;
  languageDistribution?: Record<string, number>;
  aiPoweredCount?: number;
  providerDistribution?: Record<string, number>;
}

interface EventAdminProps {
  params: Promise<{
    eventId: string;
  }>;
}

// AI Backend URL - REQUIRED for operation
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function EventAdminDashboard({ params }: EventAdminProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Load event config from static or Firebase
  useEffect(() => {
    if (!mounted) return;
    
    // First check static events
    const staticEvent = getEventConfig(resolvedParams.eventId);
    if (staticEvent && staticEvent.id !== 'twise-night') { // Not fallback
      setEventConfig(staticEvent);
      return;
    }
    
    // If not found in static events, check Firebase
    const eventsRef = ref(db, 'events');
    onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseData = snapshot.val() as Record<string, EventConfig>;
        const firebaseEvents = Object.entries(firebaseData).map(([firebaseId, data]) => ({
          ...data,
          firebaseId
        }));
        
        const foundEvent = firebaseEvents.find(event => event.id === resolvedParams.eventId);
        if (foundEvent) {
          setEventConfig(foundEvent);
        } else if (!staticEvent || staticEvent.id === 'twise-night') {
          // Use the fallback only if truly not found
          setEventConfig(staticEvent);
        }
      } else {
        setEventConfig(staticEvent); // Use fallback
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setEventConfig(staticEvent); // Use fallback on error
    });
  }, [resolvedParams.eventId, mounted]);

  // Check backend status and fetch data
  const checkBackendAndFetchData = async () => {
    try {
      setBackendStatus('checking');
      
      // Check backend health
      const healthResponse = await fetch(`${BACKEND_URL}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Backend health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      if (!healthData.success) {
        throw new Error('Backend is not healthy');
      }
      
      setBackendStatus('connected');
      console.log('🤖 AI Backend is available, fetching feedback data...');
      
      // Fetch feedback data from AI backend
      const feedbackResponse = await fetch(`${BACKEND_URL}/api/feedback?eventId=${resolvedParams.eventId}&limit=100`);
      
      if (!feedbackResponse.ok) {
        throw new Error(`Failed to fetch feedback: ${feedbackResponse.status}`);
      }
      
      const data = await feedbackResponse.json();
      const feedbackArray = data.feedback || data; // Handle both response formats
      
      console.log('✅ Loaded feedback from AI backend:', feedbackArray.length, 'items');
      setFeedbackData(feedbackArray);
      setError('');
      
    } catch (err) {
      console.error('❌ AI Backend error:', err);
      setBackendStatus('disconnected');
      setError('AI Backend is required for this dashboard. Please start the backend server.');
      setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    checkBackendAndFetchData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(checkBackendAndFetchData, 10000);
    return () => clearInterval(interval);
  }, [resolvedParams.eventId, mounted]);

  const normalizeDataToPositiveNeutralNegative = (data: FeedbackItem[]) => {
    return data.map(item => ({
      ...item,
      sentiment: 
        item.sentiment === 'pos' || item.sentiment === 'POSITIVE' ? 'POSITIVE' :
        item.sentiment === 'neg' || item.sentiment === 'NEGATIVE' ? 'NEGATIVE' : 'NEUTRAL'
    }));
  };

  const normalizedData = normalizeDataToPositiveNeutralNegative(feedbackData);

  // Process data for stats with enhanced AI metrics
  const stats: DashboardStats = {
    totalParticipants: normalizedData.length,
    averageRating: normalizedData.reduce((acc, curr) => acc + curr.rating, 0) / normalizedData.length || 0,
    sentimentScore: (normalizedData.filter(item => item.sentiment === 'POSITIVE').length / normalizedData.length) * 100 || 0,
    totalFeedback: normalizedData.length,
    // 🆕 Enhanced AI stats
    averageConfidence: normalizedData.filter(item => item.confidence !== undefined).length > 0 
      ? normalizedData.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / normalizedData.filter(item => item.confidence !== undefined).length
      : undefined,
    languageDistribution: normalizedData.reduce((acc, curr) => {
      if (curr.language_detected) {
        acc[curr.language_detected] = (acc[curr.language_detected] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    aiPoweredCount: normalizedData.filter(item => item.ai_powered).length,
    providerDistribution: normalizedData.reduce((acc, curr) => {
      if (curr.provider) {
        acc[curr.provider] = (acc[curr.provider] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  // Process activities data
  const activitiesData = normalizedData.reduce<Record<string, ActivityStats>>((acc, curr) => {
    if (!acc[curr.activity]) {
      acc[curr.activity] = {
        name: curr.activity,
        participants: 0,
        totalRating: 0,
        positiveFeedback: 0
      };
    }
    acc[curr.activity].participants += 1;
    acc[curr.activity].totalRating += curr.rating;
    if (curr.sentiment === 'POSITIVE') {
      acc[curr.activity].positiveFeedback += 1;
    }
    return acc;
  }, {});

  const activities = Object.values(activitiesData).map(activity => ({
    ...activity,
    avgRating: activity.totalRating / activity.participants
  }));

  // Calculate sentiment distribution
  const sentimentCounts = normalizedData.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sentimentData = [
    { name: 'Positive', value: sentimentCounts['POSITIVE'] || 0 },
    { name: 'Neutral', value: sentimentCounts['NEUTRAL'] || 0 },
    { name: 'Negative', value: sentimentCounts['NEGATIVE'] || 0 }
  ];

  // Get recent feedback
  const recentFeedback = [...normalizedData]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  if (!mounted || !eventConfig || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading AI-powered dashboard...
        </div>
      </div>
    );
  }

  // Show backend error screen
  if (error && backendStatus === 'disconnected') {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${eventConfig.theme.background} p-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/admin" 
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${eventConfig.theme.titleGradient} bg-clip-text text-transparent`}>
                {eventConfig.title} Dashboard
              </h1>
              <p className="text-gray-400 mt-1">AI-powered analytics</p>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-lg p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-red-400">AI Backend Required</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  This dashboard requires the AI-powered backend to display feedback analytics with sentiment analysis, confidence scores, and language detection.
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-6 text-left max-w-md mx-auto space-y-4">
                <div className="text-yellow-400 font-semibold">To start the AI backend:</div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Option 1: Use the master startup script</div>
                  <div className="bg-black/40 rounded p-3 font-mono text-sm text-green-400">
                    start.bat
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Option 2: Manual backend start</div>
                  <div className="bg-black/40 rounded p-3 font-mono text-sm text-green-400">
                    cd backend<br/>
                    npm run dev
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Check Connection
                </button>
                <Link
                  href="/admin"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${eventConfig.theme.background} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with AI Backend Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${eventConfig.theme.titleGradient} bg-clip-text text-transparent`}>
                {eventConfig.title} Dashboard
              </h1>
              <p className="text-gray-400 mt-1">AI-powered real-time analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* AI Backend Status Indicator */}
            <div className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
              backendStatus === 'connected' 
                ? 'bg-green-600/20 text-green-400' 
                : backendStatus === 'disconnected' 
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-yellow-600/20 text-yellow-400'
            }`}>
              {backendStatus === 'connected' ? (
                <>
                  <Wifi className="w-4 h-4" />
                  AI Backend Connected
                </>
              ) : backendStatus === 'disconnected' ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  Backend Offline
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Connecting...
                </>
              )}
            </div>
            <div className={`px-4 py-2 bg-gradient-to-r ${eventConfig.theme.buttonGradient} rounded-lg text-white font-medium`}>
              Live Updates
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with AI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Participants</h3>
              <Users className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
            <p className="text-xs text-gray-400">Total responses</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Avg Rating</h3>
              <Star className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-400">Out of 5 stars</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Sentiment</h3>
              <TrendingUp className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(stats.sentimentScore)}%</div>
            <p className="text-xs text-gray-400">Positive feedback</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">AI Confidence</h3>
              <div className="text-purple-400">🤖</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.averageConfidence ? `${Math.round(stats.averageConfidence * 100)}%` : 'N/A'}
            </div>
            <p className="text-xs text-gray-400">Analysis certainty</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Languages</h3>
              <div className="text-blue-400">🌍</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.languageDistribution ? Object.keys(stats.languageDistribution).length : 0}
            </div>
            <p className="text-xs text-gray-400">Detected languages</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">AI Powered</h3>
              <MessageSquare className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.aiPoweredCount || 0}</div>
            <p className="text-xs text-gray-400">AI-analyzed responses</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Ratings Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Activity Ratings</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    interval={0}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Bar dataKey="avgRating" fill="url(#colorGradient)" />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Distribution Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">AI Sentiment Analysis</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E5E7EB' }}
                  />
                  <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Language Distribution (AI Feature) */}
        {stats.languageDistribution && Object.keys(stats.languageDistribution).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">🌍 Language Distribution (AI-Detected)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(stats.languageDistribution).map(([lang, count]) => (
                <div key={lang} className="text-center bg-white/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{count}</div>
                  <div className="text-sm text-gray-400 uppercase">{lang}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((count / stats.totalFeedback) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Provider Distribution */}
        {stats.providerDistribution && Object.keys(stats.providerDistribution).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">🤖 AI Provider Usage</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.providerDistribution).map(([provider, count]) => (
                <div key={provider} className="text-center bg-white/5 rounded-lg p-4">
                  <div className="text-xl font-bold text-purple-400">{count}</div>
                  <div className="text-sm text-gray-300 capitalize">{provider}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round((count / stats.totalFeedback) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Recent Feedback Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <h3 className="text-gray-200 text-xl font-semibold mb-4">🤖 Recent AI-Analyzed Feedback</h3>
          <div className="relative overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-black/20">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Activity</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Feedback</th>
                  <th className="px-6 py-3">AI Analysis</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3 rounded-tr-lg">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentFeedback.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-6 py-4">{item.activity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        {item.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate" title={item.feedback}>
                        {item.feedback}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        item.sentiment === 'POSITIVE' ? 'bg-green-500/20 text-green-400' :
                        item.sentiment === 'NEGATIVE' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.sentiment.toLowerCase()}
                      </span>
                      {item.confidence && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(item.confidence * 100)}% confident
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="text-purple-400">
                          {item.model || item.provider || 'AI'} 
                        </div>
                        {item.language_detected && (
                          <div className="text-blue-400">
                            {item.language_detected.toUpperCase()}
                          </div>
                        )}
                        {item.entities && item.entities.length > 0 && (
                          <div className="text-green-400 text-xs">
                            Entities: {item.entities.slice(0, 2).map(e => typeof e === 'string' ? e : e.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}