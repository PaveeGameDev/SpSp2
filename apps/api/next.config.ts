import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sponsor/db", "@sponsor/shared"],
};

export default nextConfig;
