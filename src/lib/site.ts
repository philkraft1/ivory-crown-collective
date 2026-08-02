export const SITE = {
  name: "Ivory Crown Collective",
  url: "https://ivorycrowncollective.com",
  description:
    "Ivory Crown Collective — web design, entertainment, and IT solutions. Book a project or gig.",
  phoneDisplay: "(732) 233-8516",
  phoneTel: "+17322338516",
  // Normalized from phil@ivorycrowncollective@gmail.com (invalid double-@)
  email: "phil@ivorycrowncollective.com",
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

export const PORTFOLIO = [
  {
    category: "Web Design",
    title: "Brand & web systems",
    status: "Selected work arriving soon",
  },
  {
    category: "Entertainment",
    title: "Event & nightlife sets",
    status: "Booking calendar opening soon",
  },
  {
    category: "IT Solutions",
    title: "Product & tooling",
    status: "Case notes coming soon",
  },
] as const;
