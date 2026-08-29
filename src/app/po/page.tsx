"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  RefreshCw,
  Clock,
  Megaphone,
  ClipboardList,
  UserCog,
  ChevronRight,
  Eye,
  Plus,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

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
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  status: string;
  is_published: boolean | null;
  registration_open: boolean | null;
};

type DashboardStats = {
  totalEvents: number;
  upcomingEvents: number;
  totalVolunteers: number;
  registrations: number;
  attendanceRecords: number;
  activities: number;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTime(time: string | null) {
  if (!time) return "";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PODashboard() {
  const router = useRouter();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);

  const [stats, setStats] =
    useState<DashboardStats>({
      totalEvents: 0,
      upcomingEvents: 0,
      totalVolunteers: 0,
      registrations: 0,
      attendanceRecords: 0,
      activities: 0,
    });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /* ---------------------------------------------------
           1. CURRENT AUTH USER
        --------------------------------------------------- */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        /* ---------------------------------------------------
           2. GET AUTHORITY / PO PROFILE
        --------------------------------------------------- */

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
            "PO profile error:",
            authorityError
          );

          throw new Error(
            authorityError.message ||
              "Unable to load Program Officer profile."
          );
        }

        if (!authorityData) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        /* ---------------------------------------------------
           3. PO SECURITY CHECK
        --------------------------------------------------- */

        const role = String(
          authorityData.role || ""
        )
          .trim()
          .toLowerCase();

        const designation = String(
          authorityData.designation || ""
        )
          .trim()
          .toLowerCase();

        const isPO =
          role === "program officer 1" ||
          role === "program officer 2" ||
          role === "program officer" ||
          designation.includes("program officer");

        if (!isPO) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        setAuthority(authorityData);

        /* ---------------------------------------------------
           4. DATE
        --------------------------------------------------- */

        const today = new Date()
          .toISOString()
          .split("T")[0];

        /* ---------------------------------------------------
           5. TOTAL EVENTS
        --------------------------------------------------- */

        const {
          count: totalEvents,
          error: totalEventsError,
        } = await supabase
          .from("events")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (totalEventsError) {
          console.error(
            "Total events error:",
            totalEventsError
          );
        }

        /* ---------------------------------------------------
           6. UPCOMING EVENTS
        --------------------------------------------------- */

        const {
          count: upcomingEvents,
          error: upcomingEventsError,
        } = await supabase
          .from("events")
          .select("id", {
            count: "exact",
            head: true,
          })
          .gte("event_date", today);

        if (upcomingEventsError) {
          console.error(
            "Upcoming events error:",
            upcomingEventsError
          );
        }

        /* ---------------------------------------------------
           7. VOLUNTEERS
        --------------------------------------------------- */

        const {
          count: totalVolunteers,
          error: volunteersError,
        } = await supabase
          .from("volunteers")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (volunteersError) {
          console.error(
            "Volunteers error:",
            volunteersError
          );
        }

        /* ---------------------------------------------------
           8. REGISTRATIONS
        --------------------------------------------------- */

        const {
          count: registrations,
          error: registrationsError,
        } = await supabase
          .from("event_registrations")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (registrationsError) {
          console.error(
            "Registrations error:",
            registrationsError
          );
        }

        /* ---------------------------------------------------
           9. ATTENDANCE
        --------------------------------------------------- */

        const {
          count: attendanceRecords,
          error: attendanceError,
        } = await supabase
          .from("attendance_records")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (attendanceError) {
          console.error(
            "Attendance error:",
            attendanceError
          );
        }

        /* ---------------------------------------------------
           10. ACTIVITIES
        --------------------------------------------------- */

        const {
          count: activities,
          error: activitiesError,
        } = await supabase
          .from("activities")
          .select("id", {
            count: "exact",
            head: true,
          });

        if (activitiesError) {
          console.error(
            "Activities error:",
            activitiesError
          );
        }

        setStats({
          totalEvents: totalEvents || 0,
          upcomingEvents: upcomingEvents || 0,
          totalVolunteers: totalVolunteers || 0,
          registrations: registrations || 0,
          attendanceRecords: attendanceRecords || 0,
          activities: activities || 0,
        });

        /* ---------------------------------------------------
           11. RECENT / UPCOMING EVENTS
        --------------------------------------------------- */

        const {
          data: eventData,
          error: eventsError,
        } = await supabase
          .from("events")
          .select(
            `
              id,
              title,
              event_date,
              start_time,
              end_time,
              venue,
              status,
              is_published,
              registration_open
            `
          )
          .order("event_date", {
            ascending: true,
          })
          .limit(8);

        if (eventsError) {
          console.error(
            "Events error:",
            eventsError
          );
        }

        setEvents(eventData || []);
      } catch (err) {
        console.error(
          "PO dashboard error:",
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
    },
    [router]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =======================================================
     UPCOMING EVENT LIST
  ======================================================= */

  const upcomingEventList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const date = new Date(
        `${event.event_date}T00:00:00`
      );

      return date >= today;
    });
  }, [events]);

  /* =======================================================
     ROLE LABEL
  ======================================================= */

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "Program Officer";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading Program Officer dashboard...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={() => loadDashboard()}
            className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#163A8C]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (!authority) {
    return null;
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">

        {/* LOGO */}

        <div className="flex h-[68px] items-center border-b border-slate-200 px-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
            <ShieldCheck size={21} />
          </div>

          <div className="ml-3 min-w-0">

            <p className="truncate text-sm font-bold text-[#0F2B7B]">
              ADC NSS CELL
            </p>

            <p className="text-[10px] text-gray-500">
              Program Officer Portal
            </p>

          </div>

        </div>

        {/* USER PROFILE */}

        <div className="border-b border-slate-200 p-3">

          <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <UserCog size={18} />
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[11px] text-blue-100">
                  {roleLabel}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="mt-3 space-y-1">

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Dashboard"
              active
              onClick={() =>
                router.push("/po")
              }
            />

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Events"
              onClick={() =>
                router.push("/po/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              onClick={() =>
                router.push("/po/volunteers")
              }
            />

            <SidebarLink
              icon={<ClipboardCheck size={18} />}
              label="Attendance"
              onClick={() =>
                router.push("/po/attendance")
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              onClick={() =>
                router.push("/po/registrations")
              }
            />

            <SidebarLink
              icon={<Activity size={18} />}
              label="Activities"
              onClick={() =>
                router.push("/po/activities")
              }
            />

            <SidebarLink
              icon={<Megaphone size={18} />}
              label="Announcements"
              onClick={() =>
                router.push("/po/announcements")
              }
            />

            <SidebarLink
              icon={<MessageSquare size={18} />}
              label="Messages & Suggestions"
              onClick={() =>
                router.push("/po/messages")
              }
            />

          </div>

          {/* OPERATIONS */}

          <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Operations
          </p>

          <div className="mt-3 space-y-1">

            <SidebarLink
              icon={<ClipboardList size={18} />}
              label="Assign Work"
              onClick={() =>
                router.push("/po/tasks")
              }
            />

            <SidebarLink
              icon={<UserCog size={18} />}
              label="Heads & Deputies"
              onClick={() =>
                router.push("/po/heads")
              }
            />

          </div>

        </nav>

        {/* BOTTOM */}

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                PO Access
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Program Officers can view NSS information
              and manage assigned operational work.
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* ===================================================
          MOBILE SIDEBAR
      =================================================== */}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileMenuOpen(false)
            }
          />

          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">

            <div className="flex h-[68px] items-center justify-between border-b px-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                  <ShieldCheck size={21} />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#0F2B7B]">
                    ADC NSS CELL
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Program Officer Portal
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="p-3">

              <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">

                <p className="text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="mt-1 text-[11px] text-blue-100">
                  {roleLabel}
                </p>

              </div>

            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Dashboard"
                  active
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po");
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Events"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/events");
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/volunteers");
                  }}
                />

                <MobileSidebarLink
                  icon={<ClipboardCheck size={18} />}
                  label="Attendance"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/attendance");
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCheck size={18} />}
                  label="Registrations"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/registrations");
                  }}
                />

                <MobileSidebarLink
                  icon={<Activity size={18} />}
                  label="Activities"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/activities");
                  }}
                />

                <MobileSidebarLink
                  icon={<Megaphone size={18} />}
                  label="Announcements"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/announcements");
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageSquare size={18} />}
                  label="Messages & Suggestions"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/messages");
                  }}
                />

                <div className="my-4 border-t border-slate-200" />

                <MobileSidebarLink
                  icon={<ClipboardList size={18} />}
                  label="Assign Work"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/tasks");
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCog size={18} />}
                  label="Heads & Deputies"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/po/heads");
                  }}
                />

              </div>

            </nav>

            <div className="border-t p-3">

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </aside>

        </div>
      )}

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <div className="lg:pl-60">

        

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* PAGE HEADER */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                  <span>
                    Program Officer Portal
                  </span>

                  <ChevronRight size={13} />

                  <span className="text-[#0F2B7B]">
                    Dashboard
                  </span>

                </div>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Welcome, {authority.full_name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage and monitor NSS activities,
                  volunteers, attendance and operational
                  work from one place.
                </p>

              </div>

              <button
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
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

            </div>

          </section>

          {/* =================================================
              PROFILE / ROLE BANNER
          ================================================= */}

          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-6 text-white shadow-lg sm:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                    {authority.role}
                  </span>

                  <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                    Active
                  </span>

                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  {authority.full_name}
                </h3>

                <p className="mt-1 text-sm text-blue-100">
                  {roleLabel}
                </p>

                {authority.department && (
                  <p className="mt-1 text-xs text-blue-200">
                    {authority.department}
                  </p>
                )}

              </div>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">

                <UserCog size={40} />

                <p className="mt-3 text-sm font-bold">
                  Program Officer Access
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-blue-100">
                  Full NSS information visibility with
                  operational management and work
                  assignment capabilities.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">

            <StatCard
              icon={<CalendarDays size={21} />}
              title="Total Events"
              value={stats.totalEvents}
            />

            <StatCard
              icon={<Clock size={21} />}
              title="Upcoming Events"
              value={stats.upcomingEvents}
            />

            <StatCard
              icon={<Users size={21} />}
              title="Volunteers"
              value={stats.totalVolunteers}
            />

            <StatCard
              icon={<UserCheck size={21} />}
              title="Registrations"
              value={stats.registrations}
            />

            <StatCard
              icon={<ClipboardCheck size={21} />}
              title="Attendance"
              value={stats.attendanceRecords}
            />

            <StatCard
              icon={<Activity size={21} />}
              title="Activities"
              value={stats.activities}
            />

          </section>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section className="mt-6">

            <div className="mb-3">

              <h3 className="text-lg font-bold text-gray-900">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Frequently used Program Officer functions.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAction
                icon={<Plus size={20} />}
                title="Create / Manage Event"
                description="Manage NSS event operations."
                onClick={() =>
                  router.push("/po/events")
                }
              />

              <QuickAction
                icon={<ClipboardList size={20} />}
                title="Assign Work"
                description="Assign operational tasks to Heads and Deputies."
                onClick={() =>
                  router.push("/po/tasks")
                }
              />

              <QuickAction
                icon={<ClipboardCheck size={20} />}
                title="Manage Attendance"
                description="View and manage NSS attendance."
                onClick={() =>
                  router.push("/po/attendance")
                }
              />

              <QuickAction
                icon={<MessageSquare size={20} />}
                title="Communication Centre"
                description="Communicate with NSS leadership and teams."
                onClick={() =>
                  router.push("/po/messages")
                }
              />

            </div>

          </section>

          {/* =================================================
              UPCOMING EVENTS
          ================================================= */}

          <section className="mt-8">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Events
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Latest scheduled NSS activities.
                </p>

              </div>

              <button
                onClick={() =>
                  router.push("/po/events")
                }
                className="flex items-center gap-1 text-xs font-bold text-[#0F2B7B] hover:underline"
              >
                View All
                <ChevronRight size={14} />
              </button>

            </div>

            {upcomingEventList.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <CalendarDays
                  size={28}
                  className="mx-auto text-gray-400"
                />

                <p className="mt-3 text-sm font-semibold text-gray-700">
                  No upcoming events
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  There are currently no upcoming NSS events.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {upcomingEventList
                  .slice(0, 5)
                  .map((event) => (

                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h4 className="font-bold text-gray-900">
                              {event.title}
                            </h4>

                            {event.is_published && (
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                                Published
                              </span>
                            )}

                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                            <span className="flex items-center gap-1.5">

                              <CalendarDays
                                size={14}
                                className="text-[#0F2B7B]"
                              />

                              {formatDate(
                                event.event_date
                              )}

                            </span>

                            {event.start_time && (
                              <span className="flex items-center gap-1.5">

                                <Clock
                                  size={14}
                                  className="text-[#0F2B7B]"
                                />

                                {formatTime(
                                  event.start_time
                                )}

                                {event.end_time &&
                                  ` - ${formatTime(
                                    event.end_time
                                  )}`}

                              </span>
                            )}

                            {event.venue && (
                              <span>
                                📍 {event.venue}
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          {event.registration_open ? (

                            <span className="rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-bold text-green-700">
                              Registration Open
                            </span>

                          ) : (

                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-600">
                              Registration Closed
                            </span>

                          )}

                          <button
                            onClick={() =>
                              router.push(
                                `/events/${event.id}`
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border border-[#0F2B7B] px-3.5 py-2 text-xs font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                          >

                            <Eye size={15} />

                            View

                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </section>

          {/* =================================================
              RESPONSIBILITY AREA
          ================================================= */}

          <section className="mt-8 grid gap-5 lg:grid-cols-2">

            <ManagementCard
              icon={<Users size={21} />}
              title="Volunteer Management"
              description="View volunteer profiles, academic information, NSS participation and related records."
              button="View Volunteers"
              onClick={() =>
                router.push("/po/volunteers")
              }
            />

            <ManagementCard
              icon={<UserCog size={21} />}
              title="Heads & Deputies"
              description="Coordinate operational work and assign responsibilities to NSS Heads and Deputy Heads."
              button="Manage Team"
              onClick={() =>
                router.push("/po/heads")
              }
            />

            <ManagementCard
              icon={<ClipboardCheck size={21} />}
              title="Attendance Management"
              description="Monitor attendance records and NSS participation across activities and events."
              button="View Attendance"
              onClick={() =>
                router.push("/po/attendance")
              }
            />

            <ManagementCard
              icon={<MessageSquare size={21} />}
              title="Communication Centre"
              description="Communicate directly with Principal, Vice Principal, the other Program Officer, Heads and Deputies."
              button="Open Messages"
              onClick={() =>
                router.push("/po/messages")
              }
            />

          </section>

          {/* =================================================
              ACCESS NOTICE
          ================================================= */}

          <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h3 className="font-bold text-[#0F2B7B]">
                  Program Officer Access
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Program Officers have broad visibility
                  across NSS operations and can coordinate
                  work with Heads and Deputies. They can
                  monitor volunteers, events, attendance,
                  registrations and activities, while using
                  the communication centre for coordination
                  with other authorized NSS personnel.
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   SIDEBAR LINK
========================================================= */

function SidebarLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0F2B7B] text-white shadow-sm"
          : "text-gray-600 hover:bg-slate-100 hover:text-[#0F2B7B]"
      }`}
    >
      {icon}

      <span>{label}</span>

      {active && (
        <ChevronRight
          size={15}
          className="ml-auto"
        />
      )}
    </button>
  );
}

/* =========================================================
   MOBILE SIDEBAR LINK
========================================================= */

function MobileSidebarLink({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-[#0F2B7B] text-white"
          : "text-gray-600 hover:bg-slate-100"
      }`}
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>

      </div>

      <p className="mt-3 text-sm font-medium text-gray-500">
        {title}
      </p>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
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
      className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <ChevronRight
          size={17}
          className="text-gray-300 transition group-hover:text-[#0F2B7B]"
        />

      </div>

      <h4 className="mt-4 text-sm font-bold text-gray-900">
        {title}
      </h4>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   MANAGEMENT CARD
========================================================= */

function ManagementCard({
  icon,
  title,
  description,
  button,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
          {icon}
        </div>

        <div className="min-w-0">

          <h3 className="font-bold text-gray-900">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {description}
          </p>

          <button
            onClick={onClick}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#163A8C]"
          >

            {button}

            <ChevronRight size={15} />

          </button>

        </div>

      </div>

    </div>
  );
}