import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos as base64 can be several MB
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
