"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CARE_DOOR, SERVICES, SITE } from "@/lib/site";

const serviceLinks = [
  ...SERVICES.map((service) => ({
    href: service.href,
    label: service.title,
    line: service.line,
  })),
  {
    href: CARE_DOOR.href,
    label: CARE_DOOR.title,
    line: CARE_DOOR.line,
  },
];

const leadLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
] as const;

const pageLinks = [
  { href: "/work", label: "Work" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
] as const;

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuId = useId();
  const servicesMenuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState(pathname);
  const servicesCurrent = pathname.startsWith("/services");

  if (openForPath !== pathname) {
    setOpenForPath(pathname);
    setMenuOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    if (!menuOpen && !servicesOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    }

    function onPointer(event: MouseEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen, servicesOpen]);

  const linkClass = (current: boolean) =>
    current ? "text-gold-bright" : "text-pearl/70 transition-colors hover:text-gold-bright";

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-white/10 bg-void/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-cinzel)] text-sm font-semibold tracking-[0.04em] text-pearl transition-colors hover:text-gold-bright"
        >
          <Image src="/brand/crown.png" alt="" width={424} height={324} className="h-8 w-auto" />
          <span className="sm:hidden">Ivory Crown</span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
          {leadLinks.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`text-sm ${linkClass(current)}`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="relative">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 text-sm ${linkClass(servicesCurrent)}`}
              aria-expanded={servicesOpen}
              aria-controls={servicesMenuId}
              onClick={() => setServicesOpen((open) => !open)}
            >
              Services
              <span aria-hidden="true" className={`text-[0.65rem] ${servicesOpen ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {servicesOpen && (
              <div
                id={servicesMenuId}
                className="absolute left-0 top-[calc(100%+0.85rem)] w-72 rounded-lg border border-white/10 bg-[#0c0c0c] p-2 shadow-2xl"
              >
                <ul>
                  {serviceLinks.map((link) => {
                    const current = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={current ? "page" : undefined}
                          className={`block rounded-md px-3 py-2.5 ${
                            current ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="block text-sm text-pearl">{link.label}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-pearl/55">
                            {link.line}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {pageLinks.map((link) => {
            const current = isCurrent(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`text-sm ${linkClass(current)}`}
              >
                {link.label}
              </Link>
            );
          })}

          <a
            href={SITE.ebayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pearl/70 transition-colors hover:text-gold-bright"
          >
            {SITE.ebayLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>

        <button
          type="button"
          className="text-sm text-pearl/80 lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav id={menuId} aria-label="Mobile" className="border-t border-white/10 bg-void lg:hidden">
          <div className="mx-auto max-w-6xl px-5 py-4">
            <ul>
              {leadLinks.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={`block py-2.5 text-base ${current ? "text-gold-bright" : "text-pearl"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 border-t border-white/10 pt-3 text-xs text-gold">Services</p>
            <ul className="mt-2">
              {serviceLinks.map((link) => {
                const current = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={`block py-2.5 text-base ${current ? "text-gold-bright" : "text-pearl"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-3 border-t border-white/10 pt-3">
              {pageLinks.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      className={`block py-2.5 text-base ${current ? "text-gold-bright" : "text-pearl"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  href={SITE.ebayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2.5 text-base text-pearl"
                >
                  {SITE.ebayLabel}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
