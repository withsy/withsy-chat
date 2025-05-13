import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NODEJS_HELPERS: "0",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
  cleanDistDir: true,
  experimental: {
    nodeMiddleware: true,
  },
};

export default nextConfig;
