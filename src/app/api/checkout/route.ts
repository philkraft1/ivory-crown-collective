import { NextResponse } from "next/server";
import { getOffering, randomIntegrationSuffix } from "@/lib/payments";
import { checkoutIdempotencyKey } from "@/lib/security/idempotency";
import { clientIp } from "@/lib/security/rate-limit";
import {
  checkoutBodySchema,
  isAllowedStripeCheckoutUrl,
} from "@/lib/security/schemas";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { SITE } from "@/lib/site";
import { getSiteUrl, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutBodySchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(
    parsed.data.turnstileToken,
    clientIp(request),
  );
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 });
  }

  const offering = getOffering(parsed.data.offeringId);
  if (!offering) {
    return NextResponse.json({ error: "Unknown payment option." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Contact us directly to pay." },
      { status: 503 },
    );
  }

  let origin: string;
  try {
    origin = getSiteUrl(request);
  } catch {
    return NextResponse.json(
      { error: "Payments are not configured yet. Contact us directly to pay." },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: offering.amountCents,
              product_data: {
                name: offering.title,
                description: offering.description,
                metadata: {
                  offeringId: offering.id,
                  serviceId: offering.serviceId,
                },
              },
            },
          },
        ],
        success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pay/cancel`,
        customer_email: parsed.data.email,
        billing_address_collection: "auto",
        allow_promotion_codes: true,
        metadata: {
          offeringId: offering.id,
          serviceId: offering.serviceId,
          founder: `${SITE.founder.name}, ${SITE.founder.title}`,
        },
        integration_identifier: `icc-${offering.serviceId}-${randomIntegrationSuffix()}`,
      },
      {
        idempotencyKey: checkoutIdempotencyKey(offering.id, request),
      },
    );

    if (!session.url || !isAllowedStripeCheckoutUrl(session.url)) {
      return NextResponse.json({ error: "Could not start Checkout." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to start payment right now." }, { status: 502 });
  }
}
