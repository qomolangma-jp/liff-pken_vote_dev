import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/wp-api/:path*",
        destination:
          "http://localhost:8080/pken-dev_vote/wp-json/:path*", // ←WPのURLに合わせて
      },
    ];
  },
};

export default nextConfig;
