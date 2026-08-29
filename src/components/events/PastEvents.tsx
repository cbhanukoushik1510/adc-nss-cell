"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
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

function getLocation(event: EventRow) {
  return (
    event.location ||
    event.venue ||
    "Venue not specified"
  );
}

export default function PastEvents() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPastEvents() {
      try {
        setLoading(true);
        setError("");

        /*
         * Today's date.
         *
         * Any published event with an event_date
         * before today is considered a past event.
         */
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
            participants_count
          `)
          .eq("is_published", true)
          .lt("event_date", today)
          .order("event_date", {
            ascending: false,
          })
          .order("start_time", {
            ascending: false,
          });

        if (eventsError) {
          console.error(
            "Past events error:",
            eventsError
          );

          if (mounted) {
            setError(
              eventsError.message ||
                "Unable to load past events."
            );
          }

          return;
        }

        if (mounted) {
          setEvents(
            (data || []) as EventRow[]
          );
        }
      } catch (err) {
        console.error(
          "Past events error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load past events."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPastEvents();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Past Events
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Explore our completed NSS programmes and
            activities.
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
                Loading past events...
              </span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">
              Unable to load past events
            </p>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          events.length === 0 && (
            <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">

              <CalendarDays
                size={48}
                className="mx-auto text-[#0F2B7B]"
              />

              <h3 className="mt-5 text-2xl font-bold text-[#0F2B7B]">
                No Past Events
              </h3>

              <p className="mt-3 text-gray-600">
                Completed NSS events will appear here
                automatically.
              </p>

            </div>
          )}

        {/* EVENTS */}
        {!loading &&
          !error &&
          events.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {events.map((event) => (
                <article
                  key={event.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >

                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-[#0F2B7B]">

                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <CalendarDays
                          size={70}
                          strokeWidth={1.3}
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

                    {/* COMPLETED */}
                    <div className="absolute bottom-5 right-5 rounded-full bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                      Completed
                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="p-7">

                    <h3 className="text-2xl font-bold text-[#0F2B7B]">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="mt-4 line-clamp-3 leading-7 text-gray-600">
                        {event.description}
                      </p>
                    )}

                    {/* DATE */}
                    <div className="mt-6 flex items-center gap-3 text-gray-700">

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

                    {/* LOCATION */}
                    <div className="mt-3 flex items-center gap-3 text-gray-700">

                      <MapPin
                        size={18}
                        className="shrink-0 text-[#0F2B7B]"
                      />

                      <span>
                        {getLocation(event)}
                      </span>

                    </div>

                    {/* PARTICIPANTS */}
                    {event.participants_count !== null &&
                      event.participants_count !== undefined && (
                        <div className="mt-5 text-sm text-gray-500">
                          {event.participants_count}{" "}
                          participant
                          {event.participants_count === 1
                            ? ""
                            : "s"}
                        </div>
                      )}

                    {/* DETAILS */}
                    <Link
                      href={`/events/${event.id}`}
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                    >
                      View Details

                      <ArrowRight size={18} />
                    </Link>

                  </div>

                </article>
              ))}

            </div>
          )}

      </div>
    </section>
  );
}