"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main admin dashboard
    router.push('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900 p-4 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-4">
          🚀 Universal Feedback Platform
        </h1>
        <p className="text-gray-300 mb-4">Real-time feedback and sentiment analysis</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-sm text-gray-400 mt-4">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
};

export default HomePage;