"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HASH_ROUTES: Record<string, string> = {
  "#web-design": "/services/web-design",
  "#software-apps": "/services/software-apps",
  "#it-solutions": "/services/it-solutions",
  "#monthly-care": "/services/monthly-care",
  "#about": "/work",
  "#pay": "/book",
  "#contact": "/contact",
};

export function HashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const destination = HASH_ROUTES[window.location.hash];
    if (destination) router.replace(destination);
  }, [router]);

  return null;
}
