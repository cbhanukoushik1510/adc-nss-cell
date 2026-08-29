"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  UserCheck,
  Users,
  XCircle,
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
  status: string;
  capacity: number | null;
  participants_count: number;
  created_at: string;
  updated_at: string;
  attendance_token: string | null;
  event_time: string | null;
  event_type: string | null;
  location: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
};

type AttendanceRow = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  source: string;
  scanned_at: string | null;
  marked_at: string | null;
  marked_by: string | null;
};

type OperationsUser = {
  id: string;
  role: string;
  is_active: boolean | null;
};

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
};

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return "";

  const parts = time.split(":");
  const hour = Number(parts[0]);
  const minute = parts[1] || "00";

  if (Number.isNaN(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function normalizeStatus(status: string | null | undefined) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isPresent(status: string | null | undefined) {
  const value = normalizeStatus(status);

  return (
    value === "present" ||
    value === "attended" ||
    value === "approved"
  );
}

function isAbsent(status: string | null | undefined) {
  const value = normalizeStatus(status);

  return (
    value === "absent" ||
    value === "not_attended"
  );
}

export default function AttendanceCoordinatorDashboard() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [operationsUser, setOperationsUser] =
    useState<OperationsUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      /*
       * Verify Attendance Coordinator.
       *
       * Expected table:
       * nss_operations_team
       *
       * Expected fields:
       * user_id
       * role
       * is_active
       */
      const {
        data: operationsData,
        error: operationsError,
      } = await supabase
        .from("nss_operations_team")
        .select("id, role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (operationsError) {
        throw operationsError;
      }

      if (!operationsData) {
        throw new Error(
          "Your Operations Team account could not be verified."
        );
      }

      if (
        operationsData.role !== "attendance_coordinator"
      ) {
        throw new Error(
          "You are not authorized to access the Attendance Coordinator dashboard."
        );
      }

      if (operationsData.is_active === false) {
        throw new Error(
          "Your Attendance Coordinator account is inactive."
        );
      }

      setOperationsUser(operationsData);

      /*
       * EVENTS
       */
      const {
        data: eventsData,
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
          status,
          capacity,
          participants_count,
          created_at,
          updated_at,
          attendance_token,
          event_time,
          event_type,
          location,
          is_published,
          registration_open,
          registration_deadline
        `)
        .order("event_date", {
          ascending: false,
        });

      if (eventsError) {
        throw eventsError;
      }

      /*
       * ATTENDANCE
       *
       * We only retrieve fields needed for
       * dashboard statistics.
       *
       * No volunteer personal/profile data
       * is loaded here.
       */
      const {
        data: attendanceData,
        error: attendanceError,
      } = await supabase
        .from("attendance")
        .select(`
          id,
          event_id,
          volunteer_id,
          status,
          source,
          scanned_at,
          marked_at,
          marked_by
        `);

      if (attendanceError) {
        throw attendanceError;
      }

      setEvents(eventsData || []);
      setAttendance(attendanceData || []);
    } catch (err) {
      console.error(
        "Attendance Coordinator dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  /*
   * ==========================================================
   * DASHBOARD STATISTICS
   * ==========================================================
   */

  const totalEvents = events.length;

  const publishedEvents = events.filter(
    (event) => event.is_published === true
  ).length;

  const upcomingEvents = events.filter((event) => {
    if (!event.event_date) return false;

    const date = new Date(`${event.event_date}T23:59:59`);

    return date >= new Date();
  }).length;

  const completedEvents = events.filter((event) => {
    const status = normalizeStatus(event.status);

    if (
      status === "completed" ||
      status === "complete"
    ) {
      return true;
    }

    if (!event.event_date) return false;

    const date = new Date(`${event.event_date}T23:59:59`);

    return date < new Date();
  }).length;

  const presentCount = attendance.filter((record) =>
    isPresent(record.status)
  ).length;

  const absentCount = attendance.filter((record) =>
    isAbsent(record.status)
  ).length;

  const attendanceRecords = attendance.length;

  /*
   * ==========================================================
   * EVENT-WISE ATTENDANCE COUNTS
   * ==========================================================
   */

  const attendanceByEvent = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        present: number;
        absent: number;
      }
    >();

    events.forEach((event) => {
      map.set(event.id, {
        total: 0,
        present: 0,
        absent: 0,
      });
    });

    attendance.forEach((record) => {
      const current = map.get(record.event_id);

      if (!current) return;

      current.total += 1;

      if (isPresent(record.status)) {
        current.present += 1;
      }

      if (isAbsent(record.status)) {
        current.absent += 1;
      }
    });

    return map;
  }, [events, attendance]);

  /*
   * ==========================================================
   * RECENT EVENTS
   * ==========================================================
   */

  const recentEvents = useMemo(() => {
    return [...events]
      .sort(
        (a, b) =>
          new Date(`${b.event_date}T00:00:00`).getTime() -
          new Date(`${a.event_date}T00:00:00`).getTime()
      )
      .slice(0, 6);
  }, [events]);

  /*
   * ==========================================================
   * QUICK ACTIONS
   * ==========================================================
   */

  const quickActions = [
    {
      title: "Create Event",
      description: "Create and publish a new NSS event.",
      href: "/operations/attendance/events",
      icon: <Plus size={20} />,
    },
    {
      title: "Manage Events",
      description: "View, edit and manage NSS events.",
      href: "/operations/attendance/events",
      icon: <CalendarDays size={20} />,
    },
    {
      title: "Attendance",
      description: "Manage event-wise attendance and QR.",
      href: "/operations/attendance/records",
      icon: <ClipboardCheck size={20} />,
    },
    {
      title: "Documents",
      description: "Access registration and attendance PDFs.",
      href: "/operations/attendance/documents",
      icon: <FileText size={20} />,
    },
    {
      title: "Assigned Work",
      description: "View work assigned by management.",
      href: "/operations/attendance/assigned-work",
      icon: <CheckCircle2 size={20} />,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <span>Operations</span>
            <span>/</span>
            <span className="font-medium text-slate-700">
              Attendance
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Attendance Coordinator
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage NSS event operations, attendance and
            related documents from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </section>

      {/* =====================================================
          ERROR
      ====================================================== */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load dashboard
            </p>

            <p className="mt-1 text-xs leading-5">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100"
          >
            <XCircle size={17} />
          </button>
        </div>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* =================================================
              STATUS
          ================================================== */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Overall Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current NSS event and attendance overview.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
              <StatCard
                title="Total Events"
                value={totalEvents}
                subtitle="All events"
                icon={<CalendarDays size={20} />}
              />

              <StatCard
                title="Upcoming"
                value={upcomingEvents}
                subtitle="Scheduled events"
                icon={<Clock3 size={20} />}
              />

              <StatCard
                title="Published"
                value={publishedEvents}
                subtitle="Live events"
                icon={<CheckCircle2 size={20} />}
              />

              <StatCard
                title="Completed"
                value={completedEvents}
                subtitle="Completed events"
                icon={<ClipboardCheck size={20} />}
              />

              <StatCard
                title="Present"
                value={presentCount}
                subtitle={`${attendanceRecords} attendance records`}
                icon={<UserCheck size={20} />}
              />

              <StatCard
                title="Absent"
                value={absentCount}
                subtitle="Attendance records"
                icon={<Users size={20} />}
              />
            </div>
          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================== */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-950">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quickly access your main operational functions.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                      {action.icon}
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
                    />
                  </div>

                  <h3 className="mt-5 text-sm font-bold text-slate-950">
                    {action.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* =================================================
              ASSIGNED WORK + RECENT EVENTS
          ================================================== */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.5fr]">
            {/* ASSIGNED WORK */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Assigned Work
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Work assigned to you.
                  </p>
                </div>

                <Link
                  href="/operations/attendance/assigned-work"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950"
                >
                  View All
                </Link>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <ClipboardCheck size={20} />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Assigned work will appear here
                  </p>

                  <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
                    Tasks assigned by management, Program
                    Officers or Heads will be shown here.
                  </p>

                  <Link
                    href="/operations/attendance/assigned-work"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open Assigned Work
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* RECENT EVENTS */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-950">
                    Recent Events
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest NSS events and attendance status.
                  </p>
                </div>

                <Link
                  href="/operations/attendance/events"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950"
                >
                  View All
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentEvents.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <CalendarDays
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No events available
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Events will appear here once they are
                    created.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentEvents.map((event) => {
                    const stats =
                      attendanceByEvent.get(event.id) || {
                        total: 0,
                        present: 0,
                        absent: 0,
                      };

                    const isPublished =
                      event.is_published === true;

                    const isUpcoming =
                      new Date(
                        `${event.event_date}T23:59:59`
                      ) >= new Date();

                    return (
                      <Link
                        href={`/operations/attendance/events/${event.id}`}
                        key={event.id}
                        className="group block px-5 py-4 transition hover:bg-slate-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <CalendarDays size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-slate-900">
                                  {event.title}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(event.event_date)}

                                  {event.start_time
                                    ? ` • ${formatTime(
                                        event.start_time
                                      )}`
                                    : ""}

                                  {event.venue
                                    ? ` • ${event.venue}`
                                    : ""}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                  isPublished
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {isPublished
                                  ? "Published"
                                  : "Draft"}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                {isUpcoming
                                  ? "Upcoming"
                                  : "Completed"}
                              </span>

                              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                                {stats.present} Present
                              </span>

                              <span className="rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
                                {stats.absent} Absent
                              </span>

                              <span className="ml-auto text-[11px] text-slate-400">
                                {stats.total} records
                              </span>
                            </div>
                          </div>

                          <ArrowRight
                            size={16}
                            className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              BOTTOM SUMMARY
          ================================================== */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              icon={<CalendarDays size={19} />}
              title="Event Management"
              description="Create, manage and publish NSS events."
              href="/operations/attendance/events"
            />

            <SummaryCard
              icon={<ClipboardCheck size={19} />}
              title="Attendance Management"
              description="View event-wise attendance and QR workflow."
              href="/operations/attendance/records"
            />

            <SummaryCard
              icon={<FileText size={19} />}
              title="Document Center"
              description="Keep registration and attendance PDFs together."
              href="/operations/attendance/documents"
            />
          </section>
        </>
      )}
    </div>
  );
}

/*
 * ============================================================
 * STAT CARD
 * ============================================================
 */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
}: StatCardProps) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        {href && (
          <ArrowRight
            size={16}
            className="text-slate-300"
          />
        )}
      </div>

      <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {subtitle}
      </p>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
}

/*
 * ============================================================
 * SUMMARY CARD
 * ============================================================
 */

function SummaryCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
          {icon}
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-950">
            {title}
          </h3>
        </div>

        <ArrowRight
          size={17}
          className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600"
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </Link>
  );
}

/*
 * ============================================================
 * LOADING SKELETON
 * ============================================================
 */

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <section>
        <div className="mb-4">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            )
          )}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            )
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.5fr]">
        <div className="h-[350px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-[350px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </section>
    </div>
  );
}