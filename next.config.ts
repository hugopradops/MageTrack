import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { hostname: 'cdn.cloudflare.steamstatic.com' },
      { hostname: 'store.steampowered.com' },
    ],
  },
};

export default nextConfig;
