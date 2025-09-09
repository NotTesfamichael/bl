import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; object-src 'none'; base-uri 'self';"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
