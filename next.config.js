/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  serverExternalPackages: ['firebase', '@firebase/auth', '@firebase/firestore'],
  
  // Image optimization for movie posters
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
    minimumCacheTTL: 86400, // 24 hours
  },
  
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for domain branding
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/.well-known/llms.txt',
        destination: '/api/ai/llms',
        permanent: true,
      },
      {
        source: '/.well-known/ai-plugin.json',
        destination: '/api/ai/plugin',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
