"use client";

import {
  createContext,
  use,
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";

type CheckoutContextValue = {
  canPay: boolean;
  loadingId: string | null;
  error: string;
  start: (offeringId: string) => Promise<void>;
  action: string;
  onToken: (token: string) => void;
  turnstileRef: RefObject<TurnstileHandle | null>;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

function useCheckoutContext() {
  const value = use(CheckoutContext);
  if (!value) {
    throw new Error("Checkout controls must sit inside CheckoutPanel.");
  }
  return value;
}

export function CheckoutPanel({
  action,
  children,
}: {
  action: string;
  children: ReactNode;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);
  const onToken = useCallback((token: string) => setTurnstileToken(token), []);
  const canPay = Boolean(turnstileToken.trim());

  async function start(offeringId: string) {
    if (!canPay) {
      setError("Complete the check below to enable payment.");
      return;
    }

    setLoadingId(offeringId);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offeringId, turnstileToken }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        const message = payload.error || "Unable to start checkout.";
        if (response.status === 403) {
          setTurnstileToken("");
          turnstileRef.current?.reset();
        }
        throw new Error(message);
      }

      let checkoutHost = "";
      try {
        checkoutHost = new URL(payload.url).hostname;
      } catch {
        throw new Error("Unable to start checkout.");
      }
      if (checkoutHost !== "checkout.stripe.com" && !checkoutHost.endsWith(".stripe.com")) {
        throw new Error("Unable to start checkout.");
      }

      window.location.assign(payload.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setLoadingId(null);
    }
  }

  return (
    <CheckoutContext
      value={{ canPay, loadingId, error, start, action, onToken, turnstileRef }}
    >
      {children}
    </CheckoutContext>
  );
}

export function CheckoutTurnstile() {
  const { action, onToken, turnstileRef } = useCheckoutContext();
  return <Turnstile ref={turnstileRef} action={action} onToken={onToken} />;
}

export function useCheckoutActions() {
  const { canPay, loadingId, error, start } = useCheckoutContext();
  return { canPay, loadingId, error, start };
}
