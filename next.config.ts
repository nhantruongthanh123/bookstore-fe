import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'book-shop.duckdns.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
