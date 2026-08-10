import { createHash } from "node:crypto";
import { clientIp } from "@/lib/security/rate-limit";

const BUCKET_MS = 2 * 60 * 1000;

/** Stable Stripe idempotency key: offering + IP + 2-minute bucket. */
export function checkoutIdempotencyKey(
  offeringId: string,
  request: Request,
): string {
  const ip = clientIp(request);
  const bucket = Math.floor(Date.now() / BUCKET_MS);
  const digest = createHash("sha256")
    .update(`${offeringId}|${ip}|${bucket}`)
    .digest("hex")
    .slice(0, 32);
  return `icc-checkout-${digest}`;
}
