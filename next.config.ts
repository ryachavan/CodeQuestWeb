import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_DEV_SERVER_START_TIME: Date.now().toString(),
  },
};

export default nextConfig;
