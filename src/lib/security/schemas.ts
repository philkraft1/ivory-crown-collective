import { z } from "zod";
import { PAY_OFFERINGS } from "@/lib/payments";

export const CONTACT_INTERESTS = [
  "Web Design",
  "Entertainment",
  "IT Solutions",
  "Multiple / Other",
  "General",
] as const;

const stripHeaderUnsafe = (value: string) => value.replace(/[\r\n\u0000]/g, "").trim();

export const contactBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100)
    .transform(stripHeaderUnsafe),
  email: z
    .string()
    .trim()
    .max(254)
    .email("Enter a valid email address.")
    .transform(stripHeaderUnsafe),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .default("")
    .transform(stripHeaderUnsafe),
  interest: z.enum(CONTACT_INTERESTS).optional().default("General"),
  message: z.string().trim().min(1, "Message is required.").max(4000),
  company: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

const offeringIds = PAY_OFFERINGS.map((o) => o.id) as [string, ...string[]];

export const checkoutBodySchema = z.object({
  offeringId: z.enum(offeringIds, {
    error: () => "Unknown payment option.",
  }),
  email: z
    .union([
      z.string().trim().email("Enter a valid email address.").max(254),
      z.literal(""),
      z.undefined(),
    ])
    .transform((v) => (v ? v : undefined))
    .optional(),
  turnstileToken: z.string().optional().default(""),
});

export function isAllowedStripeCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return (
      parsed.hostname === "checkout.stripe.com" ||
      parsed.hostname.endsWith(".stripe.com")
    );
  } catch {
    return false;
  }
}
