import { NextResponse } from "next/server";
import { clientIp, enforceRateLimit } from "@/lib/security/rate-limit";

const MAX_BODY_BYTES = 8_192;

/**
 * Receives browser CSP violation reports. Logs a redacted summary only —
 * never persists full bodies (may contain URLs with tokens).
 */
export async function POST(request: Request) {
  // Reuse checkout bucket as a coarse global API abuse limit for reporters.
  const limited = await enforceRateLimit("checkout", request);
  if (!limited.ok && limited.status === 429) {
    return new NextResponse(null, {
      status: 429,
      headers: limited.retryAfter
        ? { "Retry-After": String(limited.retryAfter) }
        : undefined,
    });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    let report: unknown;
    try {
      report = JSON.parse(raw);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const body = report as {
      "csp-report"?: Record<string, unknown>;
      type?: string;
      body?: Record<string, unknown>;
    };

    const csp = body["csp-report"] || body.body || {};
    console.info("[csp-report]", {
      ip: clientIp(request),
      effectiveDirective:
        csp["effective-directive"] || csp.effectiveDirective || null,
      violatedDirective:
        csp["violated-directive"] || csp.violatedDirective || null,
      blockedUri: String(csp["blocked-uri"] || csp.blockedURL || "").slice(0, 200),
      documentUri: String(csp["document-uri"] || csp.documentURL || "").slice(
        0,
        200,
      ),
    });
  } catch {
    // Swallow — reporting must never break the page.
  }

  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return new NextResponse(null, { status: 204 });
}
