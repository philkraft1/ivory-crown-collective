import { buildUserData, type UserDataInput } from "@/lib/user-data";

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  const fn = (window as Window & { gtag?: Gtag }).gtag;
  return typeof fn === "function" ? fn : undefined;
}

export function setEnhancedUserData(input: UserDataInput): boolean {
  const userData = buildUserData(input);
  const send = gtag();
  if (!userData || !send) return false;
  send("set", "user_data", userData);
  return true;
}

export function trackGtagEvent(
  event: string,
  params?: Record<string, string | number | undefined>,
): void {
  const send = gtag();
  if (!send) return;
  const cleaned: Record<string, string | number> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") cleaned[key] = value;
    }
  }
  send("event", event, cleaned);
}

export function trackEnhancedConversion(
  event: string,
  input: UserDataInput,
  params?: Record<string, string | number | undefined>,
): void {
  setEnhancedUserData(input);
  trackGtagEvent(event, params);
}
