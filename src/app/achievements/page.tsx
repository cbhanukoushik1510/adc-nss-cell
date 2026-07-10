import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/achievements/Hero";
import Awards from "@/components/achievements/Awards";
import Statistics from "@/components/achievements/Statistics";
import SuccessStories from "@/components/achievements/SuccessStories";
import SpecialCamp from "@/components/achievements/SpecialCamp";
import Timeline from "@/components/achievements/TimeLine";

export default function AchievementsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">
        <Hero />
        <Awards />
        <Statistics />
        <SuccessStories />
        <SpecialCamp />
        <Timeline />
      </main>

      <Footer />
    </>
  );
}