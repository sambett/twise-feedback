'use client';

import React, { useState, useEffect, use } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Star, TrendingUp, MessageSquare, ArrowLeft } from 'lucide-react';
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
}

interface EventAdminProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventAdminDashboard({ params }: EventAdminProps) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  
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
        const firebaseEvents = Object.entries(snapshot.val()).map(([firebaseId, data]: [string, EventConfig & { firebaseId?: string }]) => ({
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/get-feedback?eventId=${resolvedParams.eventId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const feedbackArray = await response.json();

        setFeedbackData(feedbackArray);
        setError('');
      } catch (err) {
        setError('Failed to load feedback data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [resolvedParams.eventId]);

  const normalizeDataToPositiveNeutralNegative = (data: FeedbackItem[]) => {
    return data.map(item => ({
      ...item,
      sentiment: 
        item.sentiment === 'pos' || item.sentiment === 'POSITIVE' ? 'POSITIVE' :
        item.sentiment === 'neg' || item.sentiment === 'NEGATIVE' ? 'NEGATIVE' : 'NEUTRAL'
    }));
  };

  const normalizedData = normalizeDataToPositiveNeutralNegative(feedbackData);

  // Process data for stats
  const stats: DashboardStats = {
    totalParticipants: normalizedData.length,
    averageRating: normalizedData.reduce((acc, curr) => acc + curr.rating, 0) / normalizedData.length || 0,
    sentimentScore: (normalizedData.filter(item => item.sentiment === 'POSITIVE').length / normalizedData.length) * 100 || 0,
    totalFeedback: normalizedData.length
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
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${eventConfig.theme.background} p-6 flex items-center justify-center`}>
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${eventConfig.theme.background} p-6`}>
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
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${eventConfig.theme.titleGradient} bg-clip-text text-transparent`}>
                {eventConfig.title} Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Real-time feedback analysis</p>
            </div>
          </div>
          <div className={`px-4 py-2 bg-gradient-to-r ${eventConfig.theme.buttonGradient} rounded-lg text-white font-medium`}>
            Live
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Total Participants</h3>
              <Users className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
            <p className="text-xs text-gray-400">Across all activities</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Average Rating</h3>
              <Star className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-400">From all feedback</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Sentiment Score</h3>
              <TrendingUp className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(stats.sentimentScore)}%</div>
            <p className="text-xs text-gray-400">Positive feedback</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Total Feedback</h3>
              <MessageSquare className={`h-4 w-4 text-${eventConfig.theme.accent}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalFeedback}</div>
            <p className="text-xs text-gray-400">Responses collected</p>
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
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Sentiment Distribution</h3>
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

        {/* Recent Feedback Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <h3 className="text-gray-200 text-xl font-semibold mb-4">Recent Feedback</h3>
          <div className="relative overflow-x-auto rounded-lg">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-black/20">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Activity</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Feedback</th>
                  <th className="px-6 py-3">Sentiment</th>
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
                    <td className="px-6 py-4 max-w-xs truncate">{item.feedback}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        item.sentiment === 'POSITIVE' ? 'bg-green-500/20 text-green-400' :
                        item.sentiment === 'NEGATIVE' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.sentiment.toLowerCase()}
                      </span>
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