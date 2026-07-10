import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/about/Hero";
import History from "@/components/about/History";
import VisionMission from "@/components/about/VisionMission";
import Objectives from "@/components/about/Objectives";
import NSSCommittee from "@/components/about/NSSCommittee";
import ProgrammeOfficer from "@/components/about/ProgrammeOfficer";
import CollegeInfo from "@/components/about/CollegeInfo";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <History />

        <VisionMission />

        <Objectives />

        <NSSCommittee />

        <ProgrammeOfficer />

        <CollegeInfo />

      </main>

      <Footer />
    </>
  );
}