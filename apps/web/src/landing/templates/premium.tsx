import { BookingProcess } from "../components/BookingProcess";
import { ContactSection } from "../components/ContactSection";
import { FaqSection } from "../components/FaqSection";
import { FinalCTA } from "../components/FinalCTA";
import { Hero } from "../components/Hero";
import { ServicesPreview } from "../components/ServicesPreview";
import { TrustSection } from "../components/TrustSection";
import { CLIENT } from "../../config/client";

export function PremiumLandingTemplate() {
  const s = CLIENT.landing.sections;
  return (
    <>
      {s.hero && <Hero />}
      {s.trust && <TrustSection />}
      {s.services && <ServicesPreview />}
      {s.process && <BookingProcess />}
      {s.faq && <FaqSection />}
      {s.contact && <ContactSection />}
      {s.finalCta && <FinalCTA />}
    </>
  );
}
