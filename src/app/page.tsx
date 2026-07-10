import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import MissionCards from "@/components/home/MissionCards";
import AboutSection from "@/components/home/AboutSection";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import LatestUpdates from "@/components/home/Announcements";
import Statistics from "@/components/home/Statistics";
import Footer from "@/components/layout/Footer";
import LeadershipMessage from "@/components/home/LeadershipMessage";
import NssCommittee from "@/components/home/NssCommittee";
import FeaturedActivities from "@/components/home/FeaturedActivities";
import VisitorTracker from "@/components/common/VisitorTracker";
export default function HomePage() {
  return (
    <>
    <VisitorTracker />
      <Navbar />

      <main className="bg-slate-50">
        <Hero />

        <MissionCards />

        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
            <AboutSection />
            <UpcomingEvents />
            <LatestUpdates />
          </div>
        </section>

       <LeadershipMessage />

        <NssCommittee />

<FeaturedActivities />

        <Statistics />
      </main>

      <Footer />
    </>
  );
}