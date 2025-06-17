import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver le mode strict temporairement pour éviter l'hydratation
  reactStrictMode: false,
  
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
  
  // Configuration des images
  images: {
    domains: ['vercel.app', 'localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimisations pour Vercel
  swcMinify: true,
  poweredByHeader: false,
  
  // Configuration TypeScript - plus permissive pour le build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint - plus permissive pour le build
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;