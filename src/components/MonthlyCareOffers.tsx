"use client";

import { CheckoutPanel, CheckoutTurnstile, useCheckoutActions } from "@/components/CheckoutPanel";
import { CARE_PACKAGES } from "@/lib/care";
import { formatUsd, getOffering } from "@/lib/payments";
import { SITE } from "@/lib/site";

export function MonthlyCareOffers() {
  return (
    <CheckoutPanel action="monthly-care">
      <CareOffers />
    </CheckoutPanel>
  );
}

function CareOffers() {
  const { canPay, loadingId, error, start } = useCheckoutActions();

  return (
    <div>
      <div className="space-y-3">
        <p className="text-xs tracking-[0.2em] text-pearl/45 uppercase">
          {canPay ? "Verified — pay for one month" : "Complete the check below to enable payment"}
        </p>
        <CheckoutTurnstile />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {CARE_PACKAGES.map((pack) => {
          const offering = getOffering(pack.offeringId);
          if (!offering) return null;
          const paying = loadingId === offering.id;

          return (
            <article key={pack.offeringId} className="flex flex-col border border-gold/20 px-6 py-7">
              <p className="text-xs tracking-[0.22em] text-gold-bright uppercase">{pack.eyebrow}</p>
              <h3 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                {offering.title.replace(" — one month", "")}
              </h3>
              <p className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl text-gold-hot">
                {formatUsd(offering.amountCents)}
              </p>
              <p className="mt-1 text-xs tracking-[0.14em] text-pearl/45 uppercase">{pack.delivery}</p>
              <p className="mt-4 text-sm leading-relaxed text-pearl/70">{pack.summary}</p>

              <h4 className="mt-6 text-xs tracking-[0.2em] text-gold uppercase">Included</h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-pearl/70">
                {pack.included.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:top-[0.55em] before:left-0 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-gold-hot"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 text-xs tracking-[0.2em] text-gold uppercase">A month might look like</h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-pearl/70">
                {pack.looksLike.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:top-[0.55em] before:left-0 before:h-1.5 before:w-1.5 before:rotate-45 before:bg-gold"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm leading-relaxed text-pearl/50">{pack.rush}</p>

              <button
                type="button"
                disabled={!canPay || paying}
                onClick={() => start(offering.id)}
                className="group relative mt-6 inline-flex items-center justify-center overflow-hidden px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.22em] text-ink uppercase disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="relative">
                  {paying ? "Redirecting…" : `Pay ${formatUsd(offering.amountCents)}`}
                </span>
              </button>
            </article>
          );
        })}
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
    </div>
  );
}
