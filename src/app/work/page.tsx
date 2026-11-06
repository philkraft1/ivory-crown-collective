import type { Metadata } from "next";
import { Portfolio } from "@/components/Portfolio";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected work from Ivory Crown Collective.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return <Portfolio />;
}
