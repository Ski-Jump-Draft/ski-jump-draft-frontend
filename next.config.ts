import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: isProd && !isStaging ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
