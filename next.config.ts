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
   async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "quizzy.it.com" }], // non-www
        destination: "https://www.quizzy.it.com/:path*",  //  www
        permanent: true, // 301 redirect
      },
    ];
  },
};

export default nextConfig;
