import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker, not for Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
