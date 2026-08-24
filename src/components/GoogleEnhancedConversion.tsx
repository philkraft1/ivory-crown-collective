"use client";

import { useEffect } from "react";
import { trackEnhancedConversion } from "@/lib/gtag";
import type { UserDataInput } from "@/lib/user-data";

type PurchaseParams = {
  transactionId?: string | null;
  value?: number | null;
  currency?: string | null;
};

export function GoogleEnhancedConversion({
  event,
  user,
  purchase,
}: {
  event: "generate_lead" | "purchase";
  user: UserDataInput;
  purchase?: PurchaseParams;
}) {
  const transactionId = purchase?.transactionId?.trim() || "";
  const value = typeof purchase?.value === "number" ? purchase.value : undefined;
  const currency = purchase?.currency?.toUpperCase() || undefined;

  useEffect(() => {
    if (transactionId && typeof sessionStorage !== "undefined") {
      const key = `ga-enhanced:${transactionId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    }

    trackEnhancedConversion(event, user, {
      transaction_id: transactionId || undefined,
      value,
      currency,
    });
    // Fire once per mount / confirmed payment — user is a server-passed snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, transactionId, value, currency]);

  return null;
}
