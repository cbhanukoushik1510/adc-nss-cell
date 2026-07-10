import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/gallery/Hero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import VideoGallery from "@/components/gallery/VideoGallery";
import GalleryCTA from "@/components/gallery/GalleryCTA";

export default function GalleryPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50">

        <Hero />

        <GalleryGrid />

        <VideoGallery />

        <GalleryCTA />

      </main>

      <Footer />
    </>
  );
}