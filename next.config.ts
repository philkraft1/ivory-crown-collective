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
  "img-src 'self' data: https://*.stripe.com https://*.google-analytics.com https://*.googletagmanager.com https://*.google.com https://*.googleadservices.com https://*.g.doubleclick.net https://*.googlesyndication.com https://*.gstatic.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com",
  // Stripe Checkout + Cloudflare Turnstile + Google Analytics + AdSense
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://challenges.cloudflare.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://www.google.com https://fundingchoicesmessages.google.com https://securepubads.g.doubleclick.net",
  isProd
    ? "script-src 'self' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://partner.googleadservices.com https://www.google.com https://securepubads.g.doubleclick.net https://fundingchoicesmessages.google.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://partner.googleadservices.com https://www.google.com https://securepubads.g.doubleclick.net https://fundingchoicesmessages.google.com",
  isProd
    ? "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com https://*.googleadservices.com https://*.g.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://csi.gstatic.com https://fundingchoicesmessages.google.com"
    : "connect-src 'self' https://api.stripe.com https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com https://*.googleadservices.com https://*.g.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://csi.gstatic.com https://fundingchoicesmessages.google.com ws: wss:",
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

// Live-game overlays (public/overlay/*) are loaded as a browser source by
// TikTok LIVE Studio / OBS. The site-wide frame-ancestors 'none' + DENY
// headers block that embed, so overlays get their own permissive framing
// policy while every other route keeps the strict one.
const overlayCsp = cspDirectives
  .map((d) => (d.startsWith("frame-ancestors") ? "frame-ancestors *" : d))
  .join("; ")
  .concat(";");
const overlayHeaders = [
  { key: "Content-Security-Policy", value: overlayCsp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  // Do not 308 www → apex. Apex DNS currently points at GoDaddy forwarding
  // (3.33.251.168 / 15.197.225.128), which 301s back to www. That loop meant
  // Google's tag detector never saw HTML — only "Redirecting...".
  // www is the Vercel hostname and must serve the site.
  async headers() {
    return [
      {
        source: "/overlay/:path*",
        headers: overlayHeaders,
      },
      {
        source: "/:path((?!overlay/).*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
