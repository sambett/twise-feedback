import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver le mode strict temporairement pour éviter l'hydratation
  reactStrictMode: false,
  
  // Configuration pour le déploiement statique (GitHub Pages)
  output: 'export',
  trailingSlash: true,
  
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
  
  // Configuration des images
  images: {
    domains: ['vercel.app', 'localhost', 'firebase.app', 'web.app', 'github.io'],
    formats: ['image/avif', 'image/webp'],
    unoptimized: true,
  },
  
  // Optimisations pour le déploiement
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