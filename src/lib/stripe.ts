import Stripe from "stripe";
import { getConfiguredSiteOrigin, isProduction } from "@/lib/security/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}

/**
 * Canonical site URL for Checkout success/cancel redirects.
 * Production never falls back to the request Host (closes open-redirect phishing).
 */
export function getSiteUrl(request?: Request): string {
  const configured = getConfiguredSiteOrigin();
  if (configured) return configured;

  if (isProduction()) {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL in production.");
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  if (request) {
    return new URL(request.url).origin;
  }

  return "http://localhost:3000";
}
