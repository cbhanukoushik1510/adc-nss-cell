import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/join/Hero";
import WhyJoin from "@/components/join/WhyJoin";
import VisionMission from "@/components/join/VisionMission";
import Benefits from "@/components/join/Benefits";
import Eligibility from "@/components/join/Eligibility";
import RegistrationProcess from "@/components/join/RegistrationProcess";
import ImpactStats from "@/components/join/ImpactStats";
import FAQ from "@/components/join/FAQ";
import RegisterCTA from "@/components/join/RegisterCTA";
import ContactOfficer from "@/components/join/ContactOfficer";

export default function JoinPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <WhyJoin />

        <VisionMission />

        <Benefits />

        <Eligibility />

        <RegistrationProcess />

        <ImpactStats />

        <FAQ />

        <RegisterCTA />

        <ContactOfficer />

      </main>

      <Footer />
    </>
  );
}