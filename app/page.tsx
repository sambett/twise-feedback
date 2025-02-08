"use client";

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Star, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { ref, push } from "firebase/database";
import { db } from "./firebase"; // Assurez-vous que le chemin correspond à la localisation de firebase.ts

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
  const [serverSentiment, setServerSentiment] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      // Étape 1 : Envoyer le texte saisi au serveur Flask pour l'analyse de sentiment
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Réponse du serveur Flask:", data);
  
        // Mettre à jour le sentiment basé sur la réponse du serveur
        setSentiment(data.dominant_sentiment);
  
        // Étape 2 : Préparer les données pour Firebase
        const feedbackData = {
          activity,
          rating,
          feedback,
          sentiment: data.dominant_sentiment, // Utiliser le sentiment analysé par Flask
          timestamp: new Date().toISOString(),
        };
  
        // Étape 3 : Ajouter les données dans Firebase
        const feedbackRef = ref(db, 'feedback'); // Référence au nœud "feedback"
        await push(feedbackRef, feedbackData); // Pousser les données avec un nouvel ID unique
        console.log("Feedback ajouté dans Firebase avec succès:", feedbackData);
  
        // Réinitialiser le formulaire après succès
        setRating(0);
        setActivity('');
        setFeedback('');
        setSentiment('');
      } else {
        console.error("Erreur du serveur Flask:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission des données:", error);
    }
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
                  if (e.target.value.length > 10) {
                    setSentiment(e.target.value); // Local sentiment analysis (optional)
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

        {serverSentiment && (
          <div className="mt-6 text-center text-gray-200">
            <p>Server Sentiment Analysis:</p>
            <p className="font-bold text-lg">{serverSentiment}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TWISEFeedbackForm;
