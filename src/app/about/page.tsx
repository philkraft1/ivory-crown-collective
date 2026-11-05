import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { formatUsd, getOffering } from "@/lib/payments";
import { CARE_DOOR, SERVICES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Philip S. Kraft started Ivory Crown Collective because web design and cybersecurity are the work he cares about.",
  alternates: { canonical: "/about" },
};

const offers = [
  ...SERVICES.map((service) => ({
    href: service.href,
    title: service.title,
    line: service.lede,
  })),
  {
    href: CARE_DOOR.href,
    title: CARE_DOOR.title,
    line: CARE_DOOR.lede,
  },
];

export default function AboutPage() {
  const consult = getOffering("consult-retainer");

  return (
    <PageShell>
      <p className="text-sm text-gold">About</p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
        Web design and cybersecurity are why this exists.
      </h1>
      <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-pearl/70">
        <p>
          I&apos;m {SITE.founder.name}. I started {SITE.name} because web design and cybersecurity
          are the work I care about. A site should make the next step obvious, and the systems
          behind a business should be ones you can understand and trust.
        </p>
        <p>
          The business builds websites, custom software, and the IT that keeps a small operation
          running. Each job is sized to the work in front of you, then written down so the next
          person can follow it.
        </p>
      </div>

      <h2 className="mt-14 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
        What I offer
      </h2>
      <ul className="mt-6 divide-y divide-white/10 border-y border-white/10">
        {offers.map((offer) => (
          <li key={offer.href} className="py-5">
            <Link
              href={offer.href}
              className="font-[family-name:var(--font-cinzel)] text-xl text-pearl transition-colors hover:text-gold-bright"
            >
              {offer.title}
            </Link>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-pearl/65">
              {offer.line}
              {offer.href === "/services/it-solutions" &&
                " That includes who has access, how the tools connect, and a security pass when the whole operation needs one."}
            </p>
          </li>
        ))}
        <li className="py-5">
          <Link
            href="/book"
            className="font-[family-name:var(--font-cinzel)] text-xl text-pearl transition-colors hover:text-gold-bright"
          >
            {consult?.title ?? "Strategy Consult"}
          </Link>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-pearl/65">
            A paid conversation before a larger project.
            {consult
              ? ` The ${formatUsd(consult.amountCents)} is credited toward the work if you proceed.`
              : " It is credited toward the work if you proceed."}
          </p>
        </li>
      </ul>
    </PageShell>
  );
}
