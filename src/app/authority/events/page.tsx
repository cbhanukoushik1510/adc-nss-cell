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
  Search,
  Eye,
  Clock,
  MapPin,
  ChevronRight,
  Menu,
  X,
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
  registration_count: number;
};

function formatDate(date: string) {
  if (!date) return "-";

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

function isRegistrationCurrentlyOpen(event: EventItem) {
  if (!event.registration_open) return false;

  if (!event.registration_deadline) return true;

  return new Date(event.registration_deadline).getTime() > Date.now();
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null;

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuthorityEventsPage() {
  const router = useRouter();

  const [authority, setAuthority] = useState<Authority | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "open" | "closed"
  >("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /* =====================================================
           1. CURRENT USER
        ===================================================== */

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        /* =====================================================
           2. AUTHORITY PROFILE
        ===================================================== */

        const { data: authorityData, error: authorityError } =
          await supabase
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
          console.error("Authority error:", authorityError);

          throw new Error(
            authorityError.message ||
              "Unable to verify authority account."
          );
        }

        if (!authorityData) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        /* =====================================================
           3. PRINCIPAL / VICE PRINCIPAL SECURITY CHECK
        ===================================================== */

        const role = String(authorityData.role || "").toLowerCase();
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

        /* =====================================================
           4. LOAD EVENTS
        ===================================================== */

        const { data: eventData, error: eventsError } =
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
                venue,
                status,
                is_published,
                registration_open,
                registration_deadline
              `
            )
            .order("event_date", {
              ascending: true,
            });

        if (eventsError) {
          console.error("Events error:", eventsError);

          throw new Error(
            eventsError.message || "Unable to load events."
          );
        }

        /* =====================================================
           5. REGISTRATION COUNTS
        ===================================================== */

        const eventsWithCounts: EventItem[] =
          await Promise.all(
            (eventData || []).map(async (event) => {
              const {
                count,
                error: registrationError,
              } = await supabase
                .from("event_registrations")
                .select("id", {
                  count: "exact",
                  head: true,
                })
                .eq("event_id", event.id);

              if (registrationError) {
                console.error(
                  `Registration count error for ${event.id}:`,
                  registrationError
                );
              }

              return {
                ...event,
                registration_count: count || 0,
              };
            })
          );

        setEvents(eventsWithCounts);
      } catch (err) {
        console.error("Authority events error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load events."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* =====================================================
     FILTER EVENTS
  ===================================================== */

  const filteredEvents = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const searchValue = search.trim().toLowerCase();

    return events.filter((event) => {
      const eventDate = new Date(
        `${event.event_date}T00:00:00`
      );

      const matchesSearch =
        !searchValue ||
        event.title.toLowerCase().includes(searchValue) ||
        (event.description || "")
          .toLowerCase()
          .includes(searchValue) ||
        (event.venue || "")
          .toLowerCase()
          .includes(searchValue);

      if (!matchesSearch) return false;

      const registrationOpen =
        isRegistrationCurrentlyOpen(event);

      if (filter === "upcoming") {
        return eventDate >= today;
      }

      if (filter === "past") {
        return eventDate < today;
      }

      if (filter === "open") {
        return registrationOpen;
      }

      if (filter === "closed") {
        return !registrationOpen;
      }

      return true;
    });
  }, [events, search, filter]);

  const upcomingCount = events.filter((event) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return (
      new Date(`${event.event_date}T00:00:00`) >= today
    );
  }).length;

  const openRegistrationCount = events.filter(
    isRegistrationCurrentlyOpen
  ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading events...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="mt-5 text-xl font-bold text-gray-900">
            Unable to load events
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            onClick={() => loadData()}
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

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
              Authority Portal
            </p>
          </div>
        </div>

        {/* USER */}

        <div className="border-b border-slate-200 p-3">
          <div className="rounded-xl bg-gradient-to-r from-[#0F2B7B] to-[#1C4ED8] p-3 text-white">
            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {authority.full_name}
                </p>

                <p className="truncate text-[11px] text-blue-100">
                  {authority.designation ||
                    authority.role ||
                    "Authority"}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 px-3 py-5">

          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="mt-3 space-y-1">

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Dashboard"
              onClick={() =>
                router.push("/authority")
              }
            />

            <SidebarLink
              icon={<CalendarDays size={18} />}
              label="Events"
              active
              onClick={() =>
                router.push("/authority/events")
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              onClick={() =>
                router.push("/authority/volunteers")
              }
            />

            <SidebarLink
              icon={<ClipboardCheck size={18} />}
              label="Attendance"
              onClick={() =>
                router.push("/authority/attendance")
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              onClick={() =>
                router.push(
                  "/authority/registrations"
                )
              }
            />

            <SidebarLink
              icon={<MessageSquare size={18} />}
              label="Messages & Suggestions"
              onClick={() =>
                router.push(
                  "/authority/messages"
                )
              }
            />

          </div>
        </nav>

        {/* VIEW ONLY */}

        <div className="border-t border-slate-200 p-3">

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex items-center gap-2 text-[#0F2B7B]">

              <ShieldCheck size={16} />

              <span className="text-xs font-bold">
                View Only Access
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-4 text-gray-500">
              Authority accounts can view NSS information
              but cannot modify administrative records.
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

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

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
                    Authority Portal
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
                  {authority.designation ||
                    authority.role ||
                    "Authority"}
                </p>

              </div>

            </div>

            <nav className="flex-1 px-3 py-4">

              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Main Menu
              </p>

              <div className="mt-3 space-y-1">

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Dashboard"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/authority");
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Events"
                  active
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/events"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<Users size={18} />}
                  label="Volunteers"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/volunteers"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<ClipboardCheck size={18} />}
                  label="Attendance"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/attendance"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<UserCheck size={18} />}
                  label="Registrations"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/registrations"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageSquare size={18} />}
                  label="Messages & Suggestions"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/messages"
                    );
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

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:pl-60">

        {/* =================================================
            IMPORTANT:
            NO SECOND GLOBAL HEADER HERE
            ================================================= */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                  <span>
                    Authority Portal
                  </span>

                  <ChevronRight size={13} />

                  <span className="text-[#0F2B7B]">
                    Events
                  </span>

                </div>

                <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Events
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  View all NSS events and their current
                  registration status.
                </p>

              </div>

              <button
                onClick={() => loadData(true)}
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
              SUMMARY CARDS
          ================================================= */}

          <section className="grid gap-4 sm:grid-cols-3">

            <SummaryCard
              icon={<CalendarDays size={20} />}
              label="Total Events"
              value={events.length}
            />

            <SummaryCard
              icon={<Clock size={20} />}
              label="Upcoming Events"
              value={upcomingCount}
            />

            <SummaryCard
              icon={<UserCheck size={20} />}
              label="Registration Open"
              value={openRegistrationCount}
            />

          </section>

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative w-full lg:max-w-md">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search events..."
                  className="w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <div className="flex flex-wrap gap-2">

                <FilterButton
                  label="All"
                  active={filter === "all"}
                  onClick={() =>
                    setFilter("all")
                  }
                />

                <FilterButton
                  label="Upcoming"
                  active={filter === "upcoming"}
                  onClick={() =>
                    setFilter("upcoming")
                  }
                />

                <FilterButton
                  label="Past"
                  active={filter === "past"}
                  onClick={() =>
                    setFilter("past")
                  }
                />

                <FilterButton
                  label="Registration Open"
                  active={filter === "open"}
                  onClick={() =>
                    setFilter("open")
                  }
                />

                <FilterButton
                  label="Registration Closed"
                  active={filter === "closed"}
                  onClick={() =>
                    setFilter("closed")
                  }
                />

              </div>

            </div>

          </section>

          {/* =================================================
              EVENTS LIST
          ================================================= */}

          <section className="mt-6">

            <div className="mb-3">

              <h2 className="text-lg font-bold text-gray-900">
                {filter === "all"
                  ? "All Events"
                  : filter === "upcoming"
                  ? "Upcoming Events"
                  : filter === "past"
                  ? "Past Events"
                  : filter === "open"
                  ? "Open Registrations"
                  : "Closed Registrations"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredEvents.length} event
                {filteredEvents.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            {filteredEvents.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-400">
                  <CalendarDays size={25} />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  No events found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or filter.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredEvents.map((event) => {

                  const registrationOpen =
                    isRegistrationCurrentlyOpen(
                      event
                    );

                  const deadline =
                    formatDeadline(
                      event.registration_deadline
                    );

                  const eventDate = new Date(
                    `${event.event_date}T00:00:00`
                  );

                  const today = new Date();

                  today.setHours(0, 0, 0, 0);

                  const isPast =
                    eventDate.getTime() <
                    today.getTime();

                  return (
                    <article
                      key={event.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >

                      <div className="p-5 sm:p-6">

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                          {/* EVENT INFORMATION */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                                {event.title}
                              </h3>

                              {event.is_published ? (

                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                  Published
                                </span>

                              ) : (

                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                                  Draft
                                </span>

                              )}

                            </div>

                            {event.description && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                                {event.description}
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                              <span className="flex items-center gap-1.5">
                                <CalendarDays
                                  size={16}
                                  className="text-[#0F2B7B]"
                                />

                                {formatDate(
                                  event.event_date
                                )}
                              </span>

                              {event.start_time && (
                                <span className="flex items-center gap-1.5">

                                  <Clock
                                    size={16}
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
                                <span className="flex items-center gap-1.5">

                                  <MapPin
                                    size={16}
                                    className="text-[#0F2B7B]"
                                  />

                                  {event.venue}

                                </span>
                              )}

                            </div>

                          </div>

                          {/* RIGHT SIDE */}

                          <div className="flex shrink-0 flex-col gap-3 xl:min-w-[300px]">

                            <div className="flex flex-wrap items-center justify-between gap-3">

                              {registrationOpen ? (

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">

                                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />

                                  Registration Open

                                </span>

                              ) : (

                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">

                                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />

                                  Registration Closed

                                </span>

                              )}

                              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">

                                <Users size={16} />

                                {event.registration_count} registered

                              </div>

                            </div>

                            {deadline && (
                              <p className="text-xs text-gray-400">

                                Deadline:{" "}

                                <span className="font-medium text-gray-500">
                                  {deadline}
                                </span>

                              </p>
                            )}

                            {isPast && (
                              <p className="text-xs font-medium text-gray-400">
                                This event date has passed.
                              </p>
                            )}

                            <button
                              onClick={() =>
                                router.push(
                                  `/events/${event.id}`
                                )
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F2B7B] px-4 py-2.5 text-sm font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                            >
                              <Eye size={17} />
                              View Event
                            </button>

                          </div>

                        </div>

                      </div>

                      {/* REGISTRATION SUMMARY */}

                      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                          <div className="flex items-center gap-2 text-xs text-gray-500">

                            <UserCheck
                              size={15}
                              className="text-[#0F2B7B]"
                            />

                            <span>
                              Registered Volunteers
                            </span>

                          </div>

                          <span className="text-sm font-bold text-gray-800">
                            {event.registration_count}
                          </span>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

          </section>

          {/* =================================================
              VIEW ONLY NOTICE
          ================================================= */}

          <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

              <div>

                <h3 className="font-bold text-[#0F2B7B]">
                  Authority View Access
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Principal and Vice Principal accounts
                  can view NSS event information and
                  registration status. Event creation,
                  editing, deletion, publishing and
                  registration controls are available only
                  to authorized administrators.
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
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
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
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
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
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#0F2B7B] text-white"
          : "bg-slate-100 text-gray-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}