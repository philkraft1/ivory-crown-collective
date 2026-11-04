"use client";

import { CheckoutPanel, CheckoutTurnstile, useCheckoutActions } from "@/components/CheckoutPanel";
import { DEPOSIT_OFFERINGS, formatUsd, type PayOffering } from "@/lib/payments";
import { SITE } from "@/lib/site";

export function Pay({ offeringIds }: { offeringIds?: readonly string[] }) {
  const offerings = offeringIds
    ? DEPOSIT_OFFERINGS.filter((item) => offeringIds.includes(item.id))
    : DEPOSIT_OFFERINGS;

  return (
    <CheckoutPanel action="checkout">
      <PayOffers offerings={offerings} />
    </CheckoutPanel>
  );
}

function PayOffers({ offerings }: { offerings: PayOffering[] }) {
  const { canPay, loadingId, error, start } = useCheckoutActions();

  return (
    <div>
      <div className="space-y-3">
        <p className="text-sm text-pearl/60">
          {canPay ? "Choose a package to pay." : "Complete the check below to enable payment."}
        </p>
        <CheckoutTurnstile />
      </div>

      <div className={`mt-8 grid gap-4 ${offerings.length > 1 ? "md:grid-cols-2" : ""}`}>
        {offerings.map((offering) => (
          <article
            key={offering.id}
            className="flex flex-col rounded-lg border border-white/10 px-6 py-6"
          >
            <h3 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-pearl">
              {offering.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-pearl/65">{offering.description}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="font-[family-name:var(--font-cinzel)] text-xl text-gold-hot">
                {formatUsd(offering.amountCents)}
              </p>
              <button
                type="button"
                disabled={!canPay || loadingId === offering.id}
                onClick={() => start(offering.id)}
                className="group relative inline-flex min-w-[9.5rem] items-center justify-center overflow-hidden rounded-md px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.14em] text-ink uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="relative">
                  {loadingId === offering.id ? "Redirecting…" : "Pay now"}
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-300" role="alert">
          {error} Or reach {SITE.founder.name} at{" "}
          <a className="underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
      )}

      <p className="mt-6 text-xs tracking-[0.12em] text-pearl/40 uppercase">
        Powered by Stripe · Secure checkout
      </p>
    </div>
  );
}
