export const CARE_IMAGES = {
  hero: {
    src: "/care/01-monthly-website-care.png",
    alt: "Ivory Crown Collective monthly website care, priced at $150, $400, and $800.",
    width: 1280,
    height: 769,
  },
  packages: {
    src: "/care/02-packages.png",
    alt: "Three monthly packages: Site care, Site and app care, and Full monthly support.",
    width: 1280,
    height: 769,
  },
  month: {
    src: "/care/03-how-a-month-works.png",
    alt: "How a month works: send the link, the work comes back, then order the next month.",
    width: 1280,
    height: 769,
  },
} as const;

export type CarePackage = {
  offeringId: "monthly-site-care" | "monthly-site-app-care" | "monthly-full-support";
  eyebrow: string;
  summary: string;
  delivery: string;
  rush: string;
  included: readonly string[];
  looksLike: readonly string[];
};

export const CARE_PACKAGES: readonly CarePackage[] = [
  {
    offeringId: "monthly-site-care",
    eyebrow: "A light month",
    summary:
      "For a small, live site that needs a short list handled with care, then a check-in.",
    delivery: "Delivered in 7 days",
    rush: "Faster delivery is 3 days for $75.",
    included: [
      "Updates on up to 3 pages",
      "1 plugin, installed and checked",
      "Content uploads from files you send",
      "One check-in on the finished work",
      "Responsive updates and social icons",
    ],
    looksLike: [
      "A new homepage photo and updated hours",
      "A broken button and a stray link put right",
      "One plugin you have already chosen",
    ],
  },
  {
    offeringId: "monthly-site-app-care",
    eyebrow: "Site plus the tool behind it",
    summary: "For a live site that also has a web app, and a month that includes a form.",
    delivery: "Delivered in 5 days",
    rush: "Faster delivery is 2 days for $100.",
    included: [
      "Updates on up to 8 pages",
      "3 plugins, installed and checked",
      "One opt-in form on a page you already have",
      "Small fixes to an existing web app",
      "Content uploads, responsive updates, and social icons",
    ],
    looksLike: [
      "Copy and photos refreshed across the pages in the package",
      "A newsletter form placed on an existing page",
      "A small bug corrected in a tool your customers already use",
    ],
  },
  {
    offeringId: "monthly-full-support",
    eyebrow: "The full month",
    summary:
      "For the month when the pages, the app, and the technical work belong in one pair of hands, with a faster reply.",
    delivery: "Delivered in 3 days",
    rush: "Faster delivery is 1 day for $125.",
    included: [
      "Updates on up to 15 pages",
      "5 plugins, installed and checked",
      "One opt-in form",
      "One email-tool connection, for a tool you already pay for",
      "App fixes, plus IT or integration support",
      "A faster reply during the order",
    ],
    looksLike: [
      "A wide content pass across the pages in the package",
      "A broken workflow in the existing app put back in order",
      "Mailchimp, Klaviyo, or a similar tool connected",
    ],
  },
] as const;

export const CARE_ADDONS = [
  { name: "Extra page", detail: "One more page, from your text and images", price: "$75" },
  { name: "Extra plugin", detail: "One more plugin, installed and checked", price: "$40" },
  { name: "Opt-in form", detail: "One form on a page you already have", price: "$60" },
  { name: "Email-tool connection", detail: "One tool you already pay for", price: "$90" },
  { name: "Extra hour", detail: "Updates, fixes, or setup beyond the package", price: "$95" },
] as const;
