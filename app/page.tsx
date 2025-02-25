"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { ref, push } from "firebase/database";
import { db } from "./firebase";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setErrorMessage('');
  
    try {
      // Analyze sentiment using Vercel API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Sentiment analysis response:", data);
  
        // Update sentiment based on server response
        const dominantSentiment = data.dominant_sentiment;
        setSentiment(dominantSentiment);
  
        // Prepare data for Firebase
        const feedbackData = {
          activity,
          rating,
          feedback,
          sentiment: dominantSentiment,
          timestamp: new Date().toISOString(),
        };
  
        // Add data to Firebase
        const feedbackRef = ref(db, 'feedback');
        await push(feedbackRef, feedbackData);
        console.log("Feedback added to Firebase successfully:", feedbackData);
  
        // Reset form after success
        setRating(0);
        setActivity('');
        setFeedback('');
        setSentiment('');
        setSubmitSuccess(true);
      } else {
        console.error("Error from sentiment analysis API:", response.statusText);
        setErrorMessage("Failed to analyze sentiment. Please try again.");
        setSubmitSuccess(false);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setErrorMessage("Failed to submit feedback. Please check your connection and try again.");
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderSentimentIcon = () => {
    switch (sentiment) {
      case 'pos':
      case 'POSITIVE':
        return <ThumbsUp className="w-6 h-6 text-green-400" />;
      case 'neg':
      case 'NEGATIVE':
        return <ThumbsDown className="w-6 h-6 text-red-400" />;
      case 'neu':
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

        {submitSuccess === true ? (
          <div className="text-center space-y-4">
            <ThumbsUp className="w-16 h-16 mx-auto text-green-400" />
            <h3 className="text-xl text-white font-semibold">Thank you for your feedback!</h3>
            <button
              onClick={() => setSubmitSuccess(null)}
              className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-200">Select The Activity You Liked The Most!</label>
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
                  }}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Share your thoughts..."
                  required
                />
                {sentiment && (
                  <div className="absolute right-2 top-2 flex items-center gap-2 bg-black/40 rounded-full p-2">
                    {renderSentimentIcon()}
                    <span className="text-sm text-gray-300">
                      {sentiment === 'pos' || sentiment === 'POSITIVE' 
                        ? 'positive' 
                        : sentiment === 'neg' || sentiment === 'NEGATIVE' 
                          ? 'negative' 
                          : 'neutral'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold py-3 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>

            {errorMessage && (
              <div className="text-red-400 text-center mt-2">
                {errorMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default TWISEFeedbackForm;