import Image from "next/image";
import { MonthlyCareOffers } from "@/components/MonthlyCareOffers";
import { CARE_ADDONS, CARE_IMAGES } from "@/lib/care";

export function MonthlyCare() {
  return (
    <section
      id="monthly-care"
      className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(232,185,35,0.1)_0%,transparent_42%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          Monthly care
        </p>
        <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
          A month of care for a site you already have.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-pearl/55">
          Updates, bug fixes, and steady support, sized in three packages. Each payment is one
          month. You send the site link, a way in, and a short list. The next month starts when
          you pay again.
        </p>

        <figure className="mt-10 overflow-hidden border border-gold/20">
          <Image
            src={CARE_IMAGES.hero.src}
            alt={CARE_IMAGES.hero.alt}
            width={CARE_IMAGES.hero.width}
            height={CARE_IMAGES.hero.height}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="h-auto w-full"
          />
        </figure>

        <figure className="mt-6 overflow-hidden border border-gold/20">
          <Image
            src={CARE_IMAGES.packages.src}
            alt={CARE_IMAGES.packages.alt}
            width={CARE_IMAGES.packages.width}
            height={CARE_IMAGES.packages.height}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="h-auto w-full"
          />
        </figure>

        <div className="mt-12">
          <MonthlyCareOffers />
        </div>

        <div className="mt-16 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <figure className="overflow-hidden border border-gold/20">
            <Image
              src={CARE_IMAGES.month.src}
              alt={CARE_IMAGES.month.alt}
              width={CARE_IMAGES.month.width}
              height={CARE_IMAGES.month.height}
              sizes="(max-width: 1024px) 100vw, 640px"
              className="h-auto w-full"
            />
          </figure>
          <div>
            <h3 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl sm:text-3xl">
              What one page means
            </h3>
            <p className="mt-4 text-base leading-relaxed text-pearl/55">
              One page is an update to a page you already have, or one simple new page built from
              text and images you send. Another page is a $75 add-on.
            </p>
            <p className="mt-4 text-base leading-relaxed text-pearl/55">
              A new website, a new store, product uploads, and payment setup are their own
              projects. A hacked site, or a site that is fully down, starts with a look and is
              billed in extra hours at $95.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
            Add what the month still needs
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pearl/50">
            The button charges the month you picked. Add-ons are confirmed with you before any
            extra charge. Stripe Checkout also asks for the site link and this month’s list.
          </p>
          <ul className="mt-6 divide-y divide-gold/15 border-y border-gold/15">
            {CARE_ADDONS.map((addon) => (
              <li
                key={addon.name}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
              >
                <span>
                  <span className="font-[family-name:var(--font-cinzel)] text-pearl">
                    {addon.name}
                  </span>
                  <span className="mt-1 block text-sm text-pearl/50 sm:mt-0 sm:ml-3 sm:inline">
                    {addon.detail}
                  </span>
                </span>
                <span className="font-[family-name:var(--font-cinzel)] text-gold-hot">
                  {addon.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
