"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

interface Event {
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
  capacity: number | null;
  participants_count: number;
  event_type: string | null;
  registration_link: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
}

interface Volunteer {
  id: string;
  full_name: string;
  volunteer_id: string | null;
  status: string | null;
}

interface Registration {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
}

export default function VolunteerEventsPage() {
  const [events, setEvents] =
    useState<Event[]>([]);

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [registeringId, setRegisteringId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =====================================================
     LOAD EVENTS + VOLUNTEER
  ===================================================== */

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      /* =================================================
         1. GET CURRENT AUTH USER
      ================================================= */

      const {
        data: {
          user,
        },
        error: authError,
      } = await supabase.auth.getUser();

      if (
        authError ||
        !user
      ) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      /* =================================================
         2. GET VOLUNTEER PROFILE
      ================================================= */

      const {
        data: volunteerData,
        error: volunteerError,
      } =
        await supabase
          .from("volunteers")
          .select(
            `
              id,
              full_name,
              volunteer_id,
              status
            `
          )
          .eq(
            "auth_user_id",
            user.id
          )
          .maybeSingle();

      if (volunteerError) {
        throw volunteerError;
      }

      if (!volunteerData) {
        throw new Error(
          "Volunteer profile could not be found."
        );
      }

      setVolunteer(
        volunteerData
      );

      /* =================================================
         3. GET PUBLISHED EVENTS
      ================================================= */

      const {
        data: eventData,
        error: eventError,
      } =
        await supabase
          .from("events")
          .select(
            `
              id,
              title,
              description,
              event_date,
              start_time,
              end_time,
              event_time,
              venue,
              location,
              image_url,
              status,
              capacity,
              participants_count,
              event_type,
              registration_link,
              is_published,
              registration_open,
              registration_deadline
            `
          )
          .eq(
            "is_published",
            true
          )
          .order(
            "event_date",
            {
              ascending: true,
            }
          );

      if (eventError) {
        throw eventError;
      }

      setEvents(
        (eventData || []).map(
          (event) => ({
            ...event,
            participants_count:
              event.participants_count ??
              0,
          })
        )
      );

      /* =================================================
         4. GET VOLUNTEER REGISTRATIONS
      ================================================= */

      const {
        data: registrationData,
        error: registrationError,
      } =
        await supabase
          .from(
            "event_registrations"
          )
          .select(
            `
              id,
              event_id,
              volunteer_id,
              status
            `
          )
          .eq(
            "volunteer_id",
            volunteerData.id
          );

      /*
       * If the registration table exists but
       * has an error, show it.
       */
      if (registrationError) {
        throw registrationError;
      }

      setRegistrations(
        registrationData || []
      );
    } catch (err) {
      console.error(
        "Volunteer events error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
     DATE HELPERS
  ===================================================== */

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(
        `${dateString}T00:00:00`
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (
    value: string | null
  ) => {
    if (!value) {
      return null;
    }

    const [hours, minutes] =
      value.split(":");

    const date =
      new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const getEventTime = (
    event: Event
  ) => {
    if (
      event.start_time &&
      event.end_time
    ) {
      return `${formatTime(
        event.start_time
      )} - ${formatTime(
        event.end_time
      )}`;
    }

    if (event.start_time) {
      return formatTime(
        event.start_time
      );
    }

    if (event.event_time) {
      return formatTime(
        event.event_time
      );
    }

    return "Time not specified";
  };

  /* =====================================================
     REGISTRATION STATUS
  ===================================================== */

  const isRegistered = (
    eventId: string
  ) => {
    return registrations.some(
      (registration) =>
        registration.event_id ===
          eventId &&
        registration.status !==
          "cancelled"
    );
  };

  /* =====================================================
     REGISTRATION DEADLINE
  ===================================================== */

  const registrationClosed = (
    event: Event
  ) => {
    if (
      !event.registration_deadline
    ) {
      return false;
    }

    return (
      new Date(
        event.registration_deadline
      ).getTime() <
      Date.now()
    );
  };

  /* =====================================================
     EVENT PAST CHECK
  ===================================================== */

  const isPastEvent = (
    event: Event
  ) => {
    const eventDate =
      new Date(
        `${event.event_date}T23:59:59`
      );

    return (
      eventDate.getTime() <
      Date.now()
    );
  };

  /* =====================================================
     UPCOMING EVENTS
  ===================================================== */

  const upcomingEvents =
    useMemo(() => {
      return events.filter(
        (event) =>
          !isPastEvent(event)
      );
    }, [events]);

  /* =====================================================
     PAST EVENTS
  ===================================================== */

  const pastEvents =
    useMemo(() => {
      return events.filter(
        (event) =>
          isPastEvent(event)
      );
    }, [events]);

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister = async (
    event: Event
  ) => {
    if (!volunteer) {
      setError(
        "Volunteer profile not found."
      );

      return;
    }

    setError("");
    setSuccess("");

    /* Already registered */

    if (
      isRegistered(event.id)
    ) {
      setError(
        "You are already registered for this event."
      );

      return;
    }

    /* Event registration closed */

    if (
      event.registration_open ===
      false
    ) {
      setError(
        "Registration for this event is currently closed."
      );

      return;
    }

    /* Deadline */

    if (
      registrationClosed(event)
    ) {
      setError(
        "The registration deadline for this event has passed."
      );

      return;
    }

    /* Capacity */

    if (
      event.capacity !== null &&
      event.participants_count >=
        event.capacity
    ) {
      setError(
        "This event has reached its maximum capacity."
      );

      return;
    }

    setRegisteringId(
      event.id
    );

    try {
      /* =================================================
         CHECK AGAINST DATABASE
         
         Prevent duplicate registration even if
         page state is outdated.
      ================================================= */

      const {
        data: existingRegistration,
        error: existingError,
      } =
        await supabase
          .from(
            "event_registrations"
          )
          .select("id")
          .eq(
            "event_id",
            event.id
          )
          .eq(
            "volunteer_id",
            volunteer.id
          )
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingRegistration) {
        setRegistrations(
          (current) => [
            ...current,
            {
              id:
                existingRegistration.id,
              event_id:
                event.id,
              volunteer_id:
                volunteer.id,
              status:
                "registered",
            },
          ]
        );

        setError(
          "You are already registered for this event."
        );

        return;
      }

      /* =================================================
         CREATE REGISTRATION
      ================================================= */

      const {
        data: newRegistration,
        error: registrationError,
      } =
        await supabase
          .from(
            "event_registrations"
          )
          .insert({
            event_id:
              event.id,

            volunteer_id:
              volunteer.id,

            status:
              "registered",
          })
          .select(
            `
              id,
              event_id,
              volunteer_id,
              status
            `
          )
          .single();

      if (registrationError) {
        throw registrationError;
      }

      /* =================================================
         UPDATE LOCAL REGISTRATION STATE
      ================================================= */

      if (newRegistration) {
        setRegistrations(
          (current) => [
            ...current,
            newRegistration,
          ]
        );
      }

      /* =================================================
         UPDATE PARTICIPANT COUNT
         
         We update the event count in the
         local UI immediately.
      ================================================= */

      setEvents(
        (current) =>
          current.map(
            (currentEvent) =>
              currentEvent.id ===
              event.id
                ? {
                    ...currentEvent,
                    participants_count:
                      currentEvent.participants_count +
                      1,
                  }
                : currentEvent
          )
      );

      setSuccess(
        `You have successfully registered for "${event.title}".`
      );
    } catch (err) {
      console.error(
        "Event registration error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to register for this event."
      );
    } finally {
      setRegisteringId(null);
    }
  };

  /* =====================================================
     EVENT CARD
  ===================================================== */

  const EventCard = ({
    event,
  }: {
    event: Event;
  }) => {
    const registered =
      isRegistered(
        event.id
      );

    const past =
      isPastEvent(event);

    const closed =
      registrationClosed(
        event
      );

    const registrationDisabled =
      past ||
      registered ||
      event.registration_open ===
        false ||
      closed ||
      (
        event.capacity !==
          null &&
        event.participants_count >=
          event.capacity
      );

    const remainingSeats =
      event.capacity !==
      null
        ? Math.max(
            event.capacity -
              event.participants_count,
            0
          )
        : null;

    return (
          
      <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* IMAGE */}

        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#0F2B7B] to-[#2563EB]">

          {event.image_url ? (
            <img
              src={
                event.image_url
              }
              alt={
                event.title
              }
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">

              <CalendarDays className="h-16 w-16 text-white/80" />

            </div>
          )}

          {/* EVENT TYPE */}

          {event.event_type && (
            <div className="absolute left-4 top-4">

              <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#0F2B7B] shadow">
                {
                  event.event_type
                }
              </span>

            </div>
          )}

          {/* REGISTERED */}

          {registered && (
            <div className="absolute right-4 top-4">

              <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow">
                <CheckCircle2 className="h-3.5 w-3.5" />

                Registered
              </span>

            </div>
          )}

        </div>

        {/* CONTENT */}

        <div className="p-6">

          <h3 className="text-xl font-bold text-[#0F2B7B]">
            {event.title}
          </h3>

          {event.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
              {
                event.description
              }
            </p>
          )}

          {/* EVENT DETAILS */}

          <div className="mt-5 space-y-3">

            <div className="flex items-start gap-3 text-sm text-gray-700">

              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#0F2B7B]" />

              <span>
                {formatDate(
                  event.event_date
                )}
              </span>

            </div>

            <div className="flex items-start gap-3 text-sm text-gray-700">

              <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#0F2B7B]" />

              <span>
                {getEventTime(
                  event
                )}
              </span>

            </div>

            {(event.venue ||
              event.location) && (
              <div className="flex items-start gap-3 text-sm text-gray-700">

                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#0F2B7B]" />

                <span>
                  {
                    event.venue ||
                    event.location
                  }
                </span>

              </div>
            )}

            {event.capacity !==
              null && (
              <div className="flex items-start gap-3 text-sm text-gray-700">

                <Users className="mt-0.5 h-5 w-5 shrink-0 text-[#0F2B7B]" />

                <span>
                  {
                    event.participants_count
                  }{" "}
                  /{" "}
                  {
                    event.capacity
                  }{" "}
                  registered
                </span>

              </div>
            )}

          </div>

          {/* REGISTRATION INFO */}

          {!past &&
            !registered &&
            event.capacity !==
              null && (
              <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3">

                <p className="text-xs font-bold text-[#0F2B7B]">

                  {remainingSeats ===
                  0
                    ? "Event Full"
                    : `${remainingSeats} seat${
                        remainingSeats ===
                        1
                          ? ""
                          : "s"
                      } available`}

                </p>

              </div>
            )}

          {/* ACTION */}

          <div className="mt-6">

            {registered ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-5 py-3.5 text-sm font-bold text-green-700">

                <CheckCircle2 className="h-5 w-5" />

                Registration Confirmed

              </div>
            ) : past ? (
              <div className="flex w-full items-center justify-center rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-gray-500">

                Event Completed

              </div>
            ) : event.registration_open ===
              false ? (
              <div className="flex w-full items-center justify-center rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-gray-500">

                Registration Closed

              </div>
            ) : closed ? (
              <div className="flex w-full items-center justify-center rounded-xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-gray-500">

                Registration Deadline Passed

              </div>
            ) : event.capacity !==
                null &&
              event.participants_count >=
                event.capacity ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3.5 text-sm font-bold text-red-700">

                <AlertCircle className="h-5 w-5" />

                Event Full

              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleRegister(
                    event
                  )
                }
                disabled={
                  registrationDisabled ||
                  registeringId ===
                    event.id
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#143A96] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {registeringId ===
                event.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />

                    Register Now
                  </>
                )}

              </button>
            )}

          </div>

        </div>

      </article>
    );
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <DashboardLayout>
    <main className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="bg-gradient-to-r from-[#0F2B7B] via-[#1746A2] to-[#2563EB] px-5 py-10 text-white md:px-8">

        <div className="mx-auto max-w-7xl">

          <Link
            href="/volunteer/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                Volunteer Portal
              </p>

              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                NSS Events
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Explore upcoming NSS programmes and register directly from your volunteer account.
              </p>

            </div>

            {volunteer && (
              <div className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">

                <p className="text-xs text-blue-200">
                  Volunteer
                </p>

                <p className="mt-1 font-bold">
                  {
                    volunteer.full_name
                  }
                </p>

                {volunteer.volunteer_id && (
                  <p className="mt-1 text-xs text-blue-200">
                    ID:{" "}
                    {
                      volunteer.volunteer_id
                    }
                  </p>
                )}

              </div>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">

            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm font-semibold">
              {success}
            </p>

          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-sm font-semibold">
              {error}
            </p>

          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center">

            <Loader2 className="h-10 w-10 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading NSS events...
            </p>

          </div>
        ) : (
          <>

            {/* =================================================
                UPCOMING
            ================================================= */}

            <section>

              <div className="mb-7 flex items-end justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold text-[#0F2B7B]">
                    Upcoming Events
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Register for upcoming NSS programmes.
                  </p>

                </div>

                <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#0F2B7B]">
                  {
                    upcomingEvents.length
                  }{" "}
                  event
                  {
                    upcomingEvents.length ===
                    1
                      ? ""
                      : "s"
                  }
                </div>

              </div>

              {upcomingEvents.length ===
              0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                  <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />

                  <h3 className="mt-5 text-lg font-bold text-gray-800">
                    No upcoming events
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    New NSS events will appear here once published.
                  </p>

                </div>
              ) : (
                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">

                  {upcomingEvents.map(
                    (event) => (
                      <EventCard
                        key={
                          event.id
                        }
                        event={
                          event
                        }
                      />
                    )
                  )}

                </div>
              )}

            </section>

            {/* =================================================
                PAST
            ================================================= */}

            {pastEvents.length >
              0 && (
              <section className="mt-14">

                <div className="mb-7">

                  <h2 className="text-2xl font-bold text-[#0F2B7B]">
                    Past Events
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Events that have already been completed.
                  </p>

                </div>

                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">

                  {pastEvents.map(
                    (event) => (
                      <EventCard
                        key={
                          event.id
                        }
                        event={
                          event
                        }
                      />
                    )
                  )}

                </div>

              </section>
            )}

          </>
        )}

      </div>

    </main>
    </DashboardLayout>
  );
 
}