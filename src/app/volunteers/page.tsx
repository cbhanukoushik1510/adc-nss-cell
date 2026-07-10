import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/volunteers/Hero";
import VolunteerLife from "@/components/volunteers/VolunteerLife";
import Responsibilities from "@/components/volunteers/Responsibilities";
import Benefits from "@/components/volunteers/Benefits";
import Testimonials from "@/components/volunteers/Testimonials";
import VolunteerJourney from "@/components/volunteers/VolunteerJourney";
import VolunteerCTA from "@/components/volunteers/VolunteerCTA";

export default function VolunteersPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">
        <Hero />
        <VolunteerLife />
        <Responsibilities />
        <Benefits />
        <Testimonials />
        <VolunteerJourney />
        <VolunteerCTA />
      </main>

      <Footer />
    </>
  );
}