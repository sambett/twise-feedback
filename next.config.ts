import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // NO static export for Vercel - this was causing the main issue
  // Remove: output: 'export' - this breaks Vercel's server-side features
  
  // Headers CORS for API
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
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
  
  // Images configuration for Vercel
  images: {
    domains: ['vercel.app', 'localhost', 'firebase.app', 'web.app', 'api.qrserver.com'],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Remove deprecated swcMinify - it's enabled by default in Next.js 15
  poweredByHeader: false,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Updated external packages configuration (fixed deprecated option)
  serverExternalPackages: ['firebase-admin'],
};

export default nextConfig;