import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/calculators/:calc',
        destination: '/?region=US&calc=:calc#tools',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
