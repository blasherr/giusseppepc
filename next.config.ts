import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgg.fr",
      },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
