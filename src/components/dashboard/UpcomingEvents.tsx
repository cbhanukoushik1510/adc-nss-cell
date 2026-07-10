import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { upcomingEvents } from "@/data/events";

export default function UpcomingEvents() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          Upcoming Events
        </h2>

        <Link
          href="/dashboard/events"
          className="text-sm font-semibold text-[#0F2B7B]"
        >
          View All →
        </Link>

      </div>

      <div className="space-y-6">

        {upcomingEvents.map((event) => (

          <div
            key={event.id}
            className="overflow-hidden rounded-2xl border transition hover:shadow-lg"
          >

            <div className="relative h-44 w-full bg-slate-200">

              <Image
                src={event.image}
                alt={event.title}
                fill
                className="object-cover"
              />

            </div>

            <div className="p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-bold text-[#0F2B7B]">
                  {event.title}
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  {event.status}
                </span>

              </div>

              <div className="mt-5 space-y-3 text-gray-600">

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

                <div className="flex items-center gap-3">
                  <Users size={18} />
                  {event.participants}/{event.capacity} Participants
                </div>

              </div>

              <button className="mt-6 w-full rounded-xl bg-[#0F2B7B] py-3 font-semibold text-white transition hover:bg-[#1E40AF]">
                View Details
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}