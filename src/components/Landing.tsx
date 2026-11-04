import Image from "next/image";
import Link from "next/link";
import { HashRedirect } from "@/components/HashRedirect";
import { DOORS, FEATURED_PROJECT } from "@/lib/site";

export function Landing() {
  return (
    <main className="relative">
      <HashRedirect />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.12)_0%,transparent_62%)]"
        aria-hidden="true"
      />

      <section className="relative px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1>
            <Image
              src="/brand/logo.png"
              alt="Ivory Crown Collective"
              width={1024}
              height={681}
              priority
              className="mx-auto h-auto w-full max-w-[17rem]"
            />
          </h1>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-pearl/70 sm:text-lg">
            Websites, software, and IT for businesses that want the work handled with care.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          {DOORS.map((door) => (
            <li key={door.href}>
              <Link
                href={door.href}
                className="group flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.03] px-6 py-6 text-left transition-colors hover:border-gold/40 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright"
              >
                <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-pearl">
                  {door.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-pearl/65">{door.line}</span>
                <span className="mt-6 text-sm text-gold-bright">
                  View
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 text-sm text-pearl/60 sm:flex-row sm:justify-center sm:gap-8">
          <Link
            href="/contact"
            className="text-pearl underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-bright"
          >
            Not sure where to start? Send a note.
          </Link>
          <a
            href={FEATURED_PROJECT.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gold-bright"
          >
            Recent site · {FEATURED_PROJECT.title}
          </a>
        </div>
      </section>
    </main>
  );
}
