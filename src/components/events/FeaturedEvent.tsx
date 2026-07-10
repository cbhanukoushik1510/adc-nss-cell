import { CalendarDays, Clock3, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FeaturedEvent() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Featured Event
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Don't miss our highlighted upcoming NSS programme.
          </p>
        </div>

        <div className="grid items-center gap-10 rounded-3xl bg-[#0F2B7B] p-10 text-white shadow-2xl lg:grid-cols-2">

          {/* Event Image */}

          <div className="flex h-80 items-center justify-center rounded-3xl bg-white/10 text-8xl">
            ❤️
          </div>

          {/* Event Details */}

          <div>

            <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-[#0F2B7B]">
              Featured Event
            </span>

            <h3 className="mt-6 text-4xl font-bold">
              Blood Donation Camp
            </h3>

            <p className="mt-6 leading-8 text-blue-100">
              Join us in saving lives by participating in our annual Blood
              Donation Camp. Every donation can make a life-changing
              difference.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3">
                <CalendarDays size={20} />
                15 August 2026
              </div>

              <div className="flex items-center gap-3">
                <Clock3 size={20} />
                9:00 AM – 3:00 PM
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={20} />
                College Seminar Hall
              </div>

            </div>

            <Link
              href="#"
              className="mt-10 inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-8 py-4 font-bold text-[#0F2B7B] transition hover:bg-yellow-300"
            >
              View Details
              <ArrowRight size={20} />
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}