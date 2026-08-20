export const SITE = {
  name: "Ivory Crown Collective",
  url: "https://ivorycrowncollective.com",
  description:
    "Ivory Crown Collective — web design, software & apps, and IT solutions. Book a project.",
  phoneDisplay: "(732) 233-8516",
  phoneTel: "+17322338516",
  // Normalized from phil@ivorycrowncollective@gmail.com (invalid double-@)
  email: "phil@ivorycrowncollective.com",
  shopUrl: "https://ivorycrowncollective.store",
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
      "Brand-first sites and interfaces built to convert — marketing pages, product UI, and digital presence with clear structure.",
  },
  {
    id: "software-apps",
    title: "Software & Apps",
    blurb:
      "Custom web apps and lightweight software — workflows, dashboards, and tools shaped around how your business actually runs.",
  },
  {
    id: "it-solutions",
    title: "IT Solutions",
    blurb:
      "Practical systems work — stack decisions, integrations, and tooling that keep your operation sharp and maintainable.",
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
    category: "Software & Apps",
    title: "Product UI & tooling",
    status:
      "Custom interfaces and light app work that turn messy processes into clear, usable software.",
  },
  {
    category: "IT Solutions",
    title: "Systems & integrations",
    status:
      "Stack decisions, automations, and integrations that keep small operations sharp.",
  },
] as const;
