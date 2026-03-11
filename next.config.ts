import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 を Next.js で有効化するための設定
  experimental: {
    optimizePackageImports: ["tailwindcss"],
  },
};

export default nextConfig;