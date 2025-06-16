"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Nuit des Chercheurs dashboard
    router.push('/nuit-chercheurs');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900 p-4 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-4">
          🔬 Nuit des Chercheurs 2025
        </h1>
        <p className="text-gray-300 mb-4">Dashboard IA - Analyse des sentiments en temps réel</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-sm text-gray-400 mt-4">
          Redirection vers le tableau de bord...
        </p>
      </div>
    </div>
  );
};

export default HomePage;