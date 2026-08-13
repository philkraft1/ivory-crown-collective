export type PayOffering = {
  id: string;
  serviceId: "web-design" | "software-apps" | "it-solutions" | "consult";
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
    id: "it-solutions-deposit",
    serviceId: "it-solutions",
    title: "IT Solutions Deposit",
    description: "Kickoff deposit for systems, integrations, or IT project work.",
    amountCents: 30000,
    label: "$300 deposit",
  },
  {
    id: "consult-retainer",
    serviceId: "consult",
    title: "Strategy Consult",
    description: "Paid consult with Philip S. Kraft — credited toward larger work if you proceed.",
    amountCents: 10000,
    label: "$100 consult",
  },
];

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
