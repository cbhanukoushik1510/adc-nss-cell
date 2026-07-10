import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/events/Hero";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import PastEvents from "@/components/events/PastEvents";
import EventCalendar from "@/components/events/EventCalender";
import GalleryPreview from "@/components/events/GalleryPreview";
import EventsCTA from "@/components/events/EventCTA";

export default function EventsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <UpcomingEvents />

        <FeaturedEvent />

        <PastEvents />

        <EventCalendar />

        <GalleryPreview />

        <EventsCTA />

      </main>

      <Footer />
    </>
  );
}