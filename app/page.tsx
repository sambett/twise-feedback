"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

const challenges = [
  "AI Workshop & Innovation",
  "Healthcare & Biotech",
  "Environmental Projects",
  "Smart Cities & IoT",
  "Social Impact Research",
  "Quantum Computing Demo",
  "Robotics Lab",
  "VR Research Experience"
] as const;

const TWISEFeedbackForm = () => {
  const [rating, setRating] = useState<number>(0);
  const [activity, setActivity] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>('');

  const analyzeSentiment = (text: string): string => {
    const positiveWords = ['great', 'awesome', 'excellent', 'good', 'love', 'amazing'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'worst', 'boring'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ activity, rating, feedback, sentiment });
    // Reset form
    setRating(0);
    setActivity('');
    setFeedback('');
    setSentiment('');
  };

  const renderSentimentIcon = () => {
    switch (sentiment) {
      case 'POSITIVE':
        return <ThumbsUp className="w-6 h-6 text-green-400" />;
      case 'NEGATIVE':
        return <ThumbsDown className="w-6 h-6 text-red-400" />;
      case 'NEUTRAL':
        return <Meh className="w-6 h-6 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            TWISE Night Feedback
          </h1>
          <p className="text-gray-300 mt-2">Share your experience with us!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-200">Select  The Activity You Liked The Most !</label>
            <select 
              value={activity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setActivity(e.target.value)}
              required
              className="w-full bg-gray-800/50 text-gray-100 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="" className="bg-gray-800">Choose an activity</option>
              {challenges.map((challenge) => (
                <option key={challenge} value={challenge} className="bg-gray-800">
                  {challenge}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-200">Rate your experience</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-200">What did you learn?</label>
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setFeedback(e.target.value);
                  if (e.target.value.length > 10) {
                    setSentiment(analyzeSentiment(e.target.value));
                  }
                }}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Share your thoughts..."
                required
              />
              {sentiment && (
                <div className="absolute right-2 top-2 flex items-center gap-2 bg-black/40 rounded-full p-2">
                  {renderSentimentIcon()}
                  <span className="text-sm text-gray-300">{sentiment.toLowerCase()}</span>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default TWISEFeedbackForm;