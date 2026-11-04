import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Pay } from "@/components/Pay";
import { CARE_DOOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book",
  description: "Pay a project deposit with Stripe and hold your place with Ivory Crown Collective.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <PageShell wide>
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,26rem)] lg:gap-16">
        <div>
          <p className="text-sm text-gold">Book</p>
          <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
            Start with a deposit.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-pearl/70">
            Pick the work, then pay on Stripe. The amount is applied to the project.{" "}
            <Link
              href="/services/it-solutions"
              className="text-gold-bright underline decoration-gold/40 underline-offset-4 hover:text-gold-hot"
            >
              IT packages
            </Link>{" "}
            are priced on their own page.
          </p>
        </div>
        <div className="rounded-lg border border-gold/30 bg-white/[0.03] px-6 py-8 sm:px-8">
          <p className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold leading-snug text-pearl sm:text-3xl">
            Already have a site and looking for monthly maintenance?
          </p>
          <Link
            href={CARE_DOOR.href}
            className="group relative mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-md px-6 py-4 text-center font-[family-name:var(--font-cinzel)] text-sm font-semibold tracking-[0.12em] text-ink uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="relative">Click here to learn more</span>
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <Pay />
      </div>
    </PageShell>
  );
}
