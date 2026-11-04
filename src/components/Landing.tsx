import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { MonthlyCare } from "@/components/MonthlyCare";
import { Pay } from "@/components/Pay";
import { Portfolio } from "@/components/Portfolio";
import { Services } from "@/components/Services";

export function Landing() {
  return (
    <main>
      <Hero />
      <Services />
      <MonthlyCare />
      <Portfolio />
      <Pay />
      <Contact />
    </main>
  );
}
