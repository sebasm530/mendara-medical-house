import { HeroSection } from "@/components/HeroSection";
import { InvitationSection } from "@/components/InvitationSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CommunityBenefitsSection } from "@/components/CommunityBenefitsSection";
import { ConsultingRoomsSection } from "@/components/ConsultingRoomsSection";
import { DoctorSection } from "@/components/DoctorSection";
import { FacilitiesSection } from "@/components/FacilitiesSection";
import { LocationSection } from "@/components/LocationSection";
import { InvestmentSection } from "@/components/InvestmentSection";
import phaseFourStyles from "@/components/LocationInvestment.module.css";
import { ContactSection } from "@/components/ContactSection";
import { ClosingSection } from "@/components/ClosingSection";
import { MotionExperience } from "@/components/motion/MotionExperience";
import { FaqSection } from "@/components/FaqSection";

export default function Home() {
  return (
    <>
    <MotionExperience />
    <main>
      <HeroSection />
      <InvitationSection />
      <ConsultingRoomsSection />
      <BenefitsSection />
      <CommunityBenefitsSection />
      <DoctorSection />
      <FacilitiesSection />
      <div className={phaseFourStyles.composition}>
        <LocationSection />
        <InvestmentSection />
      </div>
      <FaqSection />
      <ContactSection />
    </main>
    <ClosingSection />
    </>
  );
}
