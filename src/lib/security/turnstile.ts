import { hasTurnstileConfig, isProduction } from "@/lib/security/env";

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

/**
 * Verifies a Cloudflare Turnstile token.
 * Prod with missing keys → fail closed.
 * Dev without keys → skip (local DX).
 */
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  if (!secret || !siteKey) {
    if (isProduction()) {
      return { ok: false, error: "Bot protection is not configured." };
    }
    return { ok: true };
  }

  if (!token?.trim()) {
    return { ok: false, error: "Complete the bot check and try again." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    if (!response.ok) {
      return { ok: false, error: "Bot check failed. Please try again." };
    }

    const result = (await response.json()) as TurnstileResponse;
    if (!result.success) {
      return { ok: false, error: "Bot check failed. Please try again." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Bot check unavailable. Please try again." };
  }
}

export { hasTurnstileConfig };
