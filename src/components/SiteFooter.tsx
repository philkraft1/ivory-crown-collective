import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/15 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.12em] text-pearl/70 uppercase">
            {SITE.name}
          </p>
          <p className="mt-1 text-xs tracking-[0.16em] text-pearl/40 uppercase">
            {SITE.founder.name}, {SITE.founder.title}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-pearl/45">
          <Link href="/#pay" className="transition-colors hover:text-gold-bright">
            Pay / book
          </Link>
          <a
            href={SITE.shopUrl}
            className="transition-colors hover:text-gold-bright"
            rel="noopener noreferrer"
          >
            {SITE.shopLabel}
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="transition-colors hover:text-gold-bright">
            {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-gold-bright">
            {SITE.email}
          </a>
          <Link
            href="/privacy"
            className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.18em] text-gold-bright uppercase transition-colors hover:text-gold-hot"
          >
            Privacy Policy
          </Link>
        </div>
        <p className="text-xs tracking-[0.14em] text-pearl/35 uppercase">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
