import { BookingProcess } from "../components/BookingProcess";
import { ContactSection } from "../components/ContactSection";
import { FaqSection } from "../components/FaqSection";
import { FinalCTA } from "../components/FinalCTA";
import { Hero } from "../components/Hero";
import { ServicesPreview } from "../components/ServicesPreview";
import { TrustSection } from "../components/TrustSection";

export function PremiumLandingTemplate() {
  return (
    <>
      <Hero />
      <TrustSection />
      <ServicesPreview />
      <BookingProcess />
      <FaqSection />
      <ContactSection />
      <FinalCTA />
    </>
  );
}
