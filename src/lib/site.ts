export const SITE = {
  name: "Ivory Crown Collective",
  url: "https://ivorycrowncollective.com",
  description:
    "Ivory Crown Collective builds websites, software, and IT systems. Choose a service to get started.",
  phoneDisplay: "(732) 233-8516",
  phoneTel: "+17322338516",
  // Normalized from phil@ivorycrowncollective@gmail.com (invalid double-@)
  email: "phil@ivorycrowncollective.com",
  ebayUrl: "https://www.ebay.com/str/ivorycrowncollective",
  ebayLabel: "eBay",
  gaMeasurementId: "G-M0286DKYRS",
  adsenseClient: "ca-pub-1650615821073381",
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
    href: "/services/web-design",
    title: "Web Design",
    line: "Sites with a clear next step.",
    lede: "Marketing pages and product sites, laid out so a visitor understands the work and knows what to do next.",
    points: [
      "A structure people can follow without a tour",
      "Pages written around the work you actually do",
      "A layout that still feels like your business on a phone",
    ],
    offeringId: "web-design-deposit",
    interest: "Web Design",
  },
  {
    id: "software-apps",
    href: "/services/software-apps",
    title: "Software & Apps",
    line: "Tools built around the work.",
    lede: "Custom web apps and small software for a process that has outgrown a spreadsheet or a pile of messages.",
    points: [
      "Workflows, dashboards, and internal tools",
      "Screens that match how the work already happens",
      "Software your team can keep using after launch",
    ],
    offeringId: "software-apps-deposit",
    interest: "Software & Apps",
  },
  {
    id: "it-solutions",
    href: "/services/it-solutions",
    title: "IT Solutions",
    line: "Systems that stay understandable.",
    lede: "Stack choices, connections between the tools you already pay for, and the setup that keeps a small operation running.",
    points: [
      "A recommendation you can act on",
      "Integrations between the systems you already use",
      "Notes the next person can follow",
    ],
    offeringId: "it-pro",
    interest: "IT Solutions",
  },
] as const;

export const CARE_DOOR = {
  id: "monthly-care",
  href: "/services/monthly-care",
  title: "Monthly Care",
  line: "Upkeep for a site you already have.",
  lede: "Updates, fixes, and a check-in, sized as one month. You send the site, a way in, and a short list.",
  interest: "Monthly website care",
} as const;

export const DOORS = [
  ...SERVICES.map((service) => ({
    href: service.href,
    title: service.title,
    line: service.line,
  })),
  {
    href: CARE_DOOR.href,
    title: CARE_DOOR.title,
    line: CARE_DOOR.line,
  },
] as const;

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
