import { NextResponse } from "next/server";
import { isProduction } from "@/lib/security/env";
import { contactBodySchema } from "@/lib/security/schemas";
import { clientIp } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { SITE } from "@/lib/site";

export function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(json);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, phone, interest, message, company, turnstileToken } =
    parsed.data;

  // Honeypot — pretend success so bots move on.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const turnstile = await verifyTurnstile(turnstileToken, clientIp(request));
  if (!turnstile.ok) {
    return NextResponse.json({ error: turnstile.error }, { status: 403 });
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL || SITE.email;

  if (!resendKey) {
    if (isProduction()) {
      return NextResponse.json(
        { error: "Contact delivery is not configured." },
        { status: 503 },
      );
    }

    console.info("[contact:dev]", { name, email, phone, interest, message });
    return NextResponse.json({ ok: true });
  }

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        process.env.CONTACT_FROM_EMAIL ||
        "Ivory Crown Collective <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `ICC inquiry for ${SITE.founder.name} — ${interest} — ${name}`,
      text: [
        `To: ${SITE.founder.name}, ${SITE.founder.title}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Interest: ${interest}`,
        "",
        message,
      ].join("\n"),
    }),
  });

  if (!sent.ok) {
    const detail = await sent.text();
    console.error("Resend error:", detail);
    return NextResponse.json({ error: "Could not deliver message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
