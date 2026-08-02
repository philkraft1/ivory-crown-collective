import { PORTFOLIO } from "@/lib/site";

export function Portfolio() {
  return (
    <section id="portfolio" className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.08)_0%,transparent_50%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          Portfolio
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
          Work in motion.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-pearl/55">
          Featured projects and bookings will land here. Until then, reach out — new work is taking shape.
        </p>

        <ul className="mt-14 divide-y divide-gold/15 border-y border-gold/15">
          {PORTFOLIO.map((item) => (
            <li
              key={item.category}
              className="grid gap-2 py-8 sm:grid-cols-[10rem_1fr_auto] sm:items-center sm:gap-8"
            >
              <span className="text-xs tracking-[0.22em] text-gold-bright uppercase">
                {item.category}
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-pearl sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-pearl/45">{item.status}</p>
              </div>
              <span className="text-xs tracking-[0.18em] text-pearl/35 uppercase">Soon</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
