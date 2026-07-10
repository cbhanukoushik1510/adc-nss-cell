import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/documents/Hero";
import Downloads from "@/components/documents/Downloads";
import Circulars from "@/components/documents/Circulars";
import Forms from "@/components/documents/Forms";
import Reports from "@/components/documents/Reports";

export default function DocumentsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">
        <Hero />
        <Downloads />
        <Circulars />
        <Forms />
        <Reports />
      </main>

      <Footer />
    </>
  );
}