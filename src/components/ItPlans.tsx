"use client";

import Link from "next/link";
import { CheckoutPanel, CheckoutTurnstile, useCheckoutActions } from "@/components/CheckoutPanel";
import { IT_PACKAGES, IT_ROWS } from "@/lib/it";
import { formatUsd, getOffering } from "@/lib/payments";
import { SITE } from "@/lib/site";

export function ItPlans() {
  return (
    <CheckoutPanel action="it-solutions">
      <ItPlanTable />
    </CheckoutPanel>
  );
}

function ItPlanTable() {
  const { canPay, loadingId, error, start } = useCheckoutActions();
  const packages = IT_PACKAGES.map((pack) => ({
    ...pack,
    offering: getOffering(pack.offeringId),
  }));

  return (
    <div>
      <div className="space-y-3">
        <p className="text-sm text-pearl/60">
          {canPay
            ? "Choose a package to pay. The price is the full engagement."
            : "Complete the check below to enable payment."}
        </p>
        <CheckoutTurnstile />
      </div>

      <p className="mt-8 text-sm text-pearl/45 sm:hidden">Swipe sideways to compare the packages.</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            IT Solutions packages: Basic, Pro, and Max
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-36 bg-void py-4 pr-4 align-bottom text-xs font-medium text-pearl/45"
              >
                <span className="sr-only">Compare</span>
              </th>
              {packages.map((pack) => (
                <th
                  key={pack.offeringId}
                  scope="col"
                  className={`min-w-40 px-4 py-4 align-bottom ${
                    pack.featured ? "bg-white/[0.04]" : ""
                  }`}
                >
                  <p className={`text-xs ${pack.featured ? "text-gold" : "invisible"}`} aria-hidden={!pack.featured}>
                    Usual choice
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                    {pack.name}
                  </p>
                  <p className="mt-1 text-sm font-normal text-pearl/60">{pack.audience}</p>
                  <p className="mt-2 text-sm font-normal leading-relaxed text-pearl/65">{pack.summary}</p>
                  <p className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl text-gold-hot">
                    {pack.offering ? formatUsd(pack.offering.amountCents) : ""}
                  </p>
                  <button
                    type="button"
                    disabled={!canPay || !pack.offering || loadingId === pack.offeringId}
                    onClick={() => start(pack.offeringId)}
                    className="group relative mt-4 inline-flex w-full items-center justify-center overflow-hidden rounded-md px-4 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.14em] text-ink uppercase disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="relative">
                      {loadingId === pack.offeringId
                        ? "Redirecting…"
                        : `Pay ${pack.offering ? formatUsd(pack.offering.amountCents) : pack.name}`}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IT_ROWS.map((row) => (
              <tr key={row.label} className="border-t border-white/10">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-void py-4 pr-4 text-left text-sm font-medium text-pearl/70"
                >
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${packages[index]?.offeringId}`}
                    className={`px-4 py-4 align-top leading-relaxed text-pearl/80 ${
                      packages[index]?.featured ? "bg-white/[0.04]" : ""
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-pearl/55">
        Work past the package is $95 an hour, confirmed with you before it is billed. New websites,
        custom software, and equipment purchases are separate.{" "}
        <Link
          href="/contact?interest=IT%20Solutions"
          className="text-gold-bright underline decoration-gold/40 underline-offset-4 hover:text-gold-hot"
        >
          Prefer to talk first?
        </Link>
      </p>
      <p className="mt-4 text-xs tracking-[0.12em] text-pearl/40 uppercase">
        Powered by Stripe · Secure checkout
      </p>
    </div>
  );
}
