"use client";
// Update the first line to include useEffect
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

/*interface FormData {
  activity: string;
  rating: number;
  feedback: string;
  timestamp: string;
}*/

const TWISEFeedbackForm = () => {
  const [rating, setRating] = useState<number>(0);
  const [activity, setActivity] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [sentiment, setSentiment] = useState<string>('');
  const [memeUrl, setMemeUrl] = useState<string>('');
  // Update this part of your code
  const [submittedCount, setSubmittedCount] = useState<number>(42);  const totalParticipants = 100;

  // Simulate sentiment analysis
  const analyzeSentiment = async (text: string): Promise<string> => {
    const positiveWords = ['great', 'awesome', 'excellent', 'good', 'love', 'amazing'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'worst', 'boring'];
    
    const words = text.toLowerCase().split(' ');
    const positiveCount = words.filter((word: string) => positiveWords.includes(word)).length;
    const negativeCount = words.filter((word: string) => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  };

  const getMeme = (sentiment: string): string => {
    const memes: Record<string, string> = {
      POSITIVE: "/api/placeholder/400/300",
      NEUTRAL: "/api/placeholder/400/300",
      NEGATIVE: "/api/placeholder/400/300"
    };
    return memes[sentiment];
  };

  const handleFeedbackChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFeedback(text);
    if (text.length > 10) {
      const result = await analyzeSentiment(text);
      setSentiment(result);
    } else {
      setSentiment('');
    }
  };
  

  // Add this useEffect near your other state declarations
  useEffect(() => {
    // Any client-side initialization can go here
  }, []);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sentimentResult = await analyzeSentiment(feedback);
    setMemeUrl(getMeme(sentimentResult));
    setShowSuccess(true);
    setSubmittedCount(prev => prev + 1);
    
    setTimeout(() => {
      setShowSuccess(false);
      setRating(0);
      setActivity('');
      setFeedback('');
      setMemeUrl('');
      setSentiment('');
    }, 5000);
  };

  const SentimentIcon = () => {
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
            <label className="block text-gray-200">Select Activity</label>
            <select 
              value={activity}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setActivity(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Choose an activity</option>
              <option value="ai_workshop">AI Workshop</option>
              <option value="quantum_demo">Quantum Computing Demo</option>
              <option value="robotics_lab">Robotics Lab</option>
              <option value="biotech_talk">Biotech Innovation Talk</option>
              <option value="vr_experience">VR Research Experience</option>
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
            <label className="block text-gray-200">What did you learn? What interested you?</label>
            <div className="relative">
              <textarea
                value={feedback}
                onChange={handleFeedbackChange}
                className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Share your thoughts..."
                required
              />
              {sentiment && (
                <div className="absolute right-2 top-2 flex items-center gap-2 bg-black/40 rounded-full p-2">
                  <SentimentIcon />
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

          {showSuccess && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="text-green-400 font-semibold">Thank you for your feedback!</div>
              {memeUrl && (
                <img 
                  src={memeUrl} 
                  alt="Feedback Meme" 
                  className="rounded-lg mx-auto w-full max-w-sm"
                />
              )}
            </div>
          )}
        </form>

        <div className="mt-6">
          <div className="text-sm text-gray-400 mb-1">
            {submittedCount} of {totalParticipants} participants have shared their feedback!
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(submittedCount / totalParticipants) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TWISEFeedbackForm;