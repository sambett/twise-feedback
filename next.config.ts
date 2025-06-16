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
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: true,
      },
    ]
  },
  
  // Configuration des images (si nécessaire)
  images: {
    domains: ['vercel.app', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimisations pour Vercel
  swcMinify: true,
  poweredByHeader: false,
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;