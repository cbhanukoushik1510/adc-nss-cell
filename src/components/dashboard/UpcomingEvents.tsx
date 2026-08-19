"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  image_url: string | null;
  status: string;
  capacity: number | null;
  participants_count: number;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        event_date,
        start_time,
        end_time,
        venue,
        image_url,
        status,
        capacity,
        participants_count
      `)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(3);

    if (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Time not specified";

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          Upcoming Events
        </h2>

        <p className="mt-6 text-gray-500">
          Loading events...
        </p>
      </section>
    );
  }

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

      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-400" />

          <p className="mt-4 font-semibold text-gray-600">
            No upcoming events
          </p>

          <p className="mt-1 text-sm text-gray-400">
            New NSS events will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {events.map((event) => (

            <div
              key={event.id}
              className="overflow-hidden rounded-2xl border transition hover:shadow-lg"
            >

              <div className="relative h-44 w-full bg-slate-200">

                {event.image_url ? (
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <CalendarDays
                      size={50}
                      className="text-gray-400"
                    />
                  </div>
                )}

              </div>

              <div className="p-6">

                <div className="flex items-center justify-between gap-4">

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
                    {formatDate(event.event_date)}
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock3 size={18} />
                    {formatTime(event.start_time)}
                  </div>

                  {event.venue && (
                    <div className="flex items-center gap-3">
                      <MapPin size={18} />
                      {event.venue}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users size={18} />

                    {event.participants_count}
                    {event.capacity
                      ? `/${event.capacity}`
                      : ""}{" "}
                    Participants
                  </div>

                </div>

                <button
                  type="button"
                  className="mt-6 w-full rounded-xl bg-[#0F2B7B] py-3 font-semibold text-white transition hover:bg-[#1E40AF]"
                >
                  View Details
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}