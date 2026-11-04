import type { Metadata } from "next";
import { Contact } from "@/components/Contact";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a note to Ivory Crown Collective about a website, a piece of software, or IT help.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string }>;
}) {
  const { interest } = await searchParams;

  return (
    <PageShell wide>
      <Contact interest={interest} />
    </PageShell>
  );
}
