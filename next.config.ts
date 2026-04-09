import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This wildcard allows all hostnames
      },
      {
        protocol: 'http',
        hostname: '**', // Optional: allows insecure images too
      },
    ],
  },
};

export default nextConfig;
