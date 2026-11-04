import Link from "next/link";
import { MonthlyCareOffers } from "@/components/MonthlyCareOffers";
import { PageShell } from "@/components/PageShell";
import { CARE_ADDONS } from "@/lib/care";
import { CARE_DOOR } from "@/lib/site";

export function MonthlyCare() {
  return (
    <PageShell wide>
      <Link href="/" className="text-sm text-pearl/55 transition-colors hover:text-gold-bright">
        Home
      </Link>
      <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
        A month of care for a site you already have.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pearl/70">{CARE_DOOR.lede}</p>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-pearl/60">
        Each payment is one month. The next month starts when you pay again. A new website, a new
        store, or a site that is fully down is its own project.
      </p>

      <div className="mt-12">
        <MonthlyCareOffers />
      </div>

      <div className="mt-16 max-w-3xl">
        <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
          Add what the month still needs
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-pearl/60">
          The button charges the month you picked. Add-ons are confirmed before any extra charge.
          Stripe also asks for the site link and this month’s list.
        </p>
        <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {CARE_ADDONS.map((addon) => (
            <li
              key={addon.name}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
            >
              <span>
                <span className="font-[family-name:var(--font-cinzel)] text-pearl">{addon.name}</span>
                <span className="mt-1 block text-sm text-pearl/55 sm:mt-0 sm:ml-3 sm:inline">
                  {addon.detail}
                </span>
              </span>
              <span className="font-[family-name:var(--font-cinzel)] text-gold-hot">{addon.price}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-pearl/60">
          One page means an update to a page you already have, or one simple new page from text and
          images you send. Another page is the $75 add-on. Extra hours are $95.
        </p>
      </div>
    </PageShell>
  );
}
