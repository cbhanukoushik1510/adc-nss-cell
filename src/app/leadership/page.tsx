import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/leadership/Hero";
import YearTabs from "@/components/leadership/YearTabs";
import LeadershipTimeline from "@/components/leadership/LeadershipTimeline";

export default function LeadershipPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <YearTabs />

        <LeadershipTimeline />

      </main>

      <Footer />
    </>
  );
}