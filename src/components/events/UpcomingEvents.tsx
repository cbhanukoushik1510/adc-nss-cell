import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
} from "lucide-react";

const events = [
  {
    emoji: "🌱",
    title: "Tree Plantation Drive",
    date: "12 August 2026",
    time: "8:30 AM",
    venue: "College Campus",
    description:
      "Join us in making our campus greener by participating in our plantation drive.",
  },
  {
    emoji: "🩸",
    title: "Blood Donation Camp",
    date: "18 August 2026",
    time: "9:00 AM",
    venue: "Seminar Hall",
    description:
      "Donate blood and help save lives through our annual blood donation programme.",
  },
  {
    emoji: "🧹",
    title: "Swachh Bharat Drive",
    date: "24 August 2026",
    time: "7:30 AM",
    venue: "Nearby Community",
    description:
      "Promote cleanliness and hygiene by participating in the community cleanliness drive.",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Upcoming Events
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Register and participate in our upcoming NSS programmes.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {events.map((event, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              {/* Image Placeholder */}

              <div className="flex h-56 items-center justify-center bg-[#0F2B7B] text-7xl">
                {event.emoji}
              </div>

              {/* Content */}

              <div className="p-8">

                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  {event.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-7">
                  {event.description}
                </p>

                <div className="mt-6 space-y-3 text-gray-700">

                  <div className="flex items-center gap-3">
                    <CalendarDays size={18} />
                    {event.date}
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock3 size={18} />
                    {event.time}
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin size={18} />
                    {event.venue}
                  </div>

                </div>

                <Link
                  href="#"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                >
                  View Details
                  <ArrowRight size={18} />
                </Link>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}