'use client';

import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Star, TrendingUp, MessageSquare, Download } from 'lucide-react';

// Custom Card Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-200 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-3 ${className}`}>
    {children}
  </div>
);

// Mock data for visualization
const mockData = {
  activities: [
    { name: 'AI Workshop', participants: 42, avgRating: 4.5, positiveFeedback: 38 },
    { name: 'Healthcare Lab', participants: 35, avgRating: 4.2, positiveFeedback: 30 },
    { name: 'Environmental', participants: 28, avgRating: 4.7, positiveFeedback: 25 },
    { name: 'Smart Cities', participants: 31, avgRating: 4.3, positiveFeedback: 28 },
    { name: 'Social Impact', participants: 25, avgRating: 4.6, positiveFeedback: 22 },
    { name: 'Quantum Demo', participants: 30, avgRating: 4.4, positiveFeedback: 27 },
    { name: 'Robotics', participants: 38, avgRating: 4.8, positiveFeedback: 35 },
    { name: 'VR Experience', participants: 33, avgRating: 4.5, positiveFeedback: 29 }
  ],
  sentimentData: [
    { name: 'Positive', value: 75, color: '#10B981' },
    { name: 'Neutral', value: 15, color: '#F59E0B' },
    { name: 'Negative', value: 10, color: '#EF4444' }
  ],
  recentFeedback: [
    {
      id: 1,
      activity: 'AI Workshop',
      rating: 5,
      feedback: "Amazing experience! Learned so much about AI and its applications.",
      sentiment: 'POSITIVE',
      time: '14:30'
    },
    {
      id: 2,
      activity: 'Robotics Lab',
      rating: 4,
      feedback: "The hands-on experience was great. Would love more time with the robots.",
      sentiment: 'POSITIVE',
      time: '14:25'
    },
    {
      id: 3,
      activity: 'Healthcare Lab',
      rating: 3,
      feedback: "Interesting but a bit too technical for beginners.",
      sentiment: 'NEUTRAL',
      time: '14:20'
    }
  ]
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                TWISE Night Analytics
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Real-time feedback analysis</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Total Participants</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">262</div>
              <p className="text-xs text-gray-400">Across all activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4.5</div>
              <p className="text-xs text-gray-400">Out of 5 stars</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sentiment Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">75%</div>
              <p className="text-xs text-gray-400">Positive feedback</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">245</div>
              <p className="text-xs text-gray-400">Responses collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Ratings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Ratings</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Sentiment Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockData.sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mockData.sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Legend formatter={(value) => <span className="text-gray-300">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {mockData.recentFeedback.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
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
                      <td className="px-6 py-4 text-gray-400">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}