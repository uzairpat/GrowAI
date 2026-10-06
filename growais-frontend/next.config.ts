import type { NextConfig } from "next";

const backendUrl =
  process.env.BACKEND_URL ||
  "https://growais-backend.onrender.com";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;