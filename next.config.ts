import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for transformers
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
      };
    }
    
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'onnxruntime-node': 'onnxruntime-node',
        'sharp': 'sharp'
      });
    }
    
    return config;
  },
  
  // External packages (Next.js 15 syntax)
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node', 'sharp'],
  
  // CORS headers
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
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      { source: '/', destination: '/admin', permanent: false },
      { source: '/dashboard', destination: '/admin', permanent: true },
      { source: '/demo', destination: '/admin', permanent: false },
    ];
  },
  
  // Images
  images: {
    domains: ['vercel.app', 'localhost', 'firebase.app', 'web.app', 'api.qrserver.com'],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;