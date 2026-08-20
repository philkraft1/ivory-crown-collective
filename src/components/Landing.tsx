import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Pay } from "@/components/Pay";
import { Portfolio } from "@/components/Portfolio";
import { Services } from "@/components/Services";

export function Landing() {
  return (
    <main>
      <Hero />
      <Services />
      <Portfolio />
      <Pay />
      <Contact />
    </main>
  );
}
