import { NextResponse, type NextRequest } from "next/server";
import { isAllowedBrowserOrigin } from "@/lib/security/origin";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { getConfiguredSiteOrigin, isProduction } from "@/lib/security/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Stripe webhooks authenticate via signature — skip browser Origin checks.
  if (pathname === "/api/stripe/webhook") {
    return NextResponse.next();
  }

  if (request.method !== "POST") {
    return NextResponse.next();
  }

  if (pathname !== "/api/contact" && pathname !== "/api/checkout") {
    return NextResponse.next();
  }

  if (isProduction() && !getConfiguredSiteOrigin()) {
    return NextResponse.json(
      { error: "Service temporarily unavailable." },
      { status: 503 },
    );
  }

  if (!isAllowedBrowserOrigin(request)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const kind = pathname === "/api/contact" ? "contact" : "checkout";
  const limited = await enforceRateLimit(kind, request);

  if (!limited.ok) {
    const headers = new Headers();
    if (limited.retryAfter) {
      headers.set("Retry-After", String(limited.retryAfter));
    }
    return NextResponse.json(
      { error: limited.error },
      { status: limited.status, headers },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
