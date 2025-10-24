import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // webpack(config, { dev }) {
  //   const env = process.env.NODE_ENV;
  //   const isProd = env === "production";
  //   const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";

  //   // wycisz logi tylko w produkcji (nie w staging/dev)
  //   if (isProd && !isStaging) {
  //     ["log", "warn", "error", "info", "debug"].forEach(
  //       (k) => ((console as any)[k] = () => { })
  //     );
  //   }

  //   return config;
  // },
};

export default nextConfig;
