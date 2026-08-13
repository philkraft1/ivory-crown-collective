"use client";

import { FormEvent, useCallback, useState } from "react";
import { ContactIdentity } from "@/components/ContactIdentity";
import { Turnstile } from "@/components/Turnstile";
import { SITE } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const onToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          interest: data.get("interest"),
          message: data.get("message"),
          company: data.get("company"),
          turnstileToken,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong.");
      }

      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to send right now.");
    }
  }

  return (
    <section id="contact" className="relative border-t border-gold/15 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.35em] text-gold uppercase">
            Book / contact
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl font-semibold tracking-[-0.02em] text-pearl sm:text-4xl md:text-5xl">
            Let’s build something.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/55">
            Web design, software & apps, or IT help — message {SITE.founder.name} and you’ll hear
            back directly. Prefer to start with a deposit?{" "}
            <a href="#pay" className="text-gold-bright underline underline-offset-4 hover:text-gold-hot">
              Pay securely with Stripe
            </a>
            .
          </p>

          <div className="mt-10">
            <ContactIdentity />
          </div>

          <div className="mt-8 space-y-3 border-t border-gold/15 pt-8">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="block font-[family-name:var(--font-cinzel)] text-xl text-gold-hot transition-colors hover:text-gold-bright sm:text-2xl"
            >
              {SITE.phoneDisplay}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="block text-base text-pearl/70 transition-colors hover:text-pearl"
            >
              {SITE.email}
            </a>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div className="flex items-start justify-between gap-4 border border-gold/20 px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-xs tracking-[0.2em] text-pearl/40 uppercase">Sending to</p>
              <p className="mt-1 font-[family-name:var(--font-cinzel)] text-lg font-semibold text-pearl">
                {SITE.founder.name}
              </p>
              <p className="mt-0.5 text-xs tracking-[0.22em] text-gold-bright uppercase">
                {SITE.founder.title}
              </p>
            </div>
            <ContactIdentity size="sm" showDetails={false} />
          </div>

          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] text-pearl/45 uppercase">Name</span>
            <input
              required
              name="name"
              type="text"
              maxLength={100}
              className="w-full border border-gold/25 bg-transparent px-4 py-3 text-pearl outline-none transition focus:border-gold-bright"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs tracking-[0.2em] text-pearl/45 uppercase">Email</span>
              <input
                required
                name="email"
                type="email"
                maxLength={254}
                className="w-full border border-gold/25 bg-transparent px-4 py-3 text-pearl outline-none transition focus:border-gold-bright"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs tracking-[0.2em] text-pearl/45 uppercase">Phone</span>
              <input
                name="phone"
                type="tel"
                maxLength={40}
                className="w-full border border-gold/25 bg-transparent px-4 py-3 text-pearl outline-none transition focus:border-gold-bright"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] text-pearl/45 uppercase">Interest</span>
            <select
              name="interest"
              defaultValue="Web Design"
              className="w-full border border-gold/25 bg-void px-4 py-3 text-pearl outline-none transition focus:border-gold-bright"
            >
              <option>Web Design</option>
              <option>Software & Apps</option>
              <option>IT Solutions</option>
              <option>Multiple / Other</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] text-pearl/45 uppercase">Message</span>
            <textarea
              required
              name="message"
              rows={5}
              maxLength={4000}
              className="w-full resize-y border border-gold/25 bg-transparent px-4 py-3 text-pearl outline-none transition focus:border-gold-bright"
            />
          </label>

          <Turnstile action="contact" onToken={onToken} />

          <button
            type="submit"
            disabled={status === "sending"}
            className="group relative inline-flex min-w-[12rem] items-center justify-center overflow-hidden px-8 py-3.5 font-[family-name:var(--font-cinzel)] text-xs font-semibold tracking-[0.28em] text-ink uppercase disabled:opacity-70"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="relative">
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent" : "Send message"}
            </span>
          </button>

          {status === "sent" && (
            <p className="text-sm text-gold-bright" role="status">
              Message received — {SITE.founder.name} will get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-300" role="alert">
              {error} You can also email{" "}
              <a className="underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>{" "}
              or call {SITE.phoneDisplay}.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
