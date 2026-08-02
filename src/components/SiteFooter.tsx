export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-pearl">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-[-0.02em] text-ink">
            Ivory Crown Collective
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Design &amp; DJ — co-equal practices under one LLC.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink-soft">
          <a href="#design" className="transition-colors hover:text-ink">
            Design
          </a>
          <a href="#dj" className="transition-colors hover:text-ink">
            DJ
          </a>
          <a href="#contact" className="transition-colors hover:text-ink">
            Contact
          </a>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-stone sm:px-8">
          © {new Date().getFullYear()} Ivory Crown Collective LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
