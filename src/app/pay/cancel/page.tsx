import Link from "next/link";
import { SITE } from "@/lib/site";

export default function PayCancelPage() {
  return (
      <main className="flex flex-col items-center justify-center px-5 py-16 text-center text-pearl sm:py-24">
      <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
        Checkout canceled
      </p>
      <h1 className="mt-4 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
        No charge made.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/55">
        You can try again anytime, or message {SITE.founder.name} directly.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/#pay"
          className="group relative inline-flex overflow-hidden px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.22em] text-ink uppercase"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)]"
          />
          <span className="relative">Back to pay</span>
        </Link>
        <Link
          href="/#contact"
          className="border border-gold/45 px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.22em] text-gold-bright uppercase transition-colors hover:border-gold-hot hover:text-gold-hot"
        >
          Contact
        </Link>
      </div>
    </main>
  );
}
