import { SITE } from "@/lib/site";

export function ConstructionBanner() {
  return (
    <div
      role="status"
      className="animate-shimmer relative z-[60] w-full border-b border-ink/40 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_26%,#fff3ad_50%,#e8b923_74%,#c9971a_100%)] px-4 py-3.5 text-center text-ink shadow-[0_8px_40px_rgba(232,185,35,0.45)] sm:px-6 sm:py-4"
    >
      <p className="font-[family-name:var(--font-cinzel)] text-[0.8rem] font-bold uppercase leading-snug tracking-[0.05em] sm:text-base md:text-lg lg:text-xl">
        Site still under construction — any questions contact me at{" "}
        <a
          href={`mailto:${SITE.email}`}
          className="underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70"
        >
          {SITE.email}
        </a>
        {" · "}
        <a
          href={`tel:${SITE.phoneTel}`}
          className="underline decoration-2 underline-offset-4 transition-opacity hover:opacity-70"
        >
          {SITE.phoneDisplay}
        </a>
      </p>
    </div>
  );
}
