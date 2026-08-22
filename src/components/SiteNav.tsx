import Link from "next/link";
import { SITE } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#pay", label: "Book" },
  { href: SITE.shopUrl, label: "Shop", external: true },
  { href: "/#contact", label: "Contact" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-void/90 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="shrink-0 font-[family-name:var(--font-cinzel)] text-[0.7rem] font-semibold tracking-[0.2em] text-pearl/80 uppercase transition-colors hover:text-gold-bright sm:text-xs"
        >
          {SITE.name}
        </Link>
        <nav aria-label="Primary" className="min-w-0">
          <ul className="flex items-center justify-end gap-x-4 overflow-x-auto text-[0.65rem] tracking-[0.16em] text-pearl/50 uppercase sm:gap-x-6 sm:text-[0.7rem] sm:tracking-[0.18em]">
            {links.map((link) => (
              <li key={link.label} className="shrink-0">
                {"external" in link && link.external ? (
                  <a
                    href={link.href}
                    className="transition-colors hover:text-gold-bright"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="transition-colors hover:text-gold-bright">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
