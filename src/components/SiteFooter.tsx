import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-cinzel)] text-sm text-pearl/80">{SITE.name}</p>
          <p className="mt-1 text-xs text-pearl/45">
            {SITE.founder.name}, {SITE.founder.title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-pearl/55">
          <Link href="/work" className="transition-colors hover:text-gold-bright">
            Work
          </Link>
          <Link href="/book" className="transition-colors hover:text-gold-bright">
            Book
          </Link>
          <Link href="/contact" className="transition-colors hover:text-gold-bright">
            Contact
          </Link>
          <a
            href={SITE.ebayUrl}
            className="transition-colors hover:text-gold-bright"
            target="_blank"
            rel="noopener noreferrer"
          >
            {SITE.ebayLabel}
          </a>
          <a href={`tel:${SITE.phoneTel}`} className="transition-colors hover:text-gold-bright">
            {SITE.phoneDisplay}
          </a>
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-gold-bright">
            {SITE.email}
          </a>
          <Link href="/privacy" className="transition-colors hover:text-gold-bright">
            Privacy
          </Link>
        </div>
        <p className="text-xs text-pearl/35">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
