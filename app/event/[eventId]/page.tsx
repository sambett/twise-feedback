"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent, use } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { FirebaseEvent, DEFAULT_THEME } from '../../lib/types';
import Link from 'next/link';

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

const UniversalFeedbackForm = ({ params }: EventPageProps) => {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  
  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const [eventConfig, setEventConfig] = useState<FirebaseEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state hooks - declared here to maintain consistent hook order
  const [rating, setRating] = useState<number>(0);
  const [activity, setActivity] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [sentiment, setSentiment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  
  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const healthData = await api.system.getHealth();
        setBackendAvailable(healthData.success === true);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendAvailable(false);
      }
    };

    if (mounted) {
      checkBackend();
    }
  }, [mounted]);
  
  // Load event config from API
  useEffect(() => {
    if (!mounted) return;
    
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.events.get(resolvedParams.eventId);
        setEventConfig(response.data);
      } catch (err) {
        console.error('Failed to load event:', err);
        setError(err instanceof Error ? err.message : 'Event not found');
        setEventConfig(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [resolvedParams.eventId, mounted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setErrorMessage('');

    // Check if backend is available
    if (backendAvailable === false) {
      setErrorMessage('AI Backend is not available. Please start the backend server first.');
      setIsSubmitting(false);
      return;
    }

    // Check if event exists
    if (!eventConfig) {
      setErrorMessage('Event not found. Please check the event ID.');
      setIsSubmitting(false);
      return;
    }
  
    try {
      console.log('🤖 Submitting feedback with AI-powered sentiment analysis');
      
      const feedbackData = {
        starRating: rating,
        activity,
        comment: feedback,
        eventId: resolvedParams.eventId,
        userName: 'Anonymous'
      };

      const response = await api.feedback.submit(feedbackData);
      
      if (response.success) {
        console.log('✅ Feedback submitted successfully:', {
          sentiment: response.data.sentiment,
          confidence: response.data.sentimentConfidence,
          language: response.data.language,
          processingTime: response.data.processingTime
        });
        
        setSentiment(response.data.sentiment || '');

        // Reset form
        setRating(0);
        setActivity('');
        setFeedback('');
        setSentiment('');
        setSubmitSuccess(true);
      } else {
        setErrorMessage(response.message || 'Failed to submit feedback');
        setSubmitSuccess(false);
      }
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      setErrorMessage(error instanceof Error ? error.message : 'Cannot connect to backend server');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderSentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-6 h-6 text-green-400" />;
      case 'negative':
        return <ThumbsDown className="w-6 h-6 text-red-400" />;
      case 'neutral':
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

  // Show backend unavailable error
  if (backendAvailable === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg border border-red-500/50 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
            <h1 className="text-2xl font-bold text-red-400">AI Backend Required</h1>
            <div className="space-y-3 text-gray-300">
              <p>The AI-powered sentiment analysis backend is not available.</p>
              <p className="text-sm">This platform requires the AI backend to analyze feedback.</p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-4 text-left text-sm space-y-2">
              <div className="text-yellow-400 font-semibold">To start the backend:</div>
              <div className="bg-black/30 rounded p-2 font-mono text-xs">
                cd backend<br/>
                npm run dev
              </div>
              <div className="text-gray-400">Or use the master startup script: <code className="bg-black/30 px-1 rounded">run-all.bat</code></div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Retry Connection
              </button>
              <Link
                href="/admin"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error or event not found
  if (error || !eventConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 flex items-center justify-center">
        <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
            <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
            <p className="text-gray-300">
              {error || "The event you're looking for doesn't exist."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Retry
              </button>
              <Link
                href="/admin"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const theme = eventConfig.theme || DEFAULT_THEME;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-4 flex items-center justify-center`}>
      <div className="w-full max-w-lg bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent`}>
            {eventConfig.title}
          </h1>
          <p className="text-gray-300 mt-2">{eventConfig.subtitle}</p>
          {/* Show AI backend status */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-xs text-green-400 opacity-75">
              AI-Powered Multilingual Analysis
            </p>
          </div>
        </div>

        {submitSuccess === true ? (
          <div className="text-center space-y-4">
            <ThumbsUp className="w-16 h-16 mx-auto text-green-400" />
            <h3 className="text-xl text-white font-semibold">Thank you for your feedback!</h3>
            <p className="text-sm text-gray-400">
              Your response has been analyzed with advanced AI and saved
            </p>
            {sentiment && (
              <div className="flex items-center justify-center gap-2 bg-black/30 rounded-full px-4 py-2 inline-flex">
                {renderSentimentIcon()}
                <span className="text-sm text-gray-300 capitalize">
                  {sentiment} sentiment detected
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setSubmitSuccess(null);
                setSentiment('');
              }}
              className={`bg-gradient-to-r ${theme.buttonGradient} hover:opacity-90 text-white font-semibold py-2 px-6 rounded-lg transition-opacity`}
            >
              Submit another response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-200">
                {eventConfig.activityLabel || 'Which aspect would you like to rate?'}
              </label>
              <select
                value={activity}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setActivity(e.target.value)}
                required
                className="w-full bg-gray-800/50 text-gray-100 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="" className="bg-gray-800">Choose an option</option>
                {(eventConfig.activities || []).map((activityOption) => (
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
              <label className="block text-gray-200">
                {eventConfig.feedbackLabel || 'Share your thoughts'}
              </label>
              <div className="relative">
                <textarea
                  value={feedback}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                    setFeedback(e.target.value);
                  }}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder={eventConfig.feedbackPlaceholder || 'Tell us about your experience...'}
                  required
                />
                {sentiment && (
                  <div className="absolute right-2 top-2 flex items-center gap-2 bg-black/40 rounded-full p-2">
                    {renderSentimentIcon()}
                    <span className="text-sm text-gray-300 capitalize">
                      {sentiment}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || backendAvailable === false}
              className={`w-full bg-gradient-to-r ${theme.buttonGradient} hover:opacity-90 text-white font-semibold py-3 rounded-lg transition-opacity ${
                isSubmitting || backendAvailable === false ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing with AI...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </button>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="text-red-400 text-sm font-medium">{errorMessage}</div>
                    {errorMessage.includes("Backend") && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>Start the backend server:</div>
                        <div className="bg-black/20 rounded p-2 font-mono text-xs">
                          cd backend && npm run dev
                        </div>
                        <div>Or run: <code className="bg-black/20 px-1 rounded">run-all.bat</code></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        <div className="mt-8 text-center">
          <Link 
            href="/admin"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UniversalFeedbackForm;