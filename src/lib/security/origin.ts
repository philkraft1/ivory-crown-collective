import { getConfiguredSiteOrigin, isProduction } from "@/lib/security/env";

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Origins allowed to call browser-facing POST APIs. */
export function allowedOrigins(): string[] {
  const origins = new Set<string>();
  const configured = getConfiguredSiteOrigin();
  if (configured) {
    origins.add(configured);
    // Accept www even when canonical is apex (redirect should make this rare).
    try {
      const url = new URL(configured);
      if (url.hostname.startsWith("www.")) {
        origins.add(`${url.protocol}//${url.hostname.slice(4)}`);
      } else {
        origins.add(`${url.protocol}//www.${url.hostname}`);
      }
    } catch {
      /* ignore */
    }
  }

  if (!isProduction()) {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && !isProduction()) {
    origins.add(`https://${vercelUrl}`);
  }

  return [...origins];
}

/**
 * Returns true when the request appears to come from an allowed same-site origin.
 * Prefers Origin; falls back to Referer. Missing both → reject (except webhook path handled elsewhere).
 */
export function isAllowedBrowserOrigin(request: Request): boolean {
  const allowed = allowedOrigins();
  if (allowed.length === 0) return false;

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    const origin = normalizeOrigin(originHeader);
    return Boolean(origin && allowed.includes(origin));
  }

  const referer = request.headers.get("referer");
  if (referer) {
    const origin = normalizeOrigin(referer);
    return Boolean(origin && allowed.includes(origin));
  }

  return false;
}
