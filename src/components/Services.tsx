import { SERVICES } from "@/lib/site";

export function Services() {
  return (
    <section id="services" className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          What we do
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
          Three practices. One standard.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-pearl/55">
          Design, entertainment, and IT — offered under one collective, with equal care for craft.
        </p>

        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0">
          {SERVICES.map((service, index) => (
            <article
              key={service.id}
              id={service.id}
              className={`md:px-8 ${index > 0 ? "md:border-l md:border-gold/15" : "md:pl-0"} ${index === 0 ? "md:pr-8" : ""}`}
            >
              <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-gold-bright uppercase">
                0{index + 1}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                {service.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-pearl/55">{service.blurb}</p>
              <a
                href={`#contact`}
                className="mt-6 inline-block text-xs tracking-[0.2em] text-gold uppercase transition-colors hover:text-gold-hot"
              >
                Inquire →
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
