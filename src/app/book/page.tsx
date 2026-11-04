import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Pay } from "@/components/Pay";
import { CARE_DOOR } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book",
  description: "Pay a project deposit with Stripe and hold your place with Ivory Crown Collective.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <PageShell wide>
      <p className="text-sm text-gold">Book</p>
      <h1 className="mt-3 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.03em] text-pearl sm:text-5xl">
        Start with a deposit.
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-pearl/70">
        Pick the work, then pay on Stripe. The amount is applied to the project.{" "}
        <Link
          href={CARE_DOOR.href}
          className="text-gold-bright underline decoration-gold/40 underline-offset-4 hover:text-gold-hot"
        >
          Monthly care
        </Link>{" "}
        is billed on its own page.
      </p>
      <div className="mt-12">
        <Pay />
      </div>
    </PageShell>
  );
}
