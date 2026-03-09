import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'cdn.cloudflare.steamstatic.com' },
      { hostname: 'img.opencritic.com' },
      { hostname: 'c.opencritic.com' },
      { hostname: 'store.steampowered.com' },
    ],
  },
};

export default nextConfig;
