import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker, not for Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      // Allow CDN URLs if configured
      ...(process.env.AWS_S3_CDN_URL
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(process.env.AWS_S3_CDN_URL).hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
