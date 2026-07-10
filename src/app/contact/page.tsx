import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/contact/Hero";
import ContactForm from "@/components/contact/ContactForm";
import OfficerCard from "@/components/contact/OfficerCard";
import Location from "@/components/contact/Location";
import SocialMedia from "@/components/contact/SocialMedia";

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <OfficerCard />

        <ContactForm />

        <Location />

        <SocialMedia />

      </main>

      <Footer />
    </>
  );
}