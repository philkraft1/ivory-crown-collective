import { NextResponse } from "next/server";
import { getOffering, randomIntegrationSuffix } from "@/lib/payments";
import { SITE } from "@/lib/site";
import { getSiteUrl, getStripe } from "@/lib/stripe";

type CheckoutBody = {
  offeringId?: string;
  email?: string;
};

export async function POST(request: Request) {
  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const offering = body.offeringId ? getOffering(body.offeringId) : undefined;
  if (!offering) {
    return NextResponse.json({ error: "Unknown payment option." }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Contact us directly to pay." },
      { status: 503 },
    );
  }

  const origin = getSiteUrl(request);
  const email = body.email?.trim();

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
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
      customer_email: email || undefined,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: {
        offeringId: offering.id,
        serviceId: offering.serviceId,
        founder: `${SITE.founder.name}, ${SITE.founder.title}`,
      },
      // Stripe API 2026-03-25+ tracking label
      integration_identifier: `icc-${offering.serviceId}-${randomIntegrationSuffix()}`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start Checkout." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to start payment right now." }, { status: 502 });
  }
}
