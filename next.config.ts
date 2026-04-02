import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Images from PokeAPI sprites are loaded from an external domain
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
    ],
  },
};

export default nextConfig;
