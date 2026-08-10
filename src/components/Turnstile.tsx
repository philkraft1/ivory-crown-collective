"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "dark" | "light" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({ onToken, onExpire }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const reactId = useId();

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current) return;

    let cancelled = false;

    const render = () => {
      if (cancelled || !hostRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token) => onToken(token),
        "expired-callback": () => {
          onToken("");
          onExpire?.();
        },
        "error-callback": () => {
          onToken("");
        },
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
        script.async = true;
        window.onTurnstileLoad = () => render();
        document.head.appendChild(script);
      } else {
        window.onTurnstileLoad = () => render();
        // Script may already be loaded.
        if (window.turnstile) render();
      }
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onExpire, onToken, reactId]);

  if (!SITE_KEY) {
    return null;
  }

  return <div ref={hostRef} className="min-h-[65px]" />;
}
