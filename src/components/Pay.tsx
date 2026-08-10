"use client";

import { useState } from "react";
import { formatUsd, PAY_OFFERINGS } from "@/lib/payments";
import { SITE } from "@/lib/site";

export function Pay() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(offeringId: string) {
    setLoadingId(offeringId);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeringId }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      let checkoutHost = "";
      try {
        checkoutHost = new URL(payload.url).hostname;
      } catch {
        throw new Error("Unable to start checkout.");
      }
      if (
        checkoutHost !== "checkout.stripe.com" &&
        !checkoutHost.endsWith(".stripe.com")
      ) {
        throw new Error("Unable to start checkout.");
      }

      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setLoadingId(null);
    }
  }

  return (
    <section id="pay" className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(232,185,35,0.1)_0%,transparent_45%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          Pay / book
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
          Secure deposits with Stripe.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-pearl/55">
          Lock in work with {SITE.founder.name}. You’ll check out on Stripe’s secure page — card and
          other local methods when available.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PAY_OFFERINGS.map((offering) => (
            <article
              key={offering.id}
              className="flex flex-col border border-gold/20 px-6 py-7 transition-colors hover:border-gold/40"
            >
              <p className="text-xs tracking-[0.22em] text-gold-bright uppercase">
                {offering.serviceId === "consult" ? "Consult" : offering.serviceId.replace("-", " ")}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                {offering.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-pearl/55">
                {offering.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="font-[family-name:var(--font-cinzel)] text-xl text-gold-hot">
                  {formatUsd(offering.amountCents)}
                </p>
                <button
                  type="button"
                  disabled={loadingId === offering.id}
                  onClick={() => startCheckout(offering.id)}
                  className="group relative inline-flex min-w-[9.5rem] items-center justify-center overflow-hidden px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.22em] text-ink uppercase disabled:opacity-70"
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

        <p className="mt-8 text-xs tracking-[0.16em] text-pearl/35 uppercase">
          Powered by Stripe · Test mode while the site is under construction
        </p>
      </div>
    </section>
  );
}
