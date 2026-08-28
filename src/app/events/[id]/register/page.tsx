"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Users,
  AlertCircle,
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

  is_published: boolean | null;

  registration_open: boolean | null;
  registration_deadline: string | null;
}

interface Volunteer {
  id: string;
  auth_user_id: string | null;

  full_name: string;
  roll_number: string;

  college_email: string;
  mobile_number: string;

  department: string;
  course: string | null;
  year: string;

  volunteer_id: string | null;

  status: string | null;
}

interface Registration {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  registered_at: string;
}

type PageState =
  | "loading"
  | "ready"
  | "success"
  | "closed"
  | "unauthenticated"
  | "error";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const value = error as {
      message?: string;
      details?: string;
      hint?: string;
    };

    return (
      value.message ||
      value.details ||
      value.hint ||
      "Something went wrong."
    );
  }

  return "Something went wrong.";
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

function eventTime(event: EventItem) {
  const start = event.start_time || event.event_time;

  if (!start) {
    return "Time not specified";
  }

  if (event.end_time) {
    return `${formatTime(start)} - ${formatTime(
      event.end_time
    )}`;
  }

  return formatTime(start);
}

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [event, setEvent] =
    useState<EventItem | null>(null);

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [registration, setRegistration] =
    useState<Registration | null>(null);

  const [pageState, setPageState] =
    useState<PageState>("loading");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * --------------------------------------------------------
   * INITIAL LOAD
   * --------------------------------------------------------
   */

  useEffect(() => {
    if (!eventId) {
      setError("Invalid event.");
      setPageState("error");
      setLoading(false);
      return;
    }

    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setPageState("loading");

    try {
      /*
       * ----------------------------------------------------
       * 1. GET EVENT
       * ----------------------------------------------------
       */

      const {
        data: eventData,
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
          event_time,
          event_type,
          location,
          is_published,
          registration_open,
          registration_deadline
        `)
        .eq("id", eventId)
        .maybeSingle();

      if (eventError) {
        console.error(
          "Event registration event error:",
          eventError
        );

        throw new Error(
          eventError.message ||
            "Unable to load event."
        );
      }

      if (!eventData) {
        throw new Error(
          "This event does not exist."
        );
      }

      const currentEvent =
        eventData as EventItem;

      setEvent(currentEvent);

      /*
       * ----------------------------------------------------
       * 2. CHECK LOGIN
       * ----------------------------------------------------
       */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Registration auth error:",
          authError
        );

        router.replace(
          `/login?redirect=${encodeURIComponent(
            `/events/${eventId}/register`
          )}`
        );

        return;
      }

      /*
       * User is NOT logged in.
       */

      if (!user) {
        router.replace(
          `/login?redirect=${encodeURIComponent(
            `/events/${eventId}/register`
          )}`
        );

        return;
      }

      /*
       * ----------------------------------------------------
       * 3. FIND VOLUNTEER
       * ----------------------------------------------------
       *
       * IMPORTANT:
       * volunteers does NOT have "email".
       *
       * We use auth_user_id first.
       */

      let volunteerData: Volunteer | null =
        null;

      const {
        data: authVolunteer,
        error: authVolunteerError,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          auth_user_id,
          full_name,
          roll_number,
          college_email,
          mobile_number,
          department,
          course,
          year,
          volunteer_id,
          status
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (authVolunteerError) {
        console.error(
          "Volunteer auth_user_id query error:",
          authVolunteerError
        );

        throw new Error(
          authVolunteerError.message ||
            "Unable to load volunteer profile."
        );
      }

      if (authVolunteer) {
        volunteerData =
          authVolunteer as Volunteer;
      }

      /*
       * ----------------------------------------------------
       * 4. FALLBACK TO COLLEGE EMAIL
       * ----------------------------------------------------
       *
       * This helps older volunteer accounts where
       * auth_user_id may not have been linked yet.
       */

      if (!volunteerData && user.email) {
        const normalizedEmail =
          user.email.trim().toLowerCase();

        const {
          data: emailVolunteer,
          error: emailVolunteerError,
        } = await supabase
          .from("volunteers")
          .select(`
            id,
            auth_user_id,
            full_name,
            roll_number,
            college_email,
            mobile_number,
            department,
            course,
            year,
            volunteer_id,
            status
          `)
          .ilike(
            "college_email",
            normalizedEmail
          )
          .maybeSingle();

        if (emailVolunteerError) {
          console.error(
            "Volunteer college_email query error:",
            emailVolunteerError
          );

          throw new Error(
            emailVolunteerError.message ||
              "Unable to load volunteer profile."
          );
        }

        if (emailVolunteer) {
          volunteerData =
            emailVolunteer as Volunteer;
        }
      }

      if (!volunteerData) {
        throw new Error(
          "Your login account is not linked to an approved volunteer profile."
        );
      }

      setVolunteer(volunteerData);

      /*
       * ----------------------------------------------------
       * 5. CHECK VOLUNTEER STATUS
       * ----------------------------------------------------
       */

      const volunteerStatus =
        volunteerData.status
          ?.trim()
          .toLowerCase();

      if (
        volunteerStatus &&
        [
          "rejected",
          "inactive",
          "disabled",
        ].includes(volunteerStatus)
      ) {
        throw new Error(
          "Your volunteer account is not currently eligible to register for events."
        );
      }

      /*
       * ----------------------------------------------------
       * 6. CHECK REGISTRATION OPEN
       * ----------------------------------------------------
       */

      const registrationOpen =
        currentEvent.registration_open === true;

      const deadlinePassed =
        currentEvent.registration_deadline
          ? new Date(
              currentEvent.registration_deadline
            ).getTime() < Date.now()
          : false;

      const capacityFull =
        currentEvent.capacity !== null &&
        currentEvent.capacity > 0 &&
        currentEvent.participants_count >=
          currentEvent.capacity;

      if (
        currentEvent.is_published === false ||
        !registrationOpen ||
        deadlinePassed ||
        capacityFull
      ) {
        setPageState("closed");
        return;
      }

      /*
       * ----------------------------------------------------
       * 7. CHECK EXISTING REGISTRATION
       * ----------------------------------------------------
       */

      const {
        data: existingRegistration,
        error: registrationError,
      } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          volunteer_id,
          status,
          registered_at
        `)
        .eq("event_id", eventId)
        .eq(
          "volunteer_id",
          volunteerData.id
        )
        .maybeSingle();

      if (registrationError) {
        console.error(
          "Existing registration query error:",
          registrationError
        );

        throw new Error(
          registrationError.message ||
            "Unable to check your registration."
        );
      }

      if (existingRegistration) {
        setRegistration(
          existingRegistration as Registration
        );

        setPageState("success");
        return;
      }

      /*
       * ----------------------------------------------------
       * READY
       * ----------------------------------------------------
       */

      setPageState("ready");
    } catch (err) {
      console.error(
        "Event registration loading error:",
        err
      );

      setError(
        getErrorMessage(err)
      );

      setPageState("error");
    } finally {
      setLoading(false);
    }
  };

  /*
   * --------------------------------------------------------
   * REGISTER
   * --------------------------------------------------------
   */

  const handleRegister = async (
    submitEvent: FormEvent<HTMLFormElement>
  ) => {
    submitEvent.preventDefault();

    if (!event || !volunteer) {
      setError(
        "Event or volunteer information is missing."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      /*
       * Re-check login immediately before inserting.
       */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?redirect=${encodeURIComponent(
            `/events/${event.id}/register`
          )}`
        );

        return;
      }

      /*
       * Re-check registration state.
       */

      const {
        data: currentEvent,
        error: currentEventError,
      } = await supabase
        .from("events")
        .select(`
          id,
          title,
          event_date,
          capacity,
          participants_count,
          is_published,
          registration_open,
          registration_deadline
        `)
        .eq("id", event.id)
        .maybeSingle();

      if (currentEventError) {
        throw currentEventError;
      }

      if (!currentEvent) {
        throw new Error(
          "Event no longer exists."
        );
      }

      if (
        currentEvent.is_published === false
      ) {
        throw new Error(
          "This event is no longer published."
        );
      }

      if (
        currentEvent.registration_open !==
        true
      ) {
        throw new Error(
          "Registration for this event is closed."
        );
      }

      if (
        currentEvent.registration_deadline &&
        new Date(
          currentEvent.registration_deadline
        ).getTime() < Date.now()
      ) {
        throw new Error(
          "The registration deadline has passed."
        );
      }

      if (
        currentEvent.capacity !== null &&
        currentEvent.capacity > 0 &&
        currentEvent.participants_count >=
          currentEvent.capacity
      ) {
        throw new Error(
          "This event has reached its maximum capacity."
        );
      }

      /*
       * ----------------------------------------------------
       * CHECK DUPLICATE
       * ----------------------------------------------------
       */

      const {
        data: duplicate,
        error: duplicateError,
      } = await supabase
        .from("event_registrations")
        .select("id,status")
        .eq("event_id", event.id)
        .eq(
          "volunteer_id",
          volunteer.id
        )
        .maybeSingle();

      if (duplicateError) {
        throw duplicateError;
      }

      if (duplicate) {
        setRegistration(
          duplicate as Registration
        );

        setPageState("success");

        return;
      }

      /*
       * ----------------------------------------------------
       * INSERT REGISTRATION
       * ----------------------------------------------------
       */

      const {
        data: newRegistration,
        error: insertError,
      } = await supabase
        .from("event_registrations")
        .insert({
          event_id: event.id,
          volunteer_id: volunteer.id,
          status: "registered",
          registered_at:
            new Date().toISOString(),
        })
        .select(`
          id,
          event_id,
          volunteer_id,
          status,
          registered_at
        `)
        .single();

      if (insertError) {
        /*
         * PostgreSQL duplicate protection.
         */
        if (
          insertError.code === "23505"
        ) {
          const {
            data: existing,
          } = await supabase
            .from("event_registrations")
            .select(`
              id,
              event_id,
              volunteer_id,
              status,
              registered_at
            `)
            .eq(
              "event_id",
              event.id
            )
            .eq(
              "volunteer_id",
              volunteer.id
            )
            .maybeSingle();

          if (existing) {
            setRegistration(
              existing as Registration
            );

            setPageState("success");

            return;
          }
        }

        throw insertError;
      }

      if (newRegistration) {
        setRegistration(
          newRegistration as Registration
        );
      }

      /*
       * ----------------------------------------------------
       * UPDATE PARTICIPANT COUNT
       * ----------------------------------------------------
       *
       * This keeps the existing events table count
       * synchronized.
       */

      const {
        error: countError,
      } = await supabase
        .from("events")
        .update({
          participants_count:
            (currentEvent.participants_count ||
              0) + 1,
        })
        .eq("id", event.id);

      if (countError) {
        /*
         * Registration itself succeeded.
         * Do not tell the user registration failed.
         */
        console.error(
          "Participant count update error:",
          countError
        );
      } else {
        setEvent((current) =>
          current
            ? {
                ...current,
                participants_count:
                  current.participants_count +
                  1,
              }
            : current
        );
      }

      setPageState("success");
    } catch (err) {
      console.error(
        "Event registration submit error:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * --------------------------------------------------------
   * LOADING
   * --------------------------------------------------------
   */

  if (
    loading ||
    pageState === "loading"
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading registration...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------
   * PAGE
   * --------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/events/${eventId}`
            )
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#0F2B7B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </button>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-bold">
                  Unable to continue
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EVENT HEADER */}

        {event && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

            {event.image_url && (
              <div className="h-48 w-full overflow-hidden sm:h-64">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">

              <h1 className="text-3xl font-bold text-[#0F2B7B]">
                {event.title}
              </h1>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <CalendarDays className="h-5 w-5 text-[#0F2B7B]" />

                  <div>
                    <p className="text-xs text-gray-400">
                      Date
                    </p>

                    <p className="text-sm font-bold text-gray-800">
                      {formatDate(
                        event.event_date
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <Clock className="h-5 w-5 text-[#0F2B7B]" />

                  <div>
                    <p className="text-xs text-gray-400">
                      Time
                    </p>

                    <p className="text-sm font-bold text-gray-800">
                      {eventTime(event)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <MapPin className="h-5 w-5 text-[#0F2B7B]" />

                  <div>
                    <p className="text-xs text-gray-400">
                      Venue
                    </p>

                    <p className="text-sm font-bold text-gray-800">
                      {event.venue ||
                        event.location ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* CLOSED */}

        {pageState === "closed" && (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-lg">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-gray-900">
              Registration Closed
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Registration for this event is currently unavailable.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/events/${eventId}`
                )
              }
              className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white"
            >
              Back to Event
            </button>
          </div>
        )}

        {/* SUCCESS */}

        {pageState === "success" && (
          <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-lg">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              You are registered!
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Your registration for this event has been successfully recorded.
            </p>

            {volunteer && (
              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 p-5 text-left">

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Registered Volunteer
                </p>

                <p className="mt-2 text-lg font-bold text-[#0F2B7B]">
                  {volunteer.full_name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Roll Number:{" "}
                  {volunteer.roll_number}
                </p>

                {registration && (
                  <p className="mt-1 text-sm text-gray-500">
                    Registration ID:{" "}
                    {registration.id}
                  </p>
                )}

              </div>
            )}

            <div className="mt-7 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/events/${eventId}`
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-gray-700"
              >
                View Event
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/volunteer/dashboard"
                  )
                }
                className="rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white"
              >
                Volunteer Dashboard
              </button>

            </div>
          </div>
        )}

        {/* REGISTRATION FORM */}

        {pageState === "ready" &&
          volunteer &&
          event && (
            <form
              onSubmit={handleRegister}
              className="mt-6 rounded-3xl bg-white p-6 shadow-lg sm:p-8"
            >

              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-2xl font-bold text-[#0F2B7B]">
                  Event Registration
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Please verify your details before registering.
                </p>
              </div>

              {/* VOLUNTEER */}

              <div className="mt-6">

                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0F2B7B]" />

                  <h3 className="font-bold text-gray-900">
                    Volunteer Details
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      Full Name
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {volunteer.full_name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      Roll Number
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {volunteer.roll_number}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      College Email
                    </p>

                    <p className="mt-1 break-all font-bold text-gray-800">
                      {volunteer.college_email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      Mobile Number
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {volunteer.mobile_number}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      Department
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {volunteer.department}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-gray-400">
                      Year
                    </p>

                    <p className="mt-1 font-bold text-gray-800">
                      {volunteer.year}
                    </p>
                  </div>

                </div>
              </div>

              {/* EVENT */}

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                <p className="text-sm font-bold text-[#0F2B7B]">
                  Registration Summary
                </p>

                <div className="mt-3 space-y-2 text-sm text-gray-600">

                  <p>
                    <strong>Event:</strong>{" "}
                    {event.title}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(
                      event.event_date
                    )}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {eventTime(event)}
                  </p>

                  <p>
                    <strong>Venue:</strong>{" "}
                    {event.venue ||
                      event.location ||
                      "Not specified"}
                  </p>

                </div>
              </div>

              {/* SUBMIT */}

              <div className="mt-8 border-t border-slate-200 pt-6">

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Confirm Registration
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  By confirming, you agree that your volunteer profile
                  information can be used for this NSS event registration.
                </p>

              </div>

            </form>
          )}

      </div>
    </main>
  );
}