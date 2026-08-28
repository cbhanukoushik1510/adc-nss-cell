"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  Eye,
  Clock,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Authority = {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  designation: string;
  phone_number: string | null;
  department: string | null;
  is_active: boolean;
};

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  status: string;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return "";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function getRegistrationStatus(event: EventItem) {
  /*
   * Registration is considered open only when:
   *
   * 1. registration_open is true
   * 2. AND deadline has not passed
   *
   * This is view-only here. The authority cannot change it.
   */

  if (!event.registration_open) {
    return false;
  }

  if (event.registration_deadline) {
    const deadline = new Date(event.registration_deadline);

    if (deadline.getTime() <= Date.now()) {
      return false;
    }
  }

  return true;
}

export default function AuthorityDashboard() {
  const router = useRouter();

  const [authority, setAuthority] = useState<Authority | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [totalEvents, setTotalEvents] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [registeredVolunteers, setRegisteredVolunteers] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /* --------------------------------
         1. CURRENT AUTH USER
      -------------------------------- */

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      /* --------------------------------
         2. AUTHORITY PROFILE
      -------------------------------- */

      const {
        data: authorityData,
        error: authorityError,
      } = await supabase
        .from("authority")
        .select(
          `
            id,
            user_id,
            full_name,
            role,
            designation,
            phone_number,
            department,
            is_active
          `
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (authorityError) {
        console.error(
          "Authority profile error:",
          authorityError
        );

        throw new Error(
          authorityError.message ||
            "Unable to load authority profile."
        );
      }

      if (!authorityData) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      /* --------------------------------
         3. PRINCIPAL / VP SECURITY CHECK
      -------------------------------- */

      const role = String(
        authorityData.role || ""
      ).toLowerCase();

      const designation = String(
        authorityData.designation || ""
      ).toLowerCase();

      const isPrincipal =
        role.includes("principal") &&
        !role.includes("vice");

      const isVicePrincipal =
        role.includes("vice principal") ||
        designation.includes("vice principal") ||
        role.includes("vp");

      if (!isPrincipal && !isVicePrincipal) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setAuthority(authorityData);

      /* --------------------------------
         4. TOTAL EVENTS
      -------------------------------- */

      const {
        count: eventCount,
        error: eventCountError,
      } = await supabase
        .from("events")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (eventCountError) {
        console.error(
          "Event count error:",
          eventCountError
        );
      }

      setTotalEvents(eventCount || 0);

      /* --------------------------------
         5. UPCOMING EVENTS
      -------------------------------- */

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const {
        count: upcomingCount,
        error: upcomingError,
      } = await supabase
        .from("events")
        .select("id", {
          count: "exact",
          head: true,
        })
        .gte("event_date", today);

      if (upcomingError) {
        console.error(
          "Upcoming event count error:",
          upcomingError
        );
      }

      setUpcomingEvents(upcomingCount || 0);

      /* --------------------------------
         6. TOTAL VOLUNTEERS
      -------------------------------- */

      const {
        count: volunteerCount,
        error: volunteerCountError,
      } = await supabase
        .from("volunteers")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (volunteerCountError) {
        console.error(
          "Volunteer count error:",
          volunteerCountError
        );
      }

      setTotalVolunteers(volunteerCount || 0);

      /* --------------------------------
         7. TOTAL REGISTRATIONS
      -------------------------------- */

      const {
        count: registrationCount,
        error: registrationError,
      } = await supabase
        .from("event_registrations")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (registrationError) {
        console.error(
          "Registration count error:",
          registrationError
        );
      }

      setRegisteredVolunteers(
        registrationCount || 0
      );

      /* --------------------------------
         8. ATTENDANCE RECORDS
      -------------------------------- */

      const {
        count: attendanceCount,
        error: attendanceError,
      } = await supabase
        .from("attendance_records")
        .select("id", {
          count: "exact",
          head: true,
        });

      if (attendanceError) {
        console.error(
          "Attendance count error:",
          attendanceError
        );
      }

      setAttendanceRecords(
        attendanceCount || 0
      );

      /* --------------------------------
         9. EVENTS
      -------------------------------- */

      const {
        data: eventData,
        error: eventsError,
      } = await supabase
        .from("events")
        .select(
          `
            id,
            title,
            description,
            event_date,
            start_time,
            end_time,
            venue,
            status,
            is_published,
            registration_open,
            registration_deadline
          `
        )
        .order("event_date", {
          ascending: true,
        })
        .limit(10);

      if (eventsError) {
        console.error(
          "Events loading error:",
          eventsError
        );
      }

      setEvents(eventData || []);
    } catch (err) {
      console.error(
        "Authority dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* --------------------------------
     LOADING
  -------------------------------- */

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading authority dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* --------------------------------
     ERROR
  -------------------------------- */

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <XCircle size={28} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#163A8C]"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  const roleLabel =
    authority.designation ||
    authority.role ||
    "Authority";

  const isVP =
    String(authority.role || "")
      .toLowerCase()
      .includes("vice") ||
    String(authority.designation || "")
      .toLowerCase()
      .includes("vice");

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50">

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* --------------------------------
            WELCOME SECTION
        -------------------------------- */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-100">
                <ShieldCheck size={17} />
                NSS Authority
              </div>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Welcome, {authority.full_name}
              </h1>

              <p className="mt-2 text-base font-medium text-blue-100">
                {roleLabel}
              </p>

              {authority.department && (
                <p className="mt-1 text-sm text-blue-200">
                  {authority.department}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck size={32} />

                <div>
                  <p className="font-semibold">
                    Full View Access
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    {isVP
                      ? "Vice Principal"
                      : "Principal"}{" "}
                    • NSS Cell
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-xs text-xs leading-5 text-blue-100">
                You can view NSS activities, events,
                volunteers, registrations and attendance.
              </p>
            </div>

          </div>

        </section>

        {/* --------------------------------
            STATISTICS
        -------------------------------- */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={<CalendarDays size={22} />}
          />

          <StatCard
            title="Upcoming Events"
            value={upcomingEvents}
            icon={<Clock size={22} />}
          />

          <StatCard
            title="Volunteers"
            value={totalVolunteers}
            icon={<Users size={22} />}
          />

          <StatCard
            title="Registrations"
            value={registeredVolunteers}
            icon={<UserCheck size={22} />}
          />

          <StatCard
            title="Attendance"
            value={attendanceRecords}
            icon={<ClipboardCheck size={22} />}
          />

        </section>

        {/* --------------------------------
            QUICK ACCESS
        -------------------------------- */}

        <section className="mt-6 grid gap-4 md:grid-cols-3">

          <QuickAccessCard
            icon={<CalendarDays size={23} />}
            title="View Events"
            description="See all NSS events and their current status."
            onClick={() => router.push("/authority/events")}
          />

          <QuickAccessCard
            icon={<Users size={23} />}
            title="View Volunteers"
            description="View registered NSS volunteer information."
            onClick={() => router.push("/authority/volunteers")}
          />

          <QuickAccessCard
            icon={<ClipboardCheck size={23} />}
            title="View Attendance"
            description="Review NSS attendance records and activity."
            onClick={() => router.push("/authority/attendance")}
          />

        </section>

        {/* --------------------------------
            EVENTS
        -------------------------------- */}

        <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Events
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recent and upcoming NSS events.
              </p>
            </div>

            <button
              onClick={() => router.push("/authority/events")}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163A8C]"
            >
              View All Events
              <ArrowRight size={17} />
            </button>

          </div>

          <div className="divide-y">

            {events.length === 0 ? (
              <div className="p-10 text-center">
                <CalendarDays
                  size={40}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm text-gray-500">
                  No events found.
                </p>
              </div>
            ) : (
              events.map((event) => {
                const registrationIsOpen =
                  getRegistrationStatus(event);

                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-5 p-6 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                  >

                    {/* EVENT INFO */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-lg font-bold text-gray-900">
                          {event.title}
                        </h3>

                        {event.is_published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={13} />
                            Published
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Unpublished
                          </span>
                        )}

                      </div>

                      {event.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          {formatDate(event.event_date)}
                        </span>

                        {event.start_time && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={16} />
                            {formatTime(event.start_time)}

                            {event.end_time &&
                              ` - ${formatTime(
                                event.end_time
                              )}`}
                          </span>
                        )}

                        {event.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            {event.venue}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* STATUS + VIEW */}

                    <div className="flex flex-wrap items-center gap-3">

                      {registrationIsOpen ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={14} />
                          Registration Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
                          <XCircle size={14} />
                          Registration Closed
                        </span>
                      )}

                      <button
                        onClick={() =>
                          router.push(
                            `/events/${event.id}`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B] px-4 py-2.5 text-sm font-semibold text-[#0F2B7B] transition hover:bg-blue-50"
                      >
                        <Eye size={17} />
                        View Event
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </section>

        {/* --------------------------------
            AUTHORITY ACCESS NOTICE
        -------------------------------- */}

        <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h3 className="font-bold text-[#0F2B7B]">
                Authority View Access
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                This account is intended for the Principal
                and Vice Principal. You have full visibility
                of NSS information, but administrative
                actions such as creating events, editing
                records, approving volunteers or changing
                registrations are not available here.
              </p>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

/* --------------------------------
   STAT CARD
-------------------------------- */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md">

      <div className="flex items-center justify-between gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <span className="text-3xl font-bold text-gray-900">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">
        {title}
      </p>

    </div>
  );
}

/* --------------------------------
   QUICK ACCESS CARD
-------------------------------- */

function QuickAccessCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B] transition group-hover:bg-[#0F2B7B] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <h3 className="font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>

      </div>

      <ArrowRight
        size={18}
        className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]"
      />

    </button>
  );
}