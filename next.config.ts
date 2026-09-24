import type { NextConfig } from "next";

const wpHost = new URL(process.env.WP_API_URL ?? "https://www.amicarehospital.in/wp-json/wp/v2").hostname;
// WP returns media URLs on the bare domain even when the API is on www.
const wpHosts = [...new Set([wpHost, wpHost.replace(/^www\./, ""), `www.${wpHost.replace(/^www\./, "")}`])];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...wpHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/wp-content/uploads/**",
      })),
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Google reviewer avatars (lh3…lh6.googleusercontent.com)
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Pin the workspace root (avoids picking up stray lockfiles in parent folders).
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
