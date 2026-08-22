import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy. Next.js injects inline bootstrap scripts/styles and
// Tailwind emits inline styles, so 'unsafe-inline' is required for those.
// Development additionally needs 'unsafe-eval' and websocket connections for
// hot module replacement, so those are only relaxed outside production.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Stripe Checkout + Cloudflare Turnstile + Google Analytics (gtag.js)
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://challenges.cloudflare.com",
  isProd
    ? "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com",
  isProd
    ? "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com"
    : "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com ws: wss:",
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
];

const contentSecurityPolicy = cspDirectives.join("; ").concat(";");

const reportingEndpoints = { group: "csp-endpoint", max_age: 86400, endpoints: [{ url: "/api/csp-report" }] };

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Twin report-only policy for visibility without breaking the page.
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/csp-report"',
  },
  {
    key: "Report-To",
    value: JSON.stringify(reportingEndpoints),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "browsing-topics=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
      "midi=()",
      "interest-cohort=()",
      "accelerometer=()",
      "gyroscope=()",
      "magnetometer=()",
      "display-capture=()",
    ].join(", "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Keep a single canonical origin so CSRF Origin checks and Stripe
      // success URLs stay aligned with NEXT_PUBLIC_SITE_URL.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ivorycrowncollective.com" }],
        destination: "https://ivorycrowncollective.com/:path*",
        permanent: true,
      },
    ];
  },
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
