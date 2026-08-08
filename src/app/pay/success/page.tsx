import Link from "next/link";
import { SITE } from "@/lib/site";

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-void px-5 py-16 text-center text-pearl">
      <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
        Payment received
      </p>
      <h1 className="mt-4 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
        Thank you.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/55">
        {SITE.founder.name} will follow up shortly to confirm next steps.
      </p>
      {params.session_id && (
        <p className="mt-3 max-w-md break-all text-xs text-pearl/30">Ref: {params.session_id}</p>
      )}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/#contact"
          className="border border-gold/45 px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.22em] text-gold-bright uppercase transition-colors hover:border-gold-hot hover:text-gold-hot"
        >
          Contact
        </Link>
        <Link
          href="/"
          className="group relative inline-flex overflow-hidden px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.22em] text-ink uppercase"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)]"
          />
          <span className="relative">Back home</span>
        </Link>
      </div>
    </main>
  );
}
