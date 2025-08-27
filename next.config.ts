import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";
    return [
      {
        source: "/wp-api/:path*",
        destination: isDev
          ? "http://localhost:8080/pken-dev_vote/wp-json/:path*"
          : "https://liff-pken-vote-dev.vercel.app/wp-json/:path*", // ←本番WPのURL
      },
    ];
  },
};

export default nextConfig;
