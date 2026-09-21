import path from "node:path";
import type { NextConfig } from "next";

// The browser only ever talks to this origin. /api/* is proxied to the .NET backend, so the API needs
// no CORS, auth cookies are first-party + SameSite=Strict, and the backend is never exposed to the client.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5080";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Monorepo root (pnpm workspace). Explicit because a nested .git in apps/web makes Next guess the wrong root.
  turbopack: { root: path.resolve(__dirname, "../..") },
  reactStrictMode: true,
  poweredByHeader: false,
  // Never ship source maps to browsers: they would expose original source, comments and internal structure.
  productionBrowserSourceMaps: false,
  transpilePackages: ["@bfa/shared"],
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  async redirects() {
    // Old routes from before the "Serviços" hub existed.
    return [
      { source: "/transfers", destination: "/services/transfers", permanent: false },
      { source: "/payments", destination: "/services", permanent: false },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Financial data must never sit in a shared/browser cache.
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
