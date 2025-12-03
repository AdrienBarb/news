import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize jsdom to prevent ESM/CommonJS bundling issues
  // jsdom is pulled in by @mozilla/readability but we use linkedom instead
  // serverExternalPackages works with both webpack and Turbopack (Next.js 16 uses Turbopack by default)
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;
