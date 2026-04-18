import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/session/**": ["./docs/**"],
  },
};

export default nextConfig;
