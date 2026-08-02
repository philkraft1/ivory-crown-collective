export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden"
      aria-labelledby="hero-brand"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_10%,#c9d0da_0%,#eef0f3_42%,#e4e8ee_100%)]" />
        <div className="animate-drift absolute -right-[18%] top-[-10%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,137,77,0.22),transparent_68%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(74,93,114,0.12)_100%)]" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.35]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <g fill="none" stroke="#2a3038" strokeWidth="1">
            <path className="animate-pulse-line" d="M0 620 C220 540 360 700 540 610 S900 480 1140 560 1440 500 1440 500" opacity="0.35" />
            <path d="M0 680 C260 600 400 740 620 650 S980 540 1200 620 1440 560 1440 560" opacity="0.22" />
            <path d="M820 0 L820 900" opacity="0.12" />
            <path d="M0 220 L1440 220" opacity="0.1" />
            <circle cx="1080" cy="260" r="140" opacity="0.14" />
            <circle cx="1080" cy="260" r="220" opacity="0.08" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pearl to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
        <p
          id="hero-brand"
          className="animate-rise font-[family-name:var(--font-syne)] text-4xl font-semibold leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Ivory Crown
          <br />
          Collective
        </p>

        <h1 className="animate-rise-delay-1 mt-6 max-w-xl font-[family-name:var(--font-syne)] text-xl font-medium tracking-[-0.02em] text-ink-soft sm:text-2xl md:text-3xl">
          Digital craft and live sound — equal weight, one collective.
        </h1>

        <p className="animate-rise-delay-2 mt-4 max-w-lg text-base leading-relaxed text-ink-soft/90 sm:text-lg">
          Web and software design built with intention. DJ sets booked with the same care.
        </p>

        <div className="animate-rise-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#design"
            className="inline-flex h-12 items-center justify-center bg-ink px-7 text-sm font-medium tracking-wide text-pearl transition-colors hover:bg-ink-soft"
          >
            Explore design
          </a>
          <a
            href="#dj"
            className="inline-flex h-12 items-center justify-center border border-ink/20 bg-transparent px-7 text-sm font-medium tracking-wide text-ink transition-colors hover:border-ink/40 hover:bg-white/40"
          >
            Explore DJ
          </a>
        </div>
      </div>
    </section>
  );
}
