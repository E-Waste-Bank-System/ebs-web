import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/ebs-storage/**',
      },
    ],
  },
  
  // Environment variables for different deployment environments
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  },
};

export default nextConfig;
