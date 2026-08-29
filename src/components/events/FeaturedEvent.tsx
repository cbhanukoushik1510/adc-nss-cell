"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  location: string | null;
  image_url: string | null;
  status: string | null;
  event_type: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
  capacity: number | null;
  participants_count: number | null;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Date not available";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) {
    return null;
  }

  const parts = time.split(":");

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getVenue(event: EventRow) {
  return (
    event.location ||
    event.venue ||
    "Venue not specified"
  );
}

export default function FeaturedEvent() {
  const [event, setEvent] =
    useState<EventRow | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFeaturedEvent() {
      try {
        setLoading(true);
        setError("");

        /*
         * Today's date.
         *
         * Only events BEFORE today are considered
         * completed/past events.
         */
        const today = new Date()
          .toISOString()
          .split("T")[0];

        /*
         * Get the latest completed published event.
         *
         * Example:
         *
         * Aug 10  → completed
         * Aug 18  → completed
         * Aug 25  → completed  ← Featured
         * Sep 05  → upcoming
         *
         * Because we order descending, the most
         * recent completed event comes first.
         */
        const {
          data,
          error: eventsError,
        } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            location,
            image_url,
            status,
            event_type,
            is_published,
            registration_open,
            registration_deadline,
            capacity,
            participants_count
          `)
          .eq("is_published", true)
          .lt("event_date", today)
          .order("event_date", {
            ascending: false,
          })
          .order("start_time", {
            ascending: false,
          })
          .limit(1);

        if (eventsError) {
          console.error(
            "Featured event error:",
            eventsError
          );

          if (mounted) {
            setError(
              eventsError.message ||
                "Unable to load featured event."
            );
          }

          return;
        }

        if (mounted) {
          if (
            data &&
            data.length > 0
          ) {
            setEvent(
              data[0] as EventRow
            );
          } else {
            setEvent(null);
          }
        }
      } catch (err) {
        console.error(
          "Featured event error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load featured event."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFeaturedEvent();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * LOADING STATE
   */
  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-[#0F2B7B]">
            <Loader2
              size={26}
              className="animate-spin"
            />

            <span className="font-medium">
              Loading featured event...
            </span>
          </div>
        </div>
      </section>
    );
  }

  /*
   * ERROR STATE
   */
  if (error) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">
              Unable to load featured event
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * NO COMPLETED EVENT
   *
   * Don't show an empty card.
   */
  if (!event) {
    return null;
  }

  const startTime = formatTime(
    event.start_time
  );

  const endTime = formatTime(
    event.end_time
  );

  const venue = getVenue(event);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* SECTION HEADING */}
        <div className="mb-12 text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#0F2B7B]">
            <Star size={16} />

            Latest Completed Event
          </div>

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Featured Event
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Take a look at our latest completed NSS
            programme.
          </p>

        </div>

        {/* FEATURED EVENT */}
        <div className="overflow-hidden rounded-3xl bg-slate-50 shadow-xl">

          <div className="grid lg:grid-cols-2">

            {/* IMAGE */}
            <div className="relative min-h-[360px] overflow-hidden bg-[#0F2B7B]">

              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex min-h-[360px] h-full items-center justify-center">
                  <CalendarDays
                    size={100}
                    strokeWidth={1.2}
                    className="text-white"
                  />
                </div>
              )}

              {/* EVENT TYPE */}
              {event.event_type && (
                <div className="absolute left-6 top-6 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0F2B7B] shadow-lg">
                  {event.event_type}
                </div>
              )}

              {/* COMPLETED BADGE */}
              <div className="absolute bottom-6 left-6 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-700 shadow-lg">
                Completed
              </div>

            </div>

            {/* CONTENT */}
            <div className="flex flex-col justify-center p-8 lg:p-12">

              <h3 className="text-3xl font-bold text-[#0F2B7B] lg:text-4xl">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-5 leading-7 text-gray-600">
                  {event.description}
                </p>
              )}

              {/* EVENT DETAILS */}
              <div className="mt-8 space-y-4">

                {/* DATE */}
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                    <CalendarDays size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Event Date
                    </p>

                    <p className="font-semibold text-gray-800">
                      {formatDate(
                        event.event_date
                      )}
                    </p>
                  </div>

                </div>

                {/* TIME */}
                {(startTime || endTime) && (
                  <div className="flex items-center gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                      <Clock3 size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Time
                      </p>

                      <p className="font-semibold text-gray-800">
                        {startTime ||
                          "Time not specified"}

                        {endTime && (
                          <>
                            {" – "}
                            {endTime}
                          </>
                        )}
                      </p>
                    </div>

                  </div>
                )}

                {/* VENUE */}
                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Venue
                    </p>

                    <p className="font-semibold text-gray-800">
                      {venue}
                    </p>
                  </div>

                </div>

              </div>

              {/* COMPLETED STATUS */}
              <div className="mt-8">

                <span className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                  Event Completed
                </span>

              </div>

              {/* DETAILS BUTTON */}
              <div className="mt-8">

                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-7 py-3.5 font-semibold text-white transition hover:bg-[#143a96]"
                >
                  View Event Details

                  <ArrowRight size={18} />
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}