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
      {
        source: '/demo',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
  
  // Configuration des images pour Vercel
  images: {
    domains: ['vercel.app', 'localhost', 'firebase.app', 'web.app'],
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