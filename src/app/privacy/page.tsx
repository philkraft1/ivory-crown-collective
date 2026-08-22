import type { Metadata } from "next";
import Link from "next/link";
import { ContactIdentity } from "@/components/ContactIdentity";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${SITE.name} LLC — how we collect, use, and protect your information.`,
  alternates: {
    canonical: `${SITE.url}/privacy`,
  },
};

const EFFECTIVE = "August 20, 2026";
const ENTITY = `${SITE.name} LLC`;
const SHOP_HOST = SITE.shopUrl.replace(/^https?:\/\//, "");

const toc = [
  { id: "controller", label: "1. Who is responsible" },
  { id: "scope", label: "2. What this covers" },
  { id: "collect", label: "3. Information we collect" },
  { id: "use", label: "4. How we use it" },
  { id: "share", label: "5. Who we share it with" },
  { id: "cookies", label: "6. Cookies and similar tech" },
  { id: "retain", label: "7. How long we keep it" },
  { id: "rights", label: "8. Your rights" },
  { id: "security", label: "9. Security" },
  { id: "children", label: "10. Children" },
  { id: "intl", label: "11. International visitors" },
  { id: "changes", label: "12. Changes" },
  { id: "contact", label: "13. How to reach us" },
];

export default function PrivacyPage() {
  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_50%_0%,rgba(232,185,35,0.12)_0%,transparent_58%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="max-w-3xl">
          <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
            Ivory Crown Collective LLC
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl font-semibold tracking-[-0.02em] text-pearl sm:text-6xl">
            Privacy Policy
          </h1>
          <div className="mt-6 h-px w-28 bg-gradient-to-r from-gold-bright to-transparent" />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-pearl/55">
            This policy explains what {ENTITY} collects on ivorycrowncollective.com, why we collect
            it, and how to ask questions or exercise your rights.
          </p>
          <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
            <div className="border border-gold/20 px-4 py-3">
              <dt className="text-[0.65rem] tracking-[0.22em] text-pearl/40 uppercase">Effective</dt>
              <dd className="mt-1 text-pearl">{EFFECTIVE}</dd>
            </div>
            <div className="border border-gold/20 px-4 py-3">
              <dt className="text-[0.65rem] tracking-[0.22em] text-pearl/40 uppercase">
                Privacy contact
              </dt>
              <dd className="mt-1 text-pearl">
                {SITE.founder.name}, {SITE.founder.title}
              </dd>
            </div>
          </dl>
        </header>

        <div className="mt-16 grid gap-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <nav
            aria-label="On this page"
            className="h-fit border border-gold/15 px-5 py-6 lg:sticky lg:top-8"
          >
            <p className="font-[family-name:var(--font-cinzel)] text-[0.65rem] tracking-[0.28em] text-gold uppercase">
              Contents
            </p>
            <ol className="mt-4 space-y-2.5 text-sm text-pearl/50">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="transition-colors hover:text-gold-bright">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="max-w-3xl space-y-12 text-base leading-relaxed text-pearl/70">
            <section id="controller">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                1. Who is responsible
              </h2>
              <p className="mt-4">
                The data controller is <strong className="text-pearl">{ENTITY}</strong>, a New
                Jersey limited liability company. Day-to-day privacy requests are handled by{" "}
                <strong className="text-pearl">
                  {SITE.founder.name}, {SITE.founder.title}
                </strong>
                .
              </p>
              <ul className="mt-4 space-y-1 text-pearl/65">
                <li>Website: {SITE.url}</li>
                <li>
                  Email:{" "}
                  <a className="text-gold-bright underline underline-offset-4" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a className="text-gold-bright underline underline-offset-4" href={`tel:${SITE.phoneTel}`}>
                    {SITE.phoneDisplay}
                  </a>
                </li>
                <li>Location: New Jersey, United States</li>
              </ul>
            </section>

            <section id="scope">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                2. What this covers
              </h2>
              <p className="mt-4">
                This policy covers ivorycrowncollective.com, including the contact form, Stripe
                Checkout deposits, and related success/cancel pages.
              </p>
              <p className="mt-3">
                The costume shop at{" "}
                <a className="text-gold-bright underline underline-offset-4" href={SITE.shopUrl}>
                  {SHOP_HOST}
                </a>{" "}
                is operated on Shopify. Purchases, accounts, and checkout there are also subject to{" "}
                <a
                  className="text-gold-bright underline underline-offset-4"
                  href="https://www.shopify.com/legal/privacy"
                  rel="noopener noreferrer"
                >
                  Shopify’s Privacy Policy
                </a>
                .
              </p>
            </section>

            <section id="collect">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                3. Information we collect
              </h2>
              <div className="mt-6 overflow-x-auto border border-gold/15">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="bg-gold/10 font-[family-name:var(--font-cinzel)] text-[0.65rem] tracking-[0.18em] text-gold uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">What we get</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    <tr>
                      <td className="px-4 py-3 text-pearl">Contact form</td>
                      <td className="px-4 py-3">
                        Name, email, phone (optional), interest (Web Design, Entertainment, IT
                        Solutions, or Other), and message.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-pearl">Stripe Checkout</td>
                      <td className="px-4 py-3">
                        Name, email, billing address (if provided), offering purchased (for example
                        web-design deposit, entertainment deposit, IT deposit, or strategy consult),
                        amount, and payment status. Stripe collects card or wallet details. We do
                        not store full card numbers.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-pearl">Cloudflare Turnstile</td>
                      <td className="px-4 py-3">
                        A bot-check token and related device/interaction signals used only to block
                        spam on the contact form.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-pearl">Hosting logs (Vercel)</td>
                      <td className="px-4 py-3">
                        IP address, date/time, requested URL, referrer, and browser/user-agent, as
                        needed to run and secure the site.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-pearl">Email / phone</td>
                      <td className="px-4 py-3">
                        Anything you choose to send to {SITE.email} or {SITE.phoneDisplay}.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4">
                We do not buy lists, run advertising pixels, or sell personal information.
              </p>
            </section>

            <section id="use">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                4. How we use it
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Respond to inquiries and book web design, entertainment, or IT work.</li>
                <li>Process deposits and consult fees and confirm payment.</li>
                <li>Prevent spam, fraud, and abuse.</li>
                <li>Keep business, tax, and legal records.</li>
                <li>Operate, debug, and secure this website.</li>
              </ul>
              <p className="mt-4">
                We do not use your information for unrelated marketing unless you ask us to.
              </p>
            </section>

            <section id="share">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                5. Who we share it with
              </h2>
              <p className="mt-4">
                We share information only with vendors who help us operate, and only as needed:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-pearl">Stripe, Inc.</strong> — payments.{" "}
                  <a
                    className="text-gold-bright underline underline-offset-4"
                    href="https://stripe.com/privacy"
                    rel="noopener noreferrer"
                  >
                    stripe.com/privacy
                  </a>
                </li>
                <li>
                  <strong className="text-pearl">Cloudflare, Inc.</strong> — Turnstile bot
                  protection.{" "}
                  <a
                    className="text-gold-bright underline underline-offset-4"
                    href="https://www.cloudflare.com/privacypolicy/"
                    rel="noopener noreferrer"
                  >
                    cloudflare.com/privacypolicy
                  </a>
                </li>
                <li>
                  <strong className="text-pearl">Vercel Inc.</strong> — hosting.{" "}
                  <a
                    className="text-gold-bright underline underline-offset-4"
                    href="https://vercel.com/legal/privacy-policy"
                    rel="noopener noreferrer"
                  >
                    vercel.com/legal/privacy-policy
                  </a>
                </li>
                <li>
                  <strong className="text-pearl">FormSubmit / email routing</strong> — delivering
                  contact-form messages to {SITE.email} when that path is used.
                </li>
                <li>
                  <strong className="text-pearl">Shopify Inc.</strong> — only for the costume shop
                  at {SHOP_HOST}.{" "}
                  <a
                    className="text-gold-bright underline underline-offset-4"
                    href="https://www.shopify.com/legal/privacy"
                    rel="noopener noreferrer"
                  >
                    shopify.com/legal/privacy
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                We may also disclose information if required by law or to protect {ENTITY}, our
                customers, or the public.
              </p>
            </section>

            <section id="cookies">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                6. Cookies and similar tech
              </h2>
              <p className="mt-4">
                This site does not use advertising cookies. Stripe Checkout, Cloudflare Turnstile,
                and Vercel may set strictly necessary cookies or similar storage to complete a
                payment, verify you are not a bot, or keep the site secure. You can control cookies
                in your browser; blocking necessary ones may stop checkout or the contact form from
                working.
              </p>
            </section>

            <section id="retain">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                7. How long we keep it
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Contact inquiries: typically up to 24 months after we close the request.</li>
                <li>
                  Payment records: as long as tax, accounting, and dispute rules require (generally
                  at least 7 years in the U.S.).
                </li>
                <li>Server logs: according to our host’s default retention, usually a short period.</li>
              </ul>
            </section>

            <section id="rights">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                8. Your rights
              </h2>
              <p className="mt-4">
                Depending on where you live (including New Jersey and other U.S. states), you may
                have the right to:
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Know what personal information we hold and how we use it.</li>
                <li>Access, correct, or delete that information, subject to legal limits.</li>
                <li>Opt out of sale or sharing — we do not sell or share for advertising.</li>
                <li>Appeal a denial of a privacy request.</li>
              </ul>
              <p className="mt-4">
                Email {SITE.email} with the subject line “Privacy request.” We will verify your
                identity before fulfilling the request. Authorized agents may contact us at the
                same address.
              </p>
            </section>

            <section id="security">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                9. Security
              </h2>
              <p className="mt-4">
                We use HTTPS, hosted infrastructure, Stripe for card handling, and bot protection
                on the contact form. No method of transmission or storage is 100% secure.
              </p>
            </section>

            <section id="children">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                10. Children
              </h2>
              <p className="mt-4">
                ivorycrowncollective.com is not directed to children under 13, and we do not
                knowingly collect personal information from children under 13. Costume purchases
                for minors on {SHOP_HOST} should be made by a parent or guardian.
              </p>
            </section>

            <section id="intl">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                11. International visitors
              </h2>
              <p className="mt-4">
                We operate in the United States. If you contact us from another country, your
                information will be processed in the U.S., where privacy laws may differ from those
                where you live.
              </p>
            </section>

            <section id="changes">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                12. Changes
              </h2>
              <p className="mt-4">
                We may update this policy. The “Effective” date at the top will change when we do.
                Continued use of the site after an update means you accept the revised policy.
              </p>
            </section>

            <section id="contact" className="border border-gold/20 px-6 py-8 sm:px-8">
              <h2 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl">
                13. How to reach us
              </h2>
              <p className="mt-4">
                Privacy questions and requests go to {SITE.founder.name}. We aim to reply within 30
                days.
              </p>
              <div className="mt-8">
                <ContactIdentity />
              </div>
              <div className="mt-6 space-y-2 text-pearl">
                <p>
                  <a className="text-gold-bright underline underline-offset-4" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </p>
                <p>
                  <a className="text-gold-bright underline underline-offset-4" href={`tel:${SITE.phoneTel}`}>
                    {SITE.phoneDisplay}
                  </a>
                </p>
                <p className="text-sm text-pearl/50">New Jersey, United States</p>
              </div>
            </section>

            <p className="text-sm text-pearl/40">
              This page is provided for transparency. It is not legal advice.
            </p>
          </article>
        </div>

        <p className="mt-16">
          <Link
            href="/"
            className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.22em] text-gold uppercase transition-colors hover:text-gold-hot"
          >
            ← Back home
          </Link>
        </p>
      </div>
    </main>
  );
}
