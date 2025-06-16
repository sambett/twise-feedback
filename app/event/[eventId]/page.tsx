"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent, use } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { ref, push, onValue, off } from "firebase/database";
import { db } from "../../firebase";
import { eventConfigs, EventConfig } from '../../lib/eventConfigs';

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

const UniversalFeedbackForm = ({ params }: EventPageProps) => {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  
  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Form state hooks - declared here to maintain consistent hook order
  const [rating, setRating] = useState<number>(0);
  const [activity, setActivity] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Load event config from static or Firebase
  useEffect(() => {
    if (!mounted) return;
    
    // First check static events
    const staticEvent = eventConfigs[resolvedParams.eventId];
    if (staticEvent) {
      setEventConfig(staticEvent);
      setLoading(false);
      return;
    }
    
    // If not found in static events, check Firebase
    const eventsRef = ref(db, 'events');
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseEvents = Object.entries(snapshot.val()).map(([firebaseId, data]: [string, any]) => ({
          ...data,
          firebaseId
        }));
        
        const foundEvent = firebaseEvents.find(event => event.id === resolvedParams.eventId);
        if (foundEvent) {
          setEventConfig(foundEvent);
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
    });
    
    return () => off(eventsRef);
  }, [resolvedParams.eventId, mounted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setErrorMessage('');
  
    try {
      // Analyze sentiment using API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const dominantSentiment = data.dominant_sentiment;
        setSentiment(dominantSentiment);
  
        // Store feedback under the specific event
        const feedbackData = {
          activity,
          rating,
          feedback,
          sentiment: dominantSentiment,
          timestamp: new Date().toISOString(),
          eventId: resolvedParams.eventId
        };
  
        const feedbackRef = ref(db, `events/${resolvedParams.eventId}/feedback`);
        await push(feedbackRef, feedbackData);
  
        // Reset form
        setRating(0);
        setActivity('');
        setFeedback('');
        setSentiment('');
        setSubmitSuccess(true);
      } else {
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

  // CONDITIONAL RENDERING AFTER ALL HOOKS ARE DECLARED
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    );
  }
  
  // Fallback if event not found
  if (!eventConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-300">The event you're looking for doesn't exist.</p>
          <a href="/admin" className="mt-4 inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg">
            View All Events
          </a>
        </div>
      </div>
    );
  }

  const theme = eventConfig.theme;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 flex items-center justify-center`}>
      <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent`}>
            {eventConfig.title}
          </h1>
          <p className="text-gray-300 mt-2">{eventConfig.subtitle}</p>
        </div>

        {submitSuccess === true ? (
          <div className="text-center space-y-4">
            <ThumbsUp className="w-16 h-16 mx-auto text-green-400" />
            <h3 className="text-xl text-white font-semibold">Thank you for your feedback!</h3>
            <button
              onClick={() => setSubmitSuccess(null)}
              className={`bg-gradient-to-r ${theme.buttonGradient} hover:${theme.buttonHover} text-white font-semibold py-2 px-6 rounded-lg transition-colors`}
            >
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-200">{eventConfig.activityLabel}</label>
              <select
                value={activity}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setActivity(e.target.value)}
                required
                className="w-full bg-gray-800/50 text-gray-100 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="" className="bg-gray-800">Choose an option</option>
                {eventConfig.activities.map((activityOption) => (
                  <option key={activityOption} value={activityOption} className="bg-gray-800">
                    {activityOption}
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
              <label className="block text-gray-200">{eventConfig.feedbackLabel}</label>
              <div className="relative">
                <textarea
                  value={feedback}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setFeedback(e.target.value);
                  }}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder={eventConfig.feedbackPlaceholder}
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
              className={`w-full bg-gradient-to-r ${theme.buttonGradient} hover:${theme.buttonHover} text-white font-semibold py-3 rounded-lg transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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

export default UniversalFeedbackForm;