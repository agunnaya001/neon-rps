import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "api.dicebear.com" },
      { hostname: "**" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
