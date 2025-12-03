import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize jsdom to prevent ESM/CommonJS bundling issues
  // jsdom is pulled in by @mozilla/readability but we use linkedom instead
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize jsdom on the server side to prevent bundling
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          jsdom: "commonjs jsdom",
          "jsdom/lib/jsdom": "commonjs jsdom/lib/jsdom",
        });
      } else {
        const existingExternals = config.externals;
        config.externals = [
          existingExternals,
          {
            jsdom: "commonjs jsdom",
            "jsdom/lib/jsdom": "commonjs jsdom/lib/jsdom",
          },
        ];
      }
    }
    return config;
  },
  // Use serverExternalPackages to exclude jsdom from server bundles
  // This prevents Next.js from trying to bundle jsdom, which causes ESM/CommonJS conflicts
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;
