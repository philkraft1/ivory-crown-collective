import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItPlans } from "@/components/ItPlans";
import { PageShell } from "@/components/PageShell";
import { Pay } from "@/components/Pay";
import { FEATURED_PROJECT, SERVICES } from "@/lib/site";
import { formatUsd, getOffering } from "@/lib/payments";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

function getService(slug: string) {
  return SERVICES.find((service) => service.id === slug);
}

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.lede,
    alternates: { canonical: service.href },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const isIt = service.id === "it-solutions";
  const offering = isIt ? undefined : getOffering(service.offeringId);

  return (
    <PageShell wide={isIt}>
      <Link href="/" className="text-sm text-pearl/55 transition-colors hover:text-gold-bright">
        Home
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
        {service.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-pearl/70">{service.lede}</p>

      {isIt ? (
        <div className="mt-12">
          <ItPlans />
        </div>
      ) : (
        <ul className="mt-10 space-y-3">
          {service.points.map((point) => (
            <li key={point} className="flex gap-3 text-base leading-relaxed text-pearl/75">
              <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {service.id === "web-design" && (
        <p className="mt-10 text-sm leading-relaxed text-pearl/60">
          Recent:{" "}
          <a
            href={FEATURED_PROJECT.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-bright underline decoration-gold/40 underline-offset-4 hover:text-gold-hot"
          >
            {FEATURED_PROJECT.title}
          </a>
          <span className="text-pearl/45"> · {FEATURED_PROJECT.meta}</span>
        </p>
      )}

      {!isIt && (
        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
            Begin with a deposit
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-pearl/65">
            {offering
              ? `${formatUsd(offering.amountCents)} holds your place and is applied to the project.`
              : "The deposit holds your place and is applied to the project."}{" "}
            <Link
              href={`/contact?interest=${encodeURIComponent(service.interest)}`}
              className="text-gold-bright underline decoration-gold/40 underline-offset-4 hover:text-gold-hot"
            >
              Prefer to talk first?
            </Link>
          </p>
          <div className="mt-8">
            <Pay offeringIds={[service.offeringId]} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
