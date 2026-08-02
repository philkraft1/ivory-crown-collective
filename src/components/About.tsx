export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-t border-ink/10 bg-[linear-gradient(180deg,#e8ecf2_0%,#eef0f3_100%)]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brass">About</p>
          <h2
            id="about-heading"
            className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl"
          >
            One LLC. Two practices. Same standard.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
            Ivory Crown Collective is a Delaware LLC built around craft — digital work that holds
            up under use, and live sound that holds a room. Neither side is a side hustle in the
            story; both are how the collective shows up.
          </p>
        </div>
      </div>
    </section>
  );
}
