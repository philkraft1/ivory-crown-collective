import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
  company?: string;
};

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const interest = body.interest?.trim() || "General";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || SITE.email;

  if (resendKey) {
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Ivory Crown Collective <onboarding@resend.dev>",
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

  // Zero-config fallback (confirm the inbox email once when first used)
  const formSubmit = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      phone,
      interest,
      message,
      _subject: `ICC inquiry for ${SITE.founder.name} — ${interest} — ${name}`,
      _replyto: email,
      founder: `${SITE.founder.name}, ${SITE.founder.title}`,
      _template: "table",
      _captcha: "false",
    }),
  });

  if (!formSubmit.ok) {
    const detail = await formSubmit.text();
    console.error("FormSubmit error:", detail);
    return NextResponse.json(
      {
        error:
          "Could not deliver message yet. If this is the first send, check your inbox to activate FormSubmit, or email/call directly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
