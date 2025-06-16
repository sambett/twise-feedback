import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver le mode strict temporairement pour éviter l'hydratation
  reactStrictMode: false,
  
  // Configuration pour éviter les erreurs d'hydratation
  experimental: {
    // @ts-ignore - Cette option peut ne pas être dans les types officiels
    suppressHydrationWarning: true,
  },
  
  // Headers CORS pour l'API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
};

export default nextConfig;