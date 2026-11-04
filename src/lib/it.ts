export const IT_PACKAGES = [
  {
    offeringId: "it-basic",
    name: "Basic",
    audience: "One system",
    summary: "A single system set up, cleaned up, and written down.",
    featured: false,
  },
  {
    offeringId: "it-pro",
    name: "Pro",
    audience: "A small team",
    summary: "The tools a small team already pays for, connected and written down.",
    featured: true,
  },
  {
    offeringId: "it-max",
    name: "Max",
    audience: "The whole operation",
    summary: "A full pass across the stack, access, and backups, with a faster reply.",
    featured: false,
  },
] as const;

export const IT_ROWS = [
  {
    label: "Scope",
    values: ["1 system you already use", "Up to 3 systems", "The tools you rely on"],
  },
  {
    label: "Integrations",
    values: ["Setup of that one system", "1 connection between tools", "Up to 5 connections"],
  },
  {
    label: "People",
    values: ["Up to 5 accounts", "Up to 15 accounts", "Team access and a security pass"],
  },
  {
    label: "Written record",
    values: ["Short guide", "Runbook", "Runbook and a backup plan"],
  },
  {
    label: "Check-ins",
    values: ["1 after it is live", "2", "2, plus one at 30 days"],
  },
  {
    label: "Reply",
    values: ["During the engagement", "During the engagement", "Faster reply during the work"],
  },
  {
    label: "Delivery",
    values: ["7 days", "10 days", "14 days"],
  },
] as const;
