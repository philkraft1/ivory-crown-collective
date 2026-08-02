const designPoints = [
  "Brand sites and product interfaces",
  "Software UX with clear systems",
  "Launch-ready builds and refinements",
];

const djPoints = [
  "Private events and celebrations",
  "Venue nights and brand activations",
  "Sets shaped to the room and crowd",
];

export function Pillars() {
  return (
    <section className="border-t border-ink/10 bg-pearl" aria-label="What we offer">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <article
          id="design"
          className="scroll-mt-24 border-b border-ink/10 px-5 py-16 sm:px-8 sm:py-20 md:border-b-0 md:border-r"
        >
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brass">
            Pillar one
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
            Web &amp; software design
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Clean interfaces, strong structure, and builds that feel as considered as the brand
            behind them — from marketing sites to product surfaces.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            {designPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-px w-4 shrink-0 bg-brass" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-10 inline-flex text-sm font-medium tracking-wide text-ink underline decoration-brass/60 underline-offset-4 transition hover:decoration-brass"
          >
            Start a design project
          </a>
        </article>

        <article id="dj" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brass">
            Pillar two
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
            DJ gigs
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
            Thoughtful sets for rooms that need energy with taste — events, venues, and nights
            where the music should feel intentional, not generic.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-ink-soft">
            {djPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-px w-4 shrink-0 bg-brass" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-10 inline-flex text-sm font-medium tracking-wide text-ink underline decoration-brass/60 underline-offset-4 transition hover:decoration-brass"
          >
            Book a DJ set
          </a>
        </article>
      </div>
    </section>
  );
}
