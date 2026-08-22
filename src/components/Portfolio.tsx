import { FEATURED_PROJECT, PORTFOLIO } from "@/lib/site";

export function Portfolio() {
  return (
    <section id="about" className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.08)_0%,transparent_50%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          About
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
          Recent work.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-pearl/55">
          A look at what Ivory Crown Collective has been shipping — starting with the latest site build.
        </p>

        <a
          href={FEATURED_PROJECT.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-14 block border border-gold/20 bg-[linear-gradient(160deg,rgba(232,185,35,0.08)_0%,transparent_55%)] px-6 py-8 transition-colors hover:border-gold/45 sm:px-10 sm:py-12"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.22em] text-gold-bright uppercase">
            <span>{FEATURED_PROJECT.category}</span>
            <span className="text-pearl/25">♦</span>
            <span className="text-pearl/45">{FEATURED_PROJECT.meta}</span>
          </div>

          <h3 className="mt-5 font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl transition-colors group-hover:text-gold-hot sm:text-4xl md:text-5xl">
            {FEATURED_PROJECT.title}
          </h3>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pearl/55 sm:text-lg">
            {FEATURED_PROJECT.summary}
          </p>

          <p className="mt-8 inline-flex items-center gap-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.18em] text-gold uppercase">
            <span className="underline decoration-gold/40 underline-offset-4 transition-colors group-hover:decoration-gold-hot">
              Visit {FEATURED_PROJECT.hrefLabel}
            </span>
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </p>
        </a>

        <ul className="mt-6 divide-y divide-gold/15 border-y border-gold/15">
          {PORTFOLIO.map((item) => (
            <li
              key={item.category}
              className="grid gap-2 py-8 sm:grid-cols-[10rem_1fr] sm:items-start sm:gap-8"
            >
              <span className="text-xs tracking-[0.22em] text-gold-bright uppercase">
                {item.category}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-pearl sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-pearl/45">
                  {item.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
