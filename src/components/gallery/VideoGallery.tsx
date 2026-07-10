import { Video } from "lucide-react";

export default function VideoGallery() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6 text-center">

        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

          <Video size={36} />

        </div>

        <h2 className="text-4xl font-bold text-[#0F2B7B]">

          Video Highlights

        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">

          Event videos, volunteer interviews and programme highlights
          will be available soon.

        </p>

        <div className="mt-12 rounded-3xl bg-slate-100 py-24">

          <div className="text-8xl">

            🎬

          </div>

          <h3 className="mt-6 text-3xl font-bold text-[#0F2B7B]">

            Videos Coming Soon

          </h3>

        </div>

      </div>

    </section>
  );
}