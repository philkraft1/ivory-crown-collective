import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Pay } from "@/components/Pay";
import { Portfolio } from "@/components/Portfolio";
import { Services } from "@/components/Services";
import { SiteFooter } from "@/components/SiteFooter";

export function Landing() {
  return (
    <>
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <Pay />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
