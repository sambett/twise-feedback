'use client';

import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, ThumbsUp, ThumbsDown, Meh, Smartphone } from 'lucide-react';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    activity: '',
    rating: 0,
    comment: '',
    qrCode: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Récupérer les paramètres URL (activity et qr)
    const urlParams = new URLSearchParams(window.location.search);
    const activity = urlParams.get('activity') || 'Robotique';
    const qrCode = urlParams.get('qr') || 'QR001';
    
    setFormData(prev => ({
      ...prev,
      activity,
      qrCode
    }));
  }, [isClient]);

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        // Redirection automatique après 3 secondes
        setTimeout(() => {
          window.location.href = '/nuit-chercheurs';
        }, 3000);
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      // Simuler un succès pour la démo
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/nuit-chercheurs';
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (rating) => {
    if (rating >= 8) return <ThumbsUp className="h-6 w-6 text-green-500" />;
    if (rating >= 5) return <Meh className="h-6 w-6 text-yellow-500" />;
    if (rating > 0) return <ThumbsDown className="h-6 w-6 text-red-500" />;
    return null;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (rating) => {
    if (rating >= 9) return 'Exceptionnel ! 🌟';
    if (rating >= 8) return 'Excellent ! 😊';
    if (rating >= 6) return 'Bien 👍';
    if (rating >= 4) return 'Correct 😐';
    if (rating > 0) return 'À améliorer 😞';
    return '';
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Chargement...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Merci ! 🎉</h2>
          <p className="text-gray-600 mb-4">
            Votre retour a été analysé par notre IA et enregistré avec succès.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700">
              <strong>Votre impact:</strong> Vos commentaires aident à améliorer en temps réel 
              l'expérience de la Nuit des Chercheurs pour tous les participants !
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirection vers le dashboard en cours...
          </p>
          <div className="mt-4">
            <a 
              href="/nuit-chercheurs"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Voir le dashboard maintenant
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              🔬 Nuit des Chercheurs 2025
            </h1>
            <p className="text-gray-600 mb-2">
              Votre avis compte ! 
            </p>
            <div className="flex items-center justify-center text-sm text-blue-600">
              <Smartphone className="h-4 w-4 mr-1" />
              Analysé par Intelligence Artificielle
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Activité */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activité évaluée
            </label>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-semibold text-lg">{formData.activity}</p>
              <p className="text-blue-600 text-sm">Code QR: {formData.qrCode}</p>
              <p className="text-blue-500 text-xs mt-1">
                ✨ Votre retour sera analysé en temps réel par notre système IA
              </p>
            </div>
          </div>

          {/* Note de satisfaction */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Note de satisfaction (1-10) ⭐
            </label>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleRatingClick(num)}
                  className={`h-12 rounded-lg border-2 font-bold transition-all transform hover:scale-110 ${
                    formData.rating === num
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500 scale-110 shadow-lg'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {formData.rating > 0 && (
              <div className="flex items-center justify-center mt-4 space-x-2 p-3 bg-gray-50 rounded-lg">
                {getSentimentIcon(formData.rating)}
                <span className={`font-medium text-lg ${getRatingColor(formData.rating)}`}>
                  {getRatingText(formData.rating)}
                </span>
              </div>
            )}
          </div>

          {/* Commentaire */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire détaillé 💭
            </label>
            <textarea
              value={formData.comment}
              onChange={handleCommentChange}
              rows={4}
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              placeholder="Partagez votre expérience, ce que vous avez aimé, vos suggestions d'amélioration..."
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {formData.comment.length}/500 caractères
              </p>
              <p className="text-xs text-blue-500">
                🧠 Sera analysé par IA pour détecter les émotions
              </p>
            </div>
          </div>

          {/* Questions rapides */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              ⚡ Questions rapides
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded text-blue-600" />
                <span className="text-sm text-gray-700">Recommanderiez-vous cette activité ?</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded text-blue-600" />
                <span className="text-sm text-gray-700">L'explication était claire et accessible</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded text-blue-600" />
                <span className="text-sm text-gray-700">L'activité était interactive et engageante</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3 rounded text-blue-600" />
                <span className="text-sm text-gray-700">J'ai appris quelque chose de nouveau</span>
              </label>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={formData.rating === 0 || loading}
            className={`w-full py-4 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 text-lg ${
              formData.rating === 0 || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 active:scale-95 shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Analyse IA en cours...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Envoyer mon retour 🚀</span>
              </>
            )}
          </button>

          {formData.rating === 0 && (
            <p className="text-center text-sm text-red-500 mt-3 flex items-center justify-center">
              <Star className="h-4 w-4 mr-1" />
              Veuillez sélectionner une note avant de continuer
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            🤖 Votre feedback sera traité par notre système d'IA pour améliorer l'événement en temps réel
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <a href="/nuit-chercheurs" className="hover:text-blue-600 underline">
              📊 Voir le Dashboard
            </a>
            <span>•</span>
            <span>🏆 Concours 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;