import Image from "next/image";

const dust = [
  { left: "8%", delay: "0s", duration: "11s", size: 2 },
  { left: "18%", delay: "2.2s", duration: "13s", size: 1 },
  { left: "32%", delay: "1.1s", duration: "10s", size: 2 },
  { left: "48%", delay: "3.4s", duration: "14s", size: 1 },
  { left: "61%", delay: "0.6s", duration: "12s", size: 2 },
  { left: "74%", delay: "4.1s", duration: "15s", size: 1 },
  { left: "86%", delay: "1.8s", duration: "11s", size: 2 },
  { left: "94%", delay: "2.8s", duration: "12s", size: 1 },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4.25rem)] flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.18)_0%,transparent_55%)]" />
        <div className="animate-glow absolute left-1/2 top-[-8%] h-[70vmin] w-[95vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,215,106,0.22)_0%,transparent_68%)] blur-3xl" />
        <div className="animate-beam absolute left-1/2 top-0 h-[70%] w-[22%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(245,215,106,0.22)_0%,transparent_85%)] blur-md" />
        <div className="animate-beam-delay absolute left-[36%] top-0 h-[58%] w-[16%] -translate-x-1/2 rotate-[-14deg] bg-[linear-gradient(180deg,rgba(232,185,35,0.16)_0%,transparent_85%)] blur-md" />
        <div className="animate-beam absolute left-[64%] top-0 h-[58%] w-[16%] -translate-x-1/2 rotate-[14deg] bg-[linear-gradient(180deg,rgba(232,185,35,0.16)_0%,transparent_85%)] blur-md" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,#030303_96%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
        {dust.map((speck) => (
          <span
            key={`${speck.left}-${speck.delay}`}
            className="dust"
            style={{
              left: speck.left,
              bottom: "6%",
              width: speck.size,
              height: speck.size,
              animationDelay: speck.delay,
              animationDuration: speck.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-[calc(100svh-4.25rem)] flex-col">
        <div className="animate-rise relative min-h-0 flex-1 px-3 py-2 sm:px-8 sm:py-4">
          <Image
            src="/brand/logo.png"
            alt="Ivory Crown Collective — Web Design, Software & Apps, and IT Solutions"
            fill
            priority
            sizes="100vw"
            className="object-contain object-center drop-shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div className="relative shrink-0 bg-gradient-to-t from-void via-void/90 to-transparent px-5 pb-8 pt-4 text-center sm:px-8 sm:pb-10">
          <div className="animate-line mx-auto mb-4 h-px w-28 bg-gradient-to-r from-transparent via-gold-bright to-transparent sm:mb-5 sm:w-40" />
          <p className="animate-rise-delay-1 animate-breathe font-[family-name:var(--font-cinzel)] text-lg font-semibold uppercase text-gold-hot sm:text-2xl md:text-3xl">
            Now booking
          </p>
          <p className="animate-rise-delay-2 mt-2 text-[0.65rem] tracking-[0.28em] text-pearl/50 uppercase sm:mt-3 sm:text-xs">
            Web design · Software & apps · IT solutions
          </p>
          <div className="animate-rise-delay-3 mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6">
            <a
              href="#services"
              className="inline-flex items-center justify-center border border-gold/45 px-6 py-3 font-[family-name:var(--font-cinzel)] text-[0.7rem] font-semibold tracking-[0.22em] text-gold-bright uppercase transition-colors hover:border-gold-hot hover:text-gold-hot sm:text-xs"
            >
              Explore
            </a>
            <a
              href="#pay"
              className="group relative inline-flex items-center justify-center overflow-hidden px-7 py-3 font-[family-name:var(--font-cinzel)] text-[0.7rem] font-semibold tracking-[0.22em] text-ink uppercase sm:text-xs"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="relative">Pay / book</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
