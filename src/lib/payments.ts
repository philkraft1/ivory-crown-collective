export type PayServiceId =
  | "web-design"
  | "software-apps"
  | "it-solutions"
  | "consult"
  | "monthly-care";

export type PayOffering = {
  id: string;
  serviceId: PayServiceId;
  title: string;
  description: string;
  amountCents: number;
  label: string;
};

export const PAY_OFFERINGS: PayOffering[] = [
  {
    id: "web-design-deposit",
    serviceId: "web-design",
    title: "Web Design Deposit",
    description: "Project kickoff deposit applied to your web design engagement.",
    amountCents: 50000,
    label: "$500 deposit",
  },
  {
    id: "software-apps-deposit",
    serviceId: "software-apps",
    title: "Software & Apps Deposit",
    description: "Kickoff deposit for custom web apps, product UI, or software work.",
    amountCents: 30000,
    label: "$300 deposit",
  },
  {
    id: "it-basic",
    serviceId: "it-solutions",
    title: "IT Basic",
    description:
      "One system you already use, set up for up to 5 people, with a short guide and one check-in. Delivered in 7 days.",
    amountCents: 45000,
    label: "$450",
  },
  {
    id: "it-pro",
    serviceId: "it-solutions",
    title: "IT Pro",
    description:
      "Up to 3 systems, one integration, access for up to 15 people, a runbook, and two check-ins. Delivered in 10 days.",
    amountCents: 120000,
    label: "$1,200",
  },
  {
    id: "it-max",
    serviceId: "it-solutions",
    title: "IT Max",
    description:
      "The tools you rely on, up to 5 integrations, a security pass, a backup plan, and a faster reply. Delivered in 14 days.",
    amountCents: 240000,
    label: "$2,400",
  },
  {
    id: "consult-retainer",
    serviceId: "consult",
    title: "Strategy Consult",
    description: "Paid consult with Philip S. Kraft — credited toward larger work if you proceed.",
    amountCents: 10000,
    label: "$100 consult",
  },
  {
    id: "monthly-site-care",
    serviceId: "monthly-care",
    title: "Site care — one month",
    description:
      "One month of small page updates, bug fixes, and one check-in on a site you already have. Up to 3 pages and 1 plugin. Delivered in 7 days.",
    amountCents: 15000,
    label: "$150",
  },
  {
    id: "monthly-site-app-care",
    serviceId: "monthly-care",
    title: "Site and app care — one month",
    description:
      "One month of site updates, one opt-in form, and small fixes to an existing web app. Up to 8 pages and 3 plugins. Delivered in 5 days.",
    amountCents: 40000,
    label: "$400",
  },
  {
    id: "monthly-full-support",
    serviceId: "monthly-care",
    title: "Full monthly support — one month",
    description:
      "One month of site care, app fixes, and IT or integration support, with a faster reply. Up to 15 pages, 5 plugins, one form, and one email-tool connection. Delivered in 3 days.",
    amountCents: 80000,
    label: "$800",
  },
];

export const DEPOSIT_OFFERINGS = PAY_OFFERINGS.filter(
  (item) => item.serviceId !== "monthly-care" && item.serviceId !== "it-solutions",
);

export const IT_OFFERINGS = PAY_OFFERINGS.filter((item) => item.serviceId === "it-solutions");

export const MONTHLY_CARE_OFFERINGS = PAY_OFFERINGS.filter(
  (item) => item.serviceId === "monthly-care",
);

export function getOffering(id: string): PayOffering | undefined {
  return PAY_OFFERINGS.find((item) => item.id === id);
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function randomIntegrationSuffix(length = 8): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}
