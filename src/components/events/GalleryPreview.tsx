import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";

const gallery = [
  {
    emoji: "🌱",
    title: "Tree Plantation",
  },
  {
    emoji: "🩸",
    title: "Blood Donation Camp",
  },
  {
    emoji: "🧹",
    title: "Swachh Bharat Drive",
  },
  {
    emoji: "🩺",
    title: "Health Camp",
  },
  {
    emoji: "📢",
    title: "Awareness Rally",
  },
  {
    emoji: "🤝",
    title: "Community Service",
  },
];

export default function GalleryPreview() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0F2B7B] text-white">
            <Images size={36} />
          </div>

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Event Gallery
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            A glimpse of memorable moments from our NSS activities.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {gallery.map((item, index) => (

            <div
              key={index}
              className="group overflow-hidden rounded-3xl bg-slate-50 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              {/* Placeholder */}

              <div className="flex h-64 items-center justify-center bg-[#0F2B7B] text-8xl transition group-hover:scale-105">
                {item.emoji}
              </div>

              <div className="p-6">

                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  {item.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  Photos from our NSS programme.
                </p>

              </div>

            </div>

          ))}

        </div>

        <div className="mt-14 text-center">

          <Link
            href="/gallery"
            className="inline-flex items-center gap-3 rounded-xl bg-[#0F2B7B] px-8 py-4 text-lg font-semibold text-white transition hover:bg-[#143a96]"
          >
            View Full Gallery
            <ArrowRight size={20} />
          </Link>

        </div>

      </div>
    </section>
  );
}