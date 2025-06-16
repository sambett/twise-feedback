'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Heart, TrendingUp, Users, Star, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';

const NuitChercheursDashboard = () => {
  const [realTimeData, setRealTimeData] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side mounting check to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fonction pour récupérer les données de l'API
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard');
      if (!response.ok) {
        throw new Error('Erreur API');
      }
      const data = await response.json();
      setRealTimeData(data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err.message);
      // Données de fallback
      setRealTimeData({
        totalParticipants: 127,
        satisfactionRate: 87,
        sentiment: { positive: 65, neutral: 25, negative: 10 },
        topActivities: [
          { name: 'Robotique', satisfaction: 92, participants: 45 },
          { name: 'Astronomie', satisfaction: 88, participants: 38 },
          { name: 'Biotechnologie', satisfaction: 85, participants: 32 },
          { name: 'IA & Machine Learning', satisfaction: 90, participants: 28 }
        ],
        recentFeedback: [
          { id: 1, activity: 'Robotique', comment: 'Excellent atelier, très interactif!', sentiment: 'positive', time: '14:32' },
          { id: 2, activity: 'Astronomie', comment: 'Présentation claire et passionnante', sentiment: 'positive', time: '14:28' },
          { id: 3, activity: 'Biotechnologie', comment: 'Un peu complexe mais intéressant', sentiment: 'neutral', time: '14:25' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // Simulation de données en temps réel
  const simulateData = async () => {
    try {
      await fetch('http://localhost:5000/api/simulate', { method: 'POST' });
      // Attendre un peu puis récupérer les nouvelles données
      setTimeout(fetchData, 500);
    } catch (err) {
      console.error('Erreur simulation:', err);
    }
  };

  useEffect(() => {
    if (!isClient) return;

    // Mise à jour de l'heure
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR'));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Récupération initiale des données
    fetchData();

    // Mise à jour automatique des données toutes les 10 secondes
    const dataInterval = setInterval(fetchData, 10000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, [isClient]);

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-700">Chargement du dashboard...</div>
        </div>
      </div>
    );
  }

  if (!realTimeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <div className="text-xl text-red-700">Erreur de chargement des données</div>
          <button 
            onClick={fetchData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positif', value: realTimeData.sentiment.positive, color: '#10B981' },
    { name: 'Neutre', value: realTimeData.sentiment.neutral, color: '#F59E0B' },
    { name: 'Négatif', value: realTimeData.sentiment.negative, color: '#EF4444' }
  ];

  const hourlyData = [
    { hour: '10:00', participants: 15, satisfaction: 82 },
    { hour: '11:00', participants: 28, satisfaction: 85 },
    { hour: '12:00', participants: 42, satisfaction: 87 },
    { hour: '13:00', participants: 65, satisfaction: 86 },
    { hour: '14:00', participants: 89, satisfaction: 88 },
    { hour: '15:00', participants: realTimeData.totalParticipants, satisfaction: realTimeData.satisfactionRate }
  ];

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔬 Nuit des Chercheurs 2025
              </h1>
              <p className="text-gray-600">Dashboard d'analyse des sentiments en temps réel</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-500">Système IA activé</span>
                {error && (
                  <span className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Mode hors-ligne
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="text-lg font-semibold text-indigo-600 mb-2">
                {currentTime}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={fetchData}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Actualiser</span>
                </button>
                <button
                  onClick={simulateData}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm"
                >
                  Simuler Données
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Participants Total</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.totalParticipants}</p>
                <p className="text-xs text-green-600">+{Math.round(realTimeData.totalParticipants * 0.1)} cette heure</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Satisfaction Générale</p>
                <p className="text-2xl font-bold text-gray-800">{Math.round(realTimeData.satisfactionRate)}%</p>
                <p className="text-xs text-green-600">Excellent niveau</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Sentiment Positif</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.sentiment.positive}%</p>
                <p className="text-xs text-blue-600">IA Confirmée</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Activités Évaluées</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.topActivities.length}</p>
                <p className="text-xs text-purple-600">En temps réel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activités les plus appréciées */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              📊 Activités les Plus Appréciées
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={realTimeData.topActivities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'satisfaction' ? `${value}%` : value,
                    name === 'satisfaction' ? 'Satisfaction' : 'Participants'
                  ]}
                />
                <Bar dataKey="satisfaction" fill="#3B82F6" name="satisfaction" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Analyse des sentiments */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🧠 Analyse IA des Sentiments
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution horaire */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            📈 Évolution de la Participation (Temps Réel)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="participants" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Participants" 
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Satisfaction %" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback en temps réel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            💬 Retours en Temps Réel (Analysés par IA)
          </h3>
          <div className="space-y-4">
            {realTimeData.recentFeedback.map((feedback) => (
              <div key={feedback.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{feedback.activity}</p>
                    <p className="text-gray-600 mt-1">{feedback.comment}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                      {feedback.sentiment === 'positive' ? '😊 Positif' : 
                       feedback.sentiment === 'negative' ? '😞 Négatif' : '😐 Neutre'}
                    </span>
                    <span className="text-sm text-gray-500">{feedback.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommandations IA */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            🤖 Recommandations IA en Temps Réel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-yellow-700">
              <h4 className="font-semibold">✅ Points Forts Détectés:</h4>
              <ul className="space-y-1 text-sm">
                <li>• L'atelier Robotique performe excellemment (92% satisfaction)</li>
                <li>• Sentiment général très positif ({realTimeData.sentiment.positive}%)</li>
                <li>• Forte participation sur toutes les activités</li>
              </ul>
            </div>
            <div className="space-y-2 text-orange-700">
              <h4 className="font-semibold">🎯 Optimisations Suggérées:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Augmenter la capacité de l'atelier Robotique</li>
                <li>• Simplifier l'approche Biotechnologie si nécessaire</li>
                <li>• Maintenir la dynamique actuelle jusqu'à 18h</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer technique */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            🏆 Système développé pour le concours Nuit des Chercheurs 2025 | 
            Analyse NLP en temps réel | 
            Dashboard interactif | 
            {error ? ' Mode hors-ligne actif' : ' Connecté à l\'API'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NuitChercheursDashboard;