import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/",
        headers: [{ key: "Vary", value: "Accept" }],
      },
      {
        source: "/((?!api|mcp|.well-known|_next).*)",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ];
  },
};

export default createMDX()(config);
