"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

type ContactIdentityProps = {
  size?: "md" | "sm";
  showDetails?: boolean;
};

export function ContactIdentity({ size = "md", showDetails = true }: ContactIdentityProps) {
  const [missingHeadshot, setMissingHeadshot] = useState(false);
  const { founder } = SITE;
  const frame = size === "sm" ? "h-16 w-16" : "h-28 w-28 sm:h-32 sm:w-32";

  const headshot = (
    <div
      className={`relative shrink-0 overflow-hidden border border-gold/40 bg-[radial-gradient(circle_at_30%_20%,rgba(245,215,106,0.18),#0a0a0a_70%)] ${frame}`}
    >
      {!missingHeadshot ? (
        // eslint-disable-next-line @next/next/no-img-element -- optional drop-in asset until uploaded
        <img
          src={founder.headshotSrc}
          alt={`${founder.name}, ${founder.title}`}
          className="h-full w-full object-cover object-center"
          onError={() => setMissingHeadshot(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
          <span
            className={`font-[family-name:var(--font-cinzel)] font-semibold tracking-[0.12em] text-gold-bright ${
              size === "sm" ? "text-sm" : "text-2xl"
            }`}
          >
            {founder.initials}
          </span>
          {size !== "sm" && (
            <span className="text-[0.55rem] leading-tight tracking-[0.14em] text-pearl/35 uppercase">
              Add headshot
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!showDetails) {
    return headshot;
  }

  return (
    <div className="flex items-center gap-5">
      {headshot}
      <div>
        <p className="font-[family-name:var(--font-cinzel)] text-xl font-semibold tracking-[-0.01em] text-pearl sm:text-2xl">
          {founder.name}
        </p>
        <p className="mt-1 text-xs tracking-[0.28em] text-gold-bright uppercase">
          {founder.title} · {SITE.name}
        </p>
      </div>
    </div>
  );
}
