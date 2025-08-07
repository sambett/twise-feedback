'use client';

import React, { useState, useEffect, use } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Star, TrendingUp, MessageSquare, ArrowLeft, Wifi, WifiOff, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { Analytics, FirebaseEvent, FeedbackData } from '../../lib/types';
import Link from 'next/link';

interface EventAdminProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventAdminDashboard({ params }: EventAdminProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [realtimeUpdates, setRealtimeUpdates] = useState(false);
  
  // Client-side mounting check
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check backend status and load data
  const loadData = async () => {
    try {
      setBackendStatus('checking');
      setLoading(true);
      setError(null);
      
      // Check backend health
      const healthData = await api.system.getHealth();
      if (!healthData.success) {
        throw new Error('Backend is not healthy');
      }
      
      setBackendStatus('connected');
      
      // Load analytics data
      const analyticsData = await api.analytics.getEventAnalytics(resolvedParams.eventId);
      setAnalytics(analyticsData.data);
      
      // Load recent feedback
      const feedbackResponse = await api.feedback.get({ eventId: resolvedParams.eventId, limit: 20 });
      setFeedbackData(feedbackResponse.data || []);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setBackendStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time updates
  const setupRealtimeUpdates = () => {
    if (backendStatus !== 'connected') return;
    
    try {
      const cleanup = api.analytics.subscribeToRealtimeUpdates(
        resolvedParams.eventId,
        (update) => {
          if (update.type === 'update' && update.data) {
            // Update stats from real-time data
            setAnalytics(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                analytics: {
                  ...prev.analytics,
                  totalFeedback: update.data!.totalFeedback,
                  averageRating: update.data!.averageRating,
                  sentimentBreakdown: update.data!.sentimentCounts,
                  lastUpdated: new Date().toISOString()
                }
              };
            });
            
            // Update recent feedback
            setFeedbackData(update.data!.latestFeedback);
          }
        },
        (error) => {
          console.error('Real-time update error:', error);
          setRealtimeUpdates(false);
        }
      );
      
      setRealtimeUpdates(true);
      return cleanup;
    } catch (error) {
      console.error('Failed to set up real-time updates:', error);
      setRealtimeUpdates(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, [resolvedParams.eventId, mounted]);

  // Set up real-time updates when backend is connected
  useEffect(() => {
    if (backendStatus === 'connected' && !realtimeUpdates) {
      const cleanup = setupRealtimeUpdates();
      return cleanup;
    }
  }, [backendStatus, realtimeUpdates]);

  const downloadReport = async () => {
    try {
      // This would export data - for now just alert
      alert('Export functionality will be implemented here');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading AI-powered dashboard...
        </div>
      </div>
    );
  }

  // Show backend error screen
  if (error || backendStatus === 'disconnected' || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Event Dashboard
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
                <h2 className="text-2xl font-bold text-red-400">Backend Connection Required</h2>
                <p className="text-gray-300 max-w-md mx-auto">
                  {error || 'This dashboard requires the backend server to display analytics with sentiment analysis, real-time updates, and detailed metrics.'}
                </p>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-6 text-left max-w-md mx-auto space-y-4">
                <div className="text-yellow-400 font-semibold">To start the backend:</div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Option 1: Use the startup script</div>
                  <div className="bg-black/40 rounded p-3 font-mono text-sm text-green-400">
                    run-all.bat
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

  const { event, analytics: stats } = analytics;
  const theme = event.theme || { 
    background: 'from-slate-900 via-purple-900 to-slate-900',
    titleGradient: 'from-indigo-400 to-purple-400',
    buttonGradient: 'from-indigo-600 to-purple-600',
    accent: 'indigo-400'
  };

  // Process data for charts
  const activitiesData = Object.entries(stats.activityBreakdown).map(([name, data]) => ({
    name,
    participants: data.count,
    avgRating: data.averageRating,
    positive: data.sentiments.positive,
    neutral: data.sentiments.neutral,
    negative: data.sentiments.negative
  }));

  const sentimentData = [
    { name: 'Positive', value: stats.sentimentBreakdown.positive, color: '#10B981' },
    { name: 'Neutral', value: stats.sentimentBreakdown.neutral, color: '#F59E0B' },
    { name: 'Negative', value: stats.sentimentBreakdown.negative, color: '#EF4444' }
  ];

  const ratingData = Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
    rating: `${rating} Star${rating === '1' ? '' : 's'}`,
    count
  }));

  // Hourly trends data (last 24 hours)
  const hourlyData = stats.trends.hourly.map((count, index) => ({
    hour: `${index}:00`,
    responses: count
  }));

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent`}>
                {event.title}
              </h1>
              <p className="text-gray-400 mt-1">{event.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Real-time Status */}
            <div className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
              realtimeUpdates
                ? 'bg-green-600/20 text-green-400' 
                : backendStatus === 'connected'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-red-600/20 text-red-400'
            }`}>
              {realtimeUpdates ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live Updates
                </>
              ) : backendStatus === 'connected' ? (
                <>
                  <Wifi className="w-4 h-4" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Offline
                </>
              )}
            </div>

            {/* Action Buttons */}
            <Link
              href={`/event/${event.id}`}
              target="_blank"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Form
            </Link>
            
            <button
              onClick={downloadReport}
              className={`bg-gradient-to-r ${theme.buttonGradient} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-opacity`}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Total Feedback</h3>
              <MessageSquare className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalFeedback}</div>
            <p className="text-xs text-gray-400">
              {stats.timeAnalysis.last24Hours} in last 24h
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Avg Rating</h3>
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-400">Out of 5 stars</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Positive</h3>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round((stats.sentimentBreakdown.positive / Math.max(stats.totalFeedback, 1)) * 100)}%
            </div>
            <p className="text-xs text-gray-400">{stats.sentimentBreakdown.positive} responses</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Languages</h3>
              <div className="text-blue-400">🌍</div>
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.keys(stats.languageDistribution).length}
            </div>
            <p className="text-xs text-gray-400">Detected</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Activities</h3>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.keys(stats.activityBreakdown).length}
            </div>
            <p className="text-xs text-gray-400">Categories</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Ratings */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Activity Ratings</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activitiesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="avgRating" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Sentiment Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Trends */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Response Trends (24h)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="responses" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Rating Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="rating" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Language Distribution */}
        {Object.keys(stats.languageDistribution).length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">🌍 Language Distribution</h3>
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

        {/* Recent Feedback */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <h3 className="text-gray-200 text-xl font-semibold mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {feedbackData.slice(0, 5).map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{item.activity}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < item.starRating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-600'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.sentiment && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        item.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.sentiment}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : 'Now'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{item.comment}</p>
                {item.language && (
                  <div className="mt-2 text-xs text-blue-400">
                    Language: {item.language.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-400 text-sm">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
}