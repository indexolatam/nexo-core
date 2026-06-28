import { ContactSection } from "../components/ContactSection";
import { FinalCTA } from "../components/FinalCTA";
import { Hero } from "../components/Hero";
import { CLIENT } from "../../config/client";

export function MinimalLandingTemplate() {
  const s = CLIENT.landing.sections;
  return (
    <>
      {s.hero && <Hero />}
      {s.contact && <ContactSection />}
      {s.finalCta && <FinalCTA />}
    </>
  );
}
