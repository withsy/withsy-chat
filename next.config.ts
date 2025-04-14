import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    NODEJS_HELPERS: "0",
  },
};

export default nextConfig;
