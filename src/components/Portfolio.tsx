import { PORTFOLIO } from "@/lib/site";

export function Portfolio() {
  return (
    <section className="relative px-5 py-14 sm:px-8 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.08)_0%,transparent_50%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm text-gold">Work</p>
        <h1 className="mt-3 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
          Recent work.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-pearl/70">
          A look at what the studio has shipped.
        </p>

        <ul className="mt-14 divide-y divide-gold/15 border-y border-gold/15">
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
