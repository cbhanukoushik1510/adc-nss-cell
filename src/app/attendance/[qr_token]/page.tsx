"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface AttendanceEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  qr_token: string;
  status: "open" | "closed";
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
  role: string | null;
  volunteer_id: string | null;
}

type PageState =
  | "loading"
  | "ready"
  | "closed"
  | "invalid"
  | "unauthenticated"
  | "submitted"
  | "error";

export default function AttendanceQRPage() {
  const params = useParams();

  const qrToken =
    typeof params?.qr_token === "string"
      ? params.qr_token
      : Array.isArray(params?.qr_token)
        ? params.qr_token[0]
        : "";

  const [pageState, setPageState] =
    useState<PageState>("loading");

  const [event, setEvent] =
    useState<AttendanceEvent | null>(null);

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [alreadyMarked, setAlreadyMarked] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value: string) => {
    if (!value) return "—";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (value: string | null) => {
    if (!value) return "";

    const [hours, minutes] =
      value.slice(0, 5).split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ============================================================
  // INITIALIZE
  // ============================================================

  useEffect(() => {
    const initialize = async () => {
      setPageState("loading");
      setError("");

      try {
        if (!qrToken) {
          setPageState("invalid");
          return;
        }

        // ------------------------------------------------------
        // 1. FIND EVENT USING QR TOKEN
        // ------------------------------------------------------

        const {
          data: eventData,
          error: eventError,
        } = await supabase
          .from("attendance_events")
          .select(`
            id,
            title,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            qr_token,
            status
          `)
          .eq("qr_token", qrToken)
          .maybeSingle();

        if (eventError) {
          console.error(
            "Attendance event query error:",
            eventError
          );

          throw new Error(
            eventError.message ||
              "Unable to load attendance event."
          );
        }

        if (!eventData) {
          setPageState("invalid");
          return;
        }

        setEvent(
          eventData as AttendanceEvent
        );

        // ------------------------------------------------------
        // 2. CHECK EVENT STATUS
        // ------------------------------------------------------

        if (eventData.status !== "open") {
          setPageState("closed");
          return;
        }

        // ------------------------------------------------------
        // 3. GET LOGGED-IN USER
        // ------------------------------------------------------

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser();

        if (!user) {
          setPageState("unauthenticated");
          return;
        }

        // ------------------------------------------------------
        // 4. FIND VOLUNTEER PROFILE
        // ------------------------------------------------------

        const {
          data: volunteerData,
          error: volunteerError,
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
            role,
            volunteer_id
          `)
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (volunteerError) {
          console.error(
            "Volunteer profile query error:",
            volunteerError
          );

          throw new Error(
            volunteerError.message ||
              "Unable to load your volunteer profile."
          );
        }

        if (!volunteerData) {
          setError(
            "Your volunteer profile could not be found. Please contact the NSS administrator."
          );

          setPageState("error");
          return;
        }

        setVolunteer(
          volunteerData as Volunteer
        );

        // ------------------------------------------------------
        // 5. CHECK DUPLICATE ATTENDANCE
        // ------------------------------------------------------

        const {
          data: existingRecord,
          error: recordError,
        } = await supabase
          .from("attendance_records")
          .select("id, status")
          .eq(
            "attendance_event_id",
            eventData.id
          )
          .eq(
            "volunteer_id",
            volunteerData.id
          )
          .maybeSingle();

        if (recordError) {
          console.error(
            "Attendance duplicate check error:",
            recordError
          );

          throw new Error(
            recordError.message ||
              "Unable to verify attendance status."
          );
        }

        if (existingRecord) {
          setAlreadyMarked(true);
        }

        setPageState("ready");
      } catch (err) {
        console.error(
          "Attendance initialization error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading attendance."
        );

        setPageState("error");
      }
    };

    initialize();
  }, [qrToken]);

  // ============================================================
  // SUBMIT ATTENDANCE
  // ============================================================

  const submitAttendance = async () => {
    if (!event || !volunteer) {
      return;
    }

    if (alreadyMarked) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // --------------------------------------------------------
      // VERIFY CURRENT USER AGAIN
      // --------------------------------------------------------

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      // --------------------------------------------------------
      // VERIFY EVENT IS STILL OPEN
      // --------------------------------------------------------

      const {
        data: currentEvent,
        error: currentEventError,
      } = await supabase
        .from("attendance_events")
        .select("id, status")
        .eq("id", event.id)
        .maybeSingle();

      if (currentEventError) {
        throw new Error(
          currentEventError.message
        );
      }

      if (!currentEvent) {
        throw new Error(
          "This attendance event no longer exists."
        );
      }

      if (currentEvent.status !== "open") {
        setPageState("closed");
        return;
      }

      // --------------------------------------------------------
      // FINAL DUPLICATE CHECK
      // --------------------------------------------------------

      const {
        data: existingRecord,
        error: duplicateError,
      } = await supabase
        .from("attendance_records")
        .select("id")
        .eq(
          "attendance_event_id",
          event.id
        )
        .eq(
          "volunteer_id",
          volunteer.id
        )
        .maybeSingle();

      if (duplicateError) {
        throw new Error(
          duplicateError.message
        );
      }

      if (existingRecord) {
        setAlreadyMarked(true);
        setPageState("submitted");
        return;
      }

      // --------------------------------------------------------
      // INSERT ATTENDANCE
      // --------------------------------------------------------

      const {
        error: insertError,
      } = await supabase
        .from("attendance_records")
        .insert({
          attendance_event_id: event.id,
          volunteer_id: volunteer.id,
          scanned_at: new Date().toISOString(),
          status: "present",
          notes: null,
        });

      if (insertError) {
        console.error(
          "Attendance insert error:",
          insertError
        );

        throw new Error(
          insertError.message ||
            "Unable to submit attendance."
        );
      }

      setAlreadyMarked(true);
      setPageState("submitted");
    } catch (err) {
      console.error(
        "Attendance submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit attendance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (pageState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2 className="h-8 w-8 animate-spin text-[#0F2B7B]" />
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#0F2B7B]">
            Loading Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we verify this attendance QR code.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // INVALID QR
  // ============================================================

  if (pageState === "invalid") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Invalid Attendance QR
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            This QR code is invalid or the attendance event could not be found.
          </p>

          <p className="mt-5 text-xs text-gray-400">
            Please scan the QR code provided by the NSS administrator.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // CLOSED
  // ============================================================

  if (pageState === "closed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <CalendarCheck className="h-8 w-8 text-orange-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Attendance Closed
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Attendance for this event is currently closed.
            You can no longer submit attendance using this QR code.
          </p>

          {event && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="font-bold text-gray-900">
                {event.title}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {formatDate(event.event_date)}
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ============================================================
  // UNAUTHENTICATED
  // ============================================================

  if (pageState === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-8 w-8 text-[#0F2B7B]" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Volunteer Login Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please log in to your NSS volunteer account before submitting attendance.
          </p>

          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-left">
            <p className="text-sm font-semibold text-[#0F2B7B]">
              {event?.title}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {event
                ? formatDate(event.event_date)
                : ""}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (pageState === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Unable to Continue
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error ||
              "Something went wrong while loading attendance."}
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // SUCCESS
  // ============================================================

  if (pageState === "submitted") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-11 w-11 text-green-600" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-green-700">
            Attendance Submitted
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Your attendance has been successfully recorded.
          </p>

          {event && volunteer && (
            <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Event
              </p>

              <p className="mt-1 font-bold text-gray-900">
                {event.title}
              </p>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Volunteer
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {volunteer.full_name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {volunteer.roll_number}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Status
                </p>

                <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  PRESENT
                </span>
              </div>
            </div>
          )}

          <p className="mt-6 text-sm font-semibold text-gray-700">
            Thank you for participating in the NSS programme.
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // READY
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* HEADER */}

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white shadow-lg">
            <CalendarCheck className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#0F2B7B]">
            NSS Attendance
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Verify your details and submit your attendance.
          </p>
        </div>

        {/* EVENT CARD */}

        {event && (
          <section className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100">

            <div className="bg-[#0F2B7B] px-6 py-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Attendance Event
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {event.title}
              </h2>

              {event.description && (
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  {event.description}
                </p>
              )}
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CalendarCheck className="mt-0.5 h-5 w-5 text-[#0F2B7B]" />

                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {formatDate(event.event_date)}
                  </p>
                </div>
              </div>

              {(event.start_time ||
                event.end_time) && (
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <Clock className="mt-0.5 h-5 w-5 text-[#0F2B7B]" />

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {event.start_time
                        ? formatTime(
                            event.start_time
                          )
                        : ""}

                      {event.end_time
                        ? ` - ${formatTime(
                            event.end_time
                          )}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#0F2B7B]" />

                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400">
                      Venue
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {event.venue}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VOLUNTEER CARD */}

        {volunteer && (
          <section className="mt-5 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100">

            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                <User className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Your Details
                </h2>

                <p className="text-xs text-gray-500">
                  These details are taken from your volunteer profile.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {volunteer.full_name}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Roll Number
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {volunteer.roll_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Department
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {volunteer.department}
                  </p>
                </div>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    College Email
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                    {volunteer.college_email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Mobile Number
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {volunteer.mobile_number}
                  </p>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* DUPLICATE */}

        {alreadyMarked && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />

              <div>
                <h3 className="font-bold text-green-800">
                  Attendance Already Recorded
                </h3>

                <p className="mt-1 text-sm text-green-700">
                  Your attendance for this event has already been submitted.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />

              <p className="text-sm font-semibold leading-6 text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUBMIT */}

        {!alreadyMarked && (
          <button
            type="button"
            onClick={submitAttendance}
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0F2B7B] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Attendance...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Verify & Submit Attendance
              </>
            )}
          </button>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-gray-400">
          By submitting, you confirm that the displayed volunteer details belong to you and that you are attending this NSS event.
        </p>

      </div>
    </main>
  );
}