import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react"]
  }
};

export default nextConfig;
