import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Recursos externos realmente usados hoje: reCAPTCHA Enterprise (script + iframe),
// Google Fonts, mapa incorporado do Google, vídeos do YouTube (nocookie) e Supabase
// (API + Storage, chamado direto do browser pelo client-side do Supabase Auth/Admin).
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' é necessário para os scripts de hidratação do Next.js (App Router);
  // 'unsafe-eval' só em dev, para o Fast Refresh do Turbopack.
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://www.google.com https://www.gstatic.com",
  "frame-src https://www.google.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
