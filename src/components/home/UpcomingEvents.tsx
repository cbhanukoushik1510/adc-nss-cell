"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  image_url: string | null;
  status: string;
  event_time: string | null;
  event_type: string | null;
  location: string | null;
  registration_link: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      setLoading(true);
      setError("");

      try {
        /*
         * Only show events created in the EVENTS table.
         *
         * We deliberately do NOT use:
         * attendance
         * attendance_events
         * attendance_records
         */

        const { data, error: eventsError } = await supabase
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
            event_time,
            event_type,
            location,
            registration_link,
            is_published,
            registration_open,
            registration_deadline
          `)
          .eq("is_published", true)
          .order("event_date", { ascending: true })
          .order("start_time", { ascending: true })
          .limit(3);

        if (eventsError) {
          console.error("Upcoming events loading error:", eventsError);
          throw new Error(
            eventsError.message || "Unable to load upcoming events."
          );
        }

        if (mounted) {
          setEvents((data ?? []) as EventItem[]);
        }
      } catch (err) {
        console.error("Upcoming events loading error:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load upcoming events."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const formatDateParts = (dateString: string) => {
    if (!dateString) {
      return {
        day: "--",
        month: "---",
      };
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return {
        day: "--",
        month: "---",
      };
    }

    return {
      day: date.toLocaleDateString("en-IN", {
        day: "2-digit",
      }),
      month: date.toLocaleDateString("en-IN", {
        month: "short",
      }),
    };
  };

  const formatTime = (
    value: string | null
  ) => {
    if (!value) return "";

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hour = Number(parts[0]);
    const minute = parts[1];

    if (Number.isNaN(hour)) {
      return value;
    }

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
  };

  const getEventTime = (event: EventItem) => {
    if (event.start_time) {
      const start = formatTime(event.start_time);

      if (event.end_time) {
        return `${start} - ${formatTime(event.end_time)}`;
      }

      return start;
    }

    if (event.event_time) {
      return formatTime(event.event_time);
    }

    return "";
  };

  const getVenue = (event: EventItem) => {
    return event.venue || event.location || "";
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          Upcoming Events
        </h2>

        <Link
          href="/events"
          className="shrink-0 text-sm font-semibold text-[#0F2B7B] transition hover:underline"
        >
          View All
        </Link>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin text-[#0F2B7B]" />
            Loading events...
          </div>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">
          Unable to load events.
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && events.length === 0 && (
        <div className="rounded-xl bg-slate-50 p-8 text-center">
          <CalendarDays className="mx-auto h-9 w-9 text-gray-400" />

          <p className="mt-3 font-semibold text-gray-700">
            No upcoming events
          </p>

          <p className="mt-1 text-sm text-gray-500">
            New published events will appear here.
          </p>
        </div>
      )}

      {/* EVENTS */}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-6">
          {events.map((event) => {
            const date = formatDateParts(
              event.event_date
            );

            const time = getEventTime(event);
            const venue = getVenue(event);

            return (
              <div
                key={event.id}
                className="flex gap-4 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0"
              >
                {/* DATE */}

                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0F2B7B] text-white">
                  <span className="text-xl font-bold">
                    {date.day}
                  </span>

                  <span className="text-xs uppercase">
                    {date.month}
                  </span>
                </div>

                {/* INFO */}

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-6 text-gray-800">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    {time && (
                      <div className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {time}
                      </div>
                    )}

                    {venue && (
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {venue}
                      </div>
                    )}
                  </div>
                </div>

                {/* VIEW */}

                <div className="shrink-0">
                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0F2B7B] px-3 py-2 text-sm font-semibold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                  >
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}