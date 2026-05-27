import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Standalone: genera un paquete mínimo para deploy (~50MB vs ~500MB) ───
  output: "standalone",

  // ─── Imágenes desde Azure Blob Storage ────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",  // Azure Blob Storage
        pathname: "/**",
      },
    ],
  },

  // ─── Headers de seguridad ─────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY"    },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
