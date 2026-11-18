import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ncontvjtfhsabphxfuhb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/visualizer',
        destination: '/#tools',
        permanent: true,
      },
      {
        source: '/buy',
        destination: '/download#pricing',
        permanent: true,
      },
      {
        source: '/blog/virtual-wall-paint-color-visualizer-tool',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/calculators/:calc',
        destination: '/?region=US&calc=:calc#tools',
        permanent: true,
      },
      {
        source: '/winter-home-guide',
        destination: '/blog/winter-home-improvement-projects-cost-checklist',
        permanent: true,
      },
      {
        source: '/home-planning',
        destination: '/plans',
        permanent: true,
      },
      {
        source: '/home-planning-concept',
        destination: '/plans',
        permanent: true,
      },
      {
        source: '/concept',
        destination: '/plans',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=86400' },
        ],
      },
      {
        source: '/((?!api|_next|admin|dashboard|signin|signup).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), unload=*' },
        ],
      },
    ];
  },
};

export default nextConfig;

