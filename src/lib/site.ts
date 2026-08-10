export const SITE = {
  name: "Ivory Crown Collective",
  url: "https://ivorycrowncollective.com",
  description:
    "Ivory Crown Collective — web design, entertainment, and IT solutions. Book a project or gig.",
  phoneDisplay: "(732) 233-8516",
  phoneTel: "+17322338516",
  // Normalized from phil@ivorycrowncollective@gmail.com (invalid double-@)
  email: "phil@ivorycrowncollective.com",
  // Prefer the public shop URL from env. Keep myshopify as the safe default
  // until shop.ivorycrowncollective.com DNS + Shopify primary domain are live.
  shopUrl:
    process.env.NEXT_PUBLIC_SHOP_URL || "https://1wtpc0-c2.myshopify.com",
  shopLabel: "Costume shop",
  founder: {
    name: "Philip S. Kraft",
    title: "CEO",
    headshotSrc: "/brand/headshot.jpg",
    initials: "PSK",
  },
} as const;

export const SERVICES = [
  {
    id: "web-design",
    title: "Web Design",
    blurb:
      "Sites and interfaces that feel intentional — brand-first pages, product UI, and digital presence built to convert.",
  },
  {
    id: "entertainment",
    title: "Entertainment",
    blurb:
      "DJ sets and live energy for events that need presence. Clean transitions, reading the room, locking the vibe.",
  },
  {
    id: "it-solutions",
    title: "IT Solutions",
    blurb:
      "Practical software and systems work — from light tooling to stack decisions that keep your operation sharp.",
  },
] as const;

export const FEATURED_PROJECT = {
  category: "Web Design",
  title: "The Rosenfeld Ranch",
  summary:
    "A dual-destination site for a New Jersey petting farm and puppy experience — clear paths for Howell and Lakewood, built to feel warm, local, and easy to book.",
  href: "https://rosenfeldranch.com",
  hrefLabel: "rosenfeldranch.com",
  meta: "Live · Howell & Lakewood, NJ",
} as const;

export const PORTFOLIO = [
  {
    category: "Entertainment",
    title: "Event & nightlife sets",
    status:
      "DJ sets and live energy for private events, parties, and nights that need a locked-in room.",
  },
  {
    category: "IT Solutions",
    title: "Product & tooling",
    status:
      "Light software, automations, and stack decisions that keep small operations sharp.",
  },
] as const;
