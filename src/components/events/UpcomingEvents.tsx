"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  ArrowRight,
  Loader2,
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
  if (!date) return "Date not available";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function formatTime(time: string | null) {
  if (!time) return null;

  const parts = time.split(":");

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getLocation(event: EventRow) {
  return (
    event.location ||
    event.venue ||
    "Venue not specified"
  );
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUpcomingEvents() {
      try {
        setLoading(true);
        setError("");

        const today = new Date()
          .toISOString()
          .split("T")[0];

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
          .gte("event_date", today)
          .order("event_date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          })
          .limit(3);

        if (eventsError) {
          console.error(
            "Upcoming events error:",
            eventsError
          );

          if (isMounted) {
            setError(
              eventsError.message ||
                "Unable to load upcoming events."
            );
          }

          return;
        }

        if (isMounted) {
          setEvents((data || []) as EventRow[]);
        }
      } catch (err) {
        console.error(
          "Upcoming events error:",
          err
        );

        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load upcoming events."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUpcomingEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* SECTION HEADING */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Upcoming Events
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Register and participate in our upcoming
            NSS programmes.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-[#0F2B7B]">
              <Loader2
                size={26}
                className="animate-spin"
              />

              <span className="font-medium">
                Loading upcoming events...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">
              Unable to load upcoming events
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          events.length === 0 && (
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
              <CalendarDays
                size={46}
                className="mx-auto text-[#0F2B7B]"
              />

              <h3 className="mt-5 text-2xl font-bold text-[#0F2B7B]">
                No Upcoming Events
              </h3>

              <p className="mt-3 text-gray-600">
                There are currently no published upcoming
                NSS events.
              </p>
            </div>
          )}

        {/* EVENTS */}
        {!loading &&
          !error &&
          events.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-3">

              {events.map((event) => {
                const startTime = formatTime(
                  event.start_time
                );

                const endTime = formatTime(
                  event.end_time
                );

                return (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  >

                    {/* IMAGE */}
                    <div className="relative h-56 overflow-hidden bg-[#0F2B7B]">

                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <CalendarDays
                            size={70}
                            strokeWidth={1.5}
                            className="text-white"
                          />
                        </div>
                      )}

                      {/* EVENT TYPE */}
                      {event.event_type && (
                        <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0F2B7B] shadow">
                          {event.event_type}
                        </div>
                      )}

                    </div>

                    {/* CONTENT */}
                    <div className="p-8">

                      <h3 className="text-2xl font-bold text-[#0F2B7B]">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-4 line-clamp-3 leading-7 text-gray-600">
                          {event.description}
                        </p>
                      )}

                      {/* EVENT INFORMATION */}
                      <div className="mt-6 space-y-3 text-gray-700">

                        {/* DATE */}
                        <div className="flex items-center gap-3">
                          <CalendarDays
                            size={18}
                            className="shrink-0 text-[#0F2B7B]"
                          />

                          <span>
                            {formatDate(
                              event.event_date
                            )}
                          </span>
                        </div>

                        {/* TIME */}
                        {(startTime || endTime) && (
                          <div className="flex items-center gap-3">
                            <Clock3
                              size={18}
                              className="shrink-0 text-[#0F2B7B]"
                            />

                            <span>
                              {startTime || "Time not specified"}

                              {endTime && (
                                <>
                                  {" – "}
                                  {endTime}
                                </>
                              )}
                            </span>
                          </div>
                        )}

                        {/* LOCATION */}
                        <div className="flex items-center gap-3">
                          <MapPin
                            size={18}
                            className="shrink-0 text-[#0F2B7B]"
                          />

                          <span>
                            {getLocation(event)}
                          </span>
                        </div>

                      </div>

                      {/* REGISTRATION STATUS */}
                      <div className="mt-6">

                        {event.registration_open === true ? (
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                            Registration Open
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                            Registration Closed
                          </span>
                        )}

                      </div>

                      {/* VIEW DETAILS */}
                      <Link
                        href={`/events/${event.id}`}
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                      >
                        View Details

                        <ArrowRight size={18} />
                      </Link>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

        {/* VIEW ALL */}
        {!loading &&
          !error &&
          events.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F2B7B] px-7 py-3 font-semibold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
              >
                View All Events

                <ArrowRight size={18} />
              </Link>
            </div>
          )}

      </div>
    </section>
  );
}