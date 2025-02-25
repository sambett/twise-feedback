/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // This allows production builds to complete even with ESLint errors
      ignoreDuringBuilds: true,
    },
    images: {
      domains: ['api.qrserver.com'],
    },
    async rewrites() {
      return [
        {
          source: '/api/analyze',
          destination: '/api/analyze.py',
        },
      ];
    },
  };
  
  export default nextConfig;