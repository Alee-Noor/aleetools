import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Trailing slashes off per SEO requirement
  trailingSlash: false,
};

export default nextConfig;
