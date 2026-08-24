import Link from "next/link";
import { GoogleEnhancedConversion } from "@/components/GoogleEnhancedConversion";
import { SITE } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import type { UserDataInput } from "@/lib/user-data";

type PaidSession = {
  paid: boolean;
  ref: string | null;
  user: UserDataInput;
  value: number | null;
  currency: string | null;
};

const emptySession: PaidSession = {
  paid: false,
  ref: null,
  user: {},
  value: null,
  currency: null,
};

async function verifyPaidSession(sessionId: string | undefined): Promise<PaidSession> {
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return emptySession;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return emptySession;
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const paid =
      session.status === "complete" &&
      (session.payment_status === "paid" || session.payment_status === "no_charge");
    if (!paid) return emptySession;

    const details = session.customer_details;
    const address = details?.address;

    return {
      paid: true,
      ref: session.id,
      user: {
        email: details?.email ?? session.customer_email,
        phone: details?.phone,
        name: details?.name,
        street: address?.line1,
        city: address?.city,
        region: address?.state,
        postalCode: address?.postal_code,
        country: address?.country,
      },
      value:
        typeof session.amount_total === "number" ? session.amount_total / 100 : null,
      currency: session.currency,
    };
  } catch {
    return emptySession;
  }
}

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const { paid, ref, user, value, currency } = await verifyPaidSession(
    params.session_id,
  );

  if (!paid) {
    return (
      <main className="flex flex-col items-center justify-center px-5 py-16 text-center text-pearl sm:py-24">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
          Payment
        </p>
        <h1 className="mt-4 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
          We couldn’t confirm that payment.
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/55">
          If you were charged, email {SITE.founder.name} at{" "}
          <a className="text-gold-bright underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>{" "}
          with your receipt and we’ll sort it out.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/#pay"
            className="border border-gold/45 px-6 py-3 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.22em] text-gold-bright uppercase transition-colors hover:border-gold-hot hover:text-gold-hot"
          >
            Try again
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

  return (
    <main className="flex flex-col items-center justify-center px-5 py-16 text-center text-pearl sm:py-24">
      <GoogleEnhancedConversion
        event="purchase"
        user={user}
        purchase={{ transactionId: ref, value, currency }}
      />
      {user.email ? (
        <input type="hidden" id="email" name="email" value={user.email} readOnly />
      ) : null}
      {user.phone ? (
        <input type="hidden" id="phone" name="phone" value={user.phone} readOnly />
      ) : null}
      <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
        Payment received
      </p>
      <h1 className="mt-4 max-w-xl font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.02em] sm:text-5xl">
        Thank you.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/55">
        {SITE.founder.name} will follow up shortly to confirm next steps.
      </p>
      {ref && (
        <p className="mt-3 max-w-md break-all text-xs text-pearl/30">Ref: {ref}</p>
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
