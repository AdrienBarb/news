import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling jsdom to avoid ESM/CommonJS compatibility issues
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;
