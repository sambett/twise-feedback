/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // This allows production builds to complete even with ESLint errors
      ignoreDuringBuilds: true,
    },
    images: {
      domains: ['api.qrserver.com'],
    },
  };
  
  export default nextConfig;