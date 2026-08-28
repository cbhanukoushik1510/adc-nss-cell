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
  CheckCircle2,
  XCircle,
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
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
};

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  course: string | null;
  year: string;
  semester: string | null;
  section: string | null;
  college_email: string;
  mobile_number: string;
  photo_url: string | null;
  volunteer_id: string | null;
};

type Registration = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string | null;
  created_at: string;
  event: EventItem | null;
  volunteer: Volunteer | null;
};

function formatDate(date: string | null) {
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

function formatRegistrationDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string | null) {
  const value = String(status || "").toLowerCase().trim();

  if (
    value === "approved" ||
    value === "confirmed" ||
    value === "registered"
  ) {
    return "Registered";
  }

  if (value === "cancelled" || value === "canceled") {
    return "Cancelled";
  }

  if (value === "rejected") {
    return "Rejected";
  }

  return status || "Registered";
}

function isCancelled(status: string | null) {
  const value = String(status || "").toLowerCase().trim();

  return (
    value === "cancelled" ||
    value === "canceled" ||
    value === "rejected"
  );
}

export default function AuthorityRegistrationsPage() {
  const router = useRouter();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "active" | "cancelled"
  >("all");

  const [eventFilter, setEventFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

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
           1. CURRENT AUTH USER
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
           3. PRINCIPAL / VICE PRINCIPAL SECURITY
        ===================================================== */

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

        /* =====================================================
           4. LOAD REGISTRATIONS
        ===================================================== */

        const {
          data: registrationData,
          error: registrationError,
        } = await supabase
          .from("event_registrations")
          .select(
            `
              id,
              event_id,
              volunteer_id,
              status,
              created_at,

              event:events (
                id,
                title,
                event_date,
                start_time,
                end_time,
                venue
              ),

              volunteer:volunteers (
                id,
                full_name,
                roll_number,
                department,
                course,
                year,
                semester,
                section,
                college_email,
                mobile_number,
                photo_url,
                volunteer_id
              )
            `
          )
          .order("created_at", {
            ascending: false,
          });

        if (registrationError) {
          console.error(
            "Registration error:",
            registrationError
          );

          throw new Error(
            registrationError.message ||
              "Unable to load registrations."
          );
        }

        const formatted =
          (registrationData || []).map(
            (item: any) => ({
              id: item.id,
              event_id: item.event_id,
              volunteer_id: item.volunteer_id,
              status: item.status,
              created_at: item.created_at,
              event: Array.isArray(item.event)
                ? item.event[0] || null
                : item.event || null,
              volunteer: Array.isArray(
                item.volunteer
              )
                ? item.volunteer[0] || null
                : item.volunteer || null,
            })
          );

        setRegistrations(formatted);
      } catch (err) {
        console.error(
          "Authority registrations error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load registrations."
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
     UNIQUE EVENTS
  ===================================================== */

  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();

    registrations.forEach((registration) => {
      if (
        registration.event_id &&
        registration.event?.title
      ) {
        map.set(
          registration.event_id,
          registration.event.title
        );
      }
    });

    return Array.from(map.entries()).sort(
      (a, b) => a[1].localeCompare(b[1])
    );
  }, [registrations]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredRegistrations =
    useMemo(() => {
      const searchValue = search
        .trim()
        .toLowerCase();

      return registrations.filter(
        (registration) => {
          const volunteer =
            registration.volunteer;

          const event = registration.event;

          const searchableText = [
            volunteer?.full_name,
            volunteer?.roll_number,
            volunteer?.department,
            volunteer?.course,
            volunteer?.college_email,
            volunteer?.mobile_number,
            volunteer?.volunteer_id,
            event?.title,
            event?.venue,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !searchValue ||
            searchableText.includes(searchValue);

          if (!matchesSearch) return false;

          if (
            eventFilter !== "all" &&
            registration.event_id !== eventFilter
          ) {
            return false;
          }

          const cancelled =
            isCancelled(registration.status);

          if (
            filter === "active" &&
            cancelled
          ) {
            return false;
          }

          if (
            filter === "cancelled" &&
            !cancelled
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      registrations,
      search,
      filter,
      eventFilter,
    ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const totalRegistrations =
    registrations.length;

  const activeRegistrations =
    registrations.filter(
      (item) => !isCancelled(item.status)
    ).length;

  const cancelledRegistrations =
    registrations.filter((item) =>
      isCancelled(item.status)
    ).length;

  const uniqueVolunteers =
    new Set(
      registrations.map(
        (item) => item.volunteer_id
      )
    ).size;

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "Authority";

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading registrations...
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
            Unable to load registrations
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
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-slate-200 bg-white lg:flex lg:flex-col">

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
                  {roleLabel}
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
              onClick={() =>
                router.push(
                  "/authority/events"
                )
              }
            />

            <SidebarLink
              icon={<Users size={18} />}
              label="Volunteers"
              onClick={() =>
                router.push(
                  "/authority/volunteers"
                )
              }
            />

            <SidebarLink
              icon={<ClipboardIcon />}
              label="Attendance"
              onClick={() =>
                router.push(
                  "/authority/attendance"
                )
              }
            />

            <SidebarLink
              icon={<UserCheck size={18} />}
              label="Registrations"
              active
              onClick={() =>
                router.push(
                  "/authority/registrations"
                )
              }
            />

            <SidebarLink
              icon={<MessageSquareIcon />}
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
              Authority accounts can view NSS
              information but cannot modify
              administrative records.
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
                  {roleLabel}
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
                    router.push(
                      "/authority"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<CalendarDays size={18} />}
                  label="Events"
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
                  icon={<ClipboardIcon />}
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
                  active
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(
                      "/authority/registrations"
                    );
                  }}
                />

                <MobileSidebarLink
                  icon={<MessageSquareIcon />}
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
          MAIN
      ===================================================== */}

      <div className="lg:pl-60">

        {/* TOP HEADER */}

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">

          <div className="flex h-[68px] items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={23} />
              </button>

              <div>

                <p className="hidden text-[11px] text-gray-400 sm:block">
                  Aurora&apos;s Degree & PG College
                </p>

                <h1 className="text-lg font-bold text-[#0F2B7B]">
                  Registrations
                </h1>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-bold text-gray-800">
                  {authority.full_name}
                </p>

                <p className="text-[10px] text-gray-500">
                  {roleLabel}
                </p>

              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2B7B] text-white">
                <ShieldCheck size={19} />
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* PAGE HEADER */}

          <section className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                  <span>
                    Authority Portal
                  </span>

                  <ChevronRight size={13} />

                  <span className="text-[#0F2B7B]">
                    Registrations
                  </span>

                </div>

                <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Event Registrations
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View volunteers registered for
                  NSS events.
                </p>

              </div>

              <button
                onClick={() =>
                  loadData(true)
                }
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

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <SummaryCard
              icon={
                <UserCheck size={20} />
              }
              label="Total Registrations"
              value={totalRegistrations}
            />

            <SummaryCard
              icon={<CheckCircle2 size={20} />}
              label="Active Registrations"
              value={activeRegistrations}
            />

            <SummaryCard
              icon={<XCircle size={20} />}
              label="Cancelled / Rejected"
              value={cancelledRegistrations}
            />

            <SummaryCard
              icon={<Users size={20} />}
              label="Unique Volunteers"
              value={uniqueVolunteers}
            />

          </section>

          {/* =====================================================
              SEARCH + FILTERS
          ===================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-4 lg:flex-row">

                {/* SEARCH */}

                <div className="relative w-full lg:max-w-md">

                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search volunteer, roll number, event..."
                    className="w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* EVENT FILTER */}

                <select
                  value={eventFilter}
                  onChange={(e) =>
                    setEventFilter(
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-[#0F2B7B] focus:bg-white"
                >

                  <option value="all">
                    All Events
                  </option>

                  {eventOptions.map(
                    ([id, title]) => (
                      <option
                        key={id}
                        value={id}
                      >
                        {title}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* STATUS FILTER */}

              <div className="flex flex-wrap gap-2">

                <FilterButton
                  label="All"
                  active={
                    filter === "all"
                  }
                  onClick={() =>
                    setFilter("all")
                  }
                />

                <FilterButton
                  label="Active"
                  active={
                    filter === "active"
                  }
                  onClick={() =>
                    setFilter("active")
                  }
                />

                <FilterButton
                  label="Cancelled / Rejected"
                  active={
                    filter === "cancelled"
                  }
                  onClick={() =>
                    setFilter("cancelled")
                  }
                />

              </div>

            </div>

          </section>

          {/* =====================================================
              RESULTS
          ===================================================== */}

          <section className="mt-6">

            <div className="mb-4 flex items-center justify-between">

              <div>

                <h3 className="text-lg font-bold text-gray-900">
                  Registrations
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredRegistrations.length}{" "}
                  registration
                  {filteredRegistrations.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

              </div>

            </div>

            {filteredRegistrations.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-400">
                  <UserCheck size={25} />
                </div>

                <h3 className="mt-4 font-bold text-gray-800">
                  No registrations found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or
                  filters.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {filteredRegistrations.map(
                  (registration) => {

                    const volunteer =
                      registration.volunteer;

                    const event =
                      registration.event;

                    const cancelled =
                      isCancelled(
                        registration.status
                      );

                    return (
                      <article
                        key={
                          registration.id
                        }
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                      >

                        <div className="p-5 sm:p-6">

                          <div className="flex flex-col gap-6 xl:flex-row">

                            {/* VOLUNTEER */}

                            <div className="flex min-w-0 flex-1 gap-4">

                              {volunteer?.photo_url ? (
                                <img
                                  src={
                                    volunteer.photo_url
                                  }
                                  alt={
                                    volunteer.full_name
                                  }
                                  className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                                  <Users
                                    size={23}
                                  />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-wrap items-center gap-2">

                                  <h4 className="text-lg font-bold text-gray-900">
                                    {volunteer?.full_name ||
                                      "Volunteer"}
                                  </h4>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                      cancelled
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {getStatusLabel(
                                      registration.status
                                    )}
                                  </span>

                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                                  {volunteer?.roll_number && (
                                    <span>
                                      Roll No:{" "}
                                      <strong className="font-semibold text-gray-700">
                                        {
                                          volunteer.roll_number
                                        }
                                      </strong>
                                    </span>
                                  )}

                                  {volunteer?.volunteer_id && (
                                    <span>
                                      Volunteer ID:{" "}
                                      <strong className="font-semibold text-gray-700">
                                        {
                                          volunteer.volunteer_id
                                        }
                                      </strong>
                                    </span>
                                  )}

                                  {volunteer?.department && (
                                    <span>
                                      {
                                        volunteer.department
                                      }
                                    </span>
                                  )}

                                  {volunteer?.year && (
                                    <span>
                                      Year:{" "}
                                      {
                                        volunteer.year
                                      }
                                    </span>
                                  )}

                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">

                                  {volunteer?.college_email && (
                                    <span>
                                      {
                                        volunteer.college_email
                                      }
                                    </span>
                                  )}

                                  {volunteer?.mobile_number && (
                                    <span>
                                      {
                                        volunteer.mobile_number
                                      }
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>

                            {/* EVENT */}

                            <div className="rounded-xl bg-slate-50 p-4 xl:w-[360px]">

                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Registered Event
                              </p>

                              <h5 className="mt-1 font-bold text-gray-900">
                                {event?.title ||
                                  "Event"}
                              </h5>

                              {event && (
                                <div className="mt-3 space-y-2 text-xs text-gray-500">

                                  <div className="flex items-center gap-2">
                                    <CalendarDays
                                      size={15}
                                      className="text-[#0F2B7B]"
                                    />
                                    {
                                      formatDate(
                                        event.event_date
                                      )
                                    }
                                  </div>

                                  {event.start_time && (
                                    <div className="flex items-center gap-2">
                                      <Clock
                                        size={15}
                                        className="text-[#0F2B7B]"
                                      />
                                      {formatTime(
                                        event.start_time
                                      )}

                                      {event.end_time &&
                                        ` - ${formatTime(
                                          event.end_time
                                        )}`}
                                    </div>
                                  )}

                                  {event.venue && (
                                    <div className="flex items-center gap-2">
                                      <MapPin
                                        size={15}
                                        className="text-[#0F2B7B]"
                                      />
                                      {
                                        event.venue
                                      }
                                    </div>
                                  )}

                                </div>
                              )}

                            </div>

                          </div>

                        </div>

                        {/* FOOTER */}

                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                            <div className="text-xs text-gray-500">

                              Registered on{" "}
                              <span className="font-semibold text-gray-700">
                                {formatRegistrationDate(
                                  registration.created_at
                                )}
                              </span>

                            </div>

                            <button
                              onClick={() =>
                                volunteer?.id &&
                                router.push(
                                  `/authority/volunteers/${volunteer.id}`
                                )
                              }
                              disabled={!volunteer?.id}
                              className="flex items-center justify-center gap-2 rounded-xl border border-[#0F2B7B] px-4 py-2 text-xs font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye size={15} />
                              View Volunteer
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* =====================================================
              VIEW ONLY NOTICE
          ===================================================== */}

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
                  Principal and Vice Principal
                  accounts can view event
                  registrations and volunteer
                  information. Registration
                  management and administrative
                  changes are available only to
                  authorized administrators.
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

/* =========================================================
   ICON HELPERS
========================================================= */

function ClipboardIcon() {
  return <ClipboardCheck size={18} />;
}

function MessageSquareIcon() {
  return <MessageSquare size={18} />;
}