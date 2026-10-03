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
        source: '/blog/virtual-wall-paint-color-visualizer-tool',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/calculators/:calc',
        destination: '/?region=US&calc=:calc#tools',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/home-planning',
        destination: '/concept/index.html',
      },
      {
        source: '/concept',
        destination: '/concept/index.html',
      },
      {
        source: '/home-planning-concept',
        destination: '/concept/index.html',
      },
      {
        source: '/styles.css',
        destination: '/concept/styles.css',
      },
      {
        source: '/script.js',
        destination: '/concept/script.js',
      },
      {
        source: '/vendor/:path*',
        destination: '/concept/vendor/:path*',
      },
      {
        source: '/assets/:path*',
        destination: '/concept/assets/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;

