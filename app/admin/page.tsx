"use client";

import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Star, TrendingUp, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const mockData = {
    activities: [
      { name: 'AI Workshop & Innovation', participants: 42, avgRating: 4.5, positiveFeedback: 38 },
      { name: 'Healthcare & Biotech', participants: 35, avgRating: 4.2, positiveFeedback: 30 },
      { name: 'Environmental Projects', participants: 28, avgRating: 4.7, positiveFeedback: 25 },
      { name: 'Smart Cities & IoT', participants: 31, avgRating: 4.3, positiveFeedback: 28 },
      { name: 'Social Impact Research', participants: 25, avgRating: 4.6, positiveFeedback: 22 },
      { name: 'Quantum Computing Demo', participants: 30, avgRating: 4.4, positiveFeedback: 27 },
      { name: 'Robotics Lab', participants: 38, avgRating: 4.8, positiveFeedback: 35 },
      { name: 'VR Research Experience', participants: 33, avgRating: 4.5, positiveFeedback: 29 }
    ],
    recentFeedback: [
      {
        activity: 'AI Workshop & Innovation',
        rating: 5,
        feedback: "Learned a lot about machine learning applications!",
        sentiment: 'POSITIVE',
        timestamp: '2024-02-08T14:30:00'
      },
      {
        activity: 'Robotics Lab',
        rating: 5,
        feedback: "Amazing hands-on experience with cutting-edge robots",
        sentiment: 'POSITIVE',
        timestamp: '2024-02-08T14:25:00'
      }
    ],
    stats: {
      totalParticipants: 291,
      averageRating: 4.4,
      sentimentScore: 87,
      totalFeedback: 260
    }
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                TWISE Night Dashboard
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Real-time feedback analysis</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20">
              Live
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Total Participants</h3>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{mockData.stats.totalParticipants}</div>
              <p className="text-xs text-gray-400">Across all activities</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl hover:shadow-purple-500/10 transition-all duration-300 p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Average Rating</h3>
              <Star className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{mockData.stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-gray-400">From all feedback</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl hover:shadow-pink-500/10 transition-all duration-300 p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Sentiment Score</h3>
              <TrendingUp className="h-4 w-4 text-pink-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{mockData.stats.sentimentScore}%</div>
              <p className="text-xs text-gray-400">Positive feedback</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl hover:shadow-blue-500/10 transition-all duration-300 p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="text-sm font-medium text-gray-200">Total Feedback</h3>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{mockData.stats.totalFeedback}</div>
              <p className="text-xs text-gray-400">Responses collected</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Activity Ratings</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.activities}>
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

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6">
            <h3 className="text-gray-200 text-xl font-semibold mb-4">Sentiment Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Positive', value: 75 },
                      { name: 'Neutral', value: 15 },
                      { name: 'Negative', value: 10 }
                    ]}
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

        {/* Recent Feedback */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-6">
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
                {mockData.recentFeedback.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">{item.activity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        {item.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.feedback}</td>
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
};

export default AdminDashboard;