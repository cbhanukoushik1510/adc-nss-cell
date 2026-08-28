"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Users,
  Loader2,
  LogIn,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface EventItem {
  id: string;
  title: string;
  description: string | null;

  event_date: string;

  start_time: string | null;
  end_time: string | null;
  event_time: string | null;

  venue: string | null;
  location: string | null;

  image_url: string | null;

  status: string;
  event_type: string | null;

  capacity: number | null;
  participants_count: number;

  registration_link: string | null;

  registration_open: boolean | null;
  registration_deadline: string | null;

  is_published: boolean | null;
}

function formatDate(value: string) {
  if (!value) return "Date not available";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
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
}

function getEventTime(event: EventItem) {
  const start = event.start_time || event.event_time;
  const end = event.end_time;

  if (!start) {
    return "Time not specified";
  }

  if (end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  return formatTime(start);
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [checkingLogin, setCheckingLogin] =
    useState(false);

  const [loginRequired, setLoginRequired] =
    useState(false);

  useEffect(() => {
    if (!eventId) return;

    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data,
        error: eventError,
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
          image_url,
          status,
          capacity,
          participants_count,
          created_by,
          created_at,
          updated_at,
          attendance_token,
          event_time,
          event_type,
          location,
          registration_link,
          is_published,
          registration_open,
          registration_deadline
        `)
        .eq("id", eventId)
        .maybeSingle();

      if (eventError) {
        console.error(
          "Event loading error:",
          eventError
        );

        throw new Error(
          eventError.message ||
            "Unable to load event."
        );
      }

      if (!data) {
        setError("Event not found.");
        return;
      }

      setEvent(data as EventItem);
    } catch (err) {
      console.error(
        "Event details error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load event."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!eventId) return;

    setCheckingLogin(true);
    setLoginRequired(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      /*
       * No logged-in user.
       */
      if (userError || !user) {
        setLoginRequired(true);

        /*
         * Give the message a moment to be visible,
         * then send the user to login.
         */
        setTimeout(() => {
          const redirectPath =
            `/events/${eventId}/register`;

          router.push(
            `/login?redirect=${encodeURIComponent(
              redirectPath
            )}`
          );
        }, 900);

        return;
      }

      /*
       * User is logged in.
       * Go directly to registration.
       */
      router.push(
        `/events/${eventId}/register`
      );
    } catch (err) {
      console.error(
        "Registration login check error:",
        err
      );

      setError(
        "Unable to continue to registration. Please try again."
      );
    } finally {
      setCheckingLogin(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading event...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0F2B7B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900">
              Unable to load event
            </h1>

            <p className="mt-3 text-gray-500">
              {error || "Event not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const registrationIsOpen =
    event.registration_open === true &&
    event.is_published !== false;

  const capacityFull =
    event.capacity !== null &&
    event.capacity > 0 &&
    event.participants_count >= event.capacity;

  const deadlinePassed =
    event.registration_deadline
      ? new Date(
          event.registration_deadline
        ).getTime() < Date.now()
      : false;

  const canRegister =
    registrationIsOpen &&
    !capacityFull &&
    !deadlinePassed;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0F2B7B] transition hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>

        {/* LOGIN REQUIRED MESSAGE */}

        {loginRequired && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-[#0F2B7B]" />

              <div>
                <p className="font-bold text-[#0F2B7B]">
                  Login required
                </p>

                <p className="mt-1 text-sm text-blue-700">
                  Please log in as a volunteer to register for this event.
                  Redirecting you to login...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EVENT */}

        <article className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* IMAGE */}

          <div className="relative h-[280px] w-full bg-slate-100 md:h-[420px]">

            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays className="h-20 w-20 text-[#0F2B7B]/30" />
              </div>
            )}

            <div className="absolute left-6 top-6">
              <span className="rounded-full bg-[#0F2B7B] px-4 py-2 text-sm font-bold text-white shadow-lg">
                {event.event_type || "Event"}
              </span>
            </div>
          </div>

          {/* CONTENT */}

          <div className="p-6 sm:p-8 lg:p-10">

            <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B] sm:text-4xl">
              {event.title}
            </h1>

            {/* META */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-slate-50 p-4">
                <CalendarDays className="h-5 w-5 text-[#0F2B7B]" />

                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {formatDate(event.event_date)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Clock className="h-5 w-5 text-[#0F2B7B]" />

                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {getEventTime(event)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <MapPin className="h-5 w-5 text-[#0F2B7B]" />

                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Venue
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {event.venue ||
                    event.location ||
                    "Venue not specified"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Users className="h-5 w-5 text-[#0F2B7B]" />

                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Participants
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  {event.participants_count}
                  {event.capacity
                    ? ` / ${event.capacity}`
                    : ""}
                </p>
              </div>

            </div>

            {/* DESCRIPTION */}

            <section className="mt-10">

              <h2 className="text-xl font-bold text-gray-900">
                About this Event
              </h2>

              <div className="mt-4 whitespace-pre-line text-base leading-8 text-gray-600">
                {event.description ||
                  "No description has been provided for this event."}
              </div>

            </section>

            {/* REGISTRATION */}

            <section className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-xl font-bold text-[#0F2B7B]">
                    Event Registration
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Register as an NSS volunteer to participate in this event.
                  </p>

                  {!registrationIsOpen && (
                    <p className="mt-3 font-bold text-red-600">
                      Registration is currently closed.
                    </p>
                  )}

                  {capacityFull && (
                    <p className="mt-3 font-bold text-red-600">
                      Registration is closed because the event is full.
                    </p>
                  )}

                  {deadlinePassed && (
                    <p className="mt-3 font-bold text-red-600">
                      The registration deadline has passed.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">

                  {canRegister && (
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={checkingLogin}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkingLogin ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}

                      Register for Event
                    </button>
                  )}

                  {event.registration_link &&
                    !canRegister && (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B] bg-white px-6 py-3.5 text-sm font-bold text-[#0F2B7B]"
                      >
                        <ExternalLink className="h-5 w-5" />
                        Registration Link
                      </a>
                  )}

                </div>

              </div>

            </section>

          </div>
        </article>
      </div>
    </main>
  );
}