"use client";

import { useState, type FormEvent } from "react";

const interests = [
  { value: "design", label: "Web / software design" },
  { value: "dj", label: "DJ gig" },
  { value: "both", label: "Both" },
];

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Placeholder until email/backend wiring — preserves equal CTAs for both pillars
    setSubmitted(true);
  }

  return (
    <section
      id="contact"
      className="scroll-mt-24 border-t border-ink/10 bg-ink text-pearl"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brass-bright">
            Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
          >
            Tell us what you need.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-pearl/75">
            Design project, DJ booking, or both — same inbox, same response standard. Share a few
            details and we&apos;ll follow up.
          </p>
        </div>

        {submitted ? (
          <div className="flex items-center border border-pearl/15 px-6 py-10">
            <p className="text-base leading-relaxed text-pearl/90">
              Thanks — your note is ready on this end. Wire this form to your email or CRM next,
              and replies will go live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block text-pearl/70">Name</span>
                <input
                  required
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="h-12 w-full border border-pearl/20 bg-transparent px-4 text-pearl outline-none transition focus:border-brass-bright"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-pearl/70">Email</span>
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="h-12 w-full border border-pearl/20 bg-transparent px-4 text-pearl outline-none transition focus:border-brass-bright"
                />
              </label>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm text-pearl/70">I&apos;m interested in</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {interests.map((interest) => (
                  <label
                    key={interest.value}
                    className="flex h-12 cursor-pointer items-center justify-center border border-pearl/20 px-3 text-center text-sm text-pearl/85 transition has-[:checked]:border-brass-bright has-[:checked]:text-pearl"
                  >
                    <input
                      type="radio"
                      name="interest"
                      value={interest.value}
                      required
                      className="sr-only"
                      defaultChecked={interest.value === "both"}
                    />
                    {interest.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm">
              <span className="mb-2 block text-pearl/70">Message</span>
              <textarea
                required
                name="message"
                rows={5}
                className="w-full resize-y border border-pearl/20 bg-transparent px-4 py-3 text-pearl outline-none transition focus:border-brass-bright"
                placeholder="Project goals, event date, venue, timeline…"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center bg-pearl px-7 text-sm font-medium tracking-wide text-ink transition-colors hover:bg-mist"
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
