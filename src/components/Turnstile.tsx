"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";

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
          action?: string;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileReadyQueue?: Array<() => void>;
    __turnstileScriptLoading?: boolean;
  }
}

export type TurnstileHandle = {
  reset: () => void;
};

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
  action?: string;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function whenTurnstileReady(callback: () => void) {
  if (typeof window === "undefined") return;

  if (window.turnstile) {
    callback();
    return;
  }

  const queue = (window.__turnstileReadyQueue ??= []);
  queue.push(callback);

  if (window.__turnstileScriptLoading) return;
  window.__turnstileScriptLoading = true;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]`,
  );

  const flush = () => {
    const pending = window.__turnstileReadyQueue ?? [];
    window.__turnstileReadyQueue = [];
    for (const fn of pending) fn();
  };

  if (existing) {
    // Script tag exists but API may still be loading.
    const poll = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(poll);
        flush();
      }
    }, 50);
    window.setTimeout(() => window.clearInterval(poll), 10000);
    return;
  }

  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.onload = flush;
  script.onerror = () => {
    window.__turnstileScriptLoading = false;
    window.__turnstileReadyQueue = [];
  };
  document.head.appendChild(script);
}

export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { onToken, onExpire, action },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);
  const reactId = useId();

  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      onTokenRef.current("");
    },
  }));

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current) return;

    let cancelled = false;

    const render = () => {
      if (cancelled || !hostRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        ...(action ? { action } : {}),
        callback: (token) => onTokenRef.current(token),
        "expired-callback": () => {
          onTokenRef.current("");
          onExpireRef.current?.();
        },
        "error-callback": () => {
          onTokenRef.current("");
        },
      });
    };

    whenTurnstileReady(render);

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, reactId]);

  if (!SITE_KEY) {
    return null;
  }

  return <div ref={hostRef} className="min-h-[65px]" />;
});
