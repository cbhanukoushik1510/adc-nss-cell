"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
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
  created_at: string;
  updated_at: string;
};

type RegistrationRow = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
};

type VolunteerRow = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  course: string | null;
  year: string;
  section: string | null;
  volunteer_id: string | null;
  photo_url: string | null;
};

type EventWithCount = EventRow & {
  registrationCount: number;
};

function formatDate(value: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string | null) {
  if (!value) return "";

  const [hoursString, minutes] = value.split(":");
  const hours = Number(hoursString);

  if (Number.isNaN(hours)) return value;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${suffix}`;
}

function getEventDate(event: EventRow) {
  return new Date(`${event.event_date}T23:59:59`);
}

function isUpcoming(event: EventRow) {
  return getEventDate(event).getTime() >= Date.now();
}

function getRegistrationOpen(event: EventRow) {
  const status = event.status.toLowerCase();

  return (
    status === "published" ||
    status === "registration_open" ||
    status === "registration open" ||
    status === "open"
  );
}

function getStatusLabel(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "published") return "Published";
  if (normalized.includes("open")) return "Registration Open";
  if (normalized.includes("closed")) return "Registration Closed";
  if (normalized === "draft") return "Draft";
  if (normalized === "cancelled") return "Cancelled";

  return status || "Active";
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "published") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("open")) {
    return "bg-blue-50 text-blue-700";
  }

  if (normalized.includes("closed")) {
    return "bg-slate-100 text-slate-600";
  }

  if (normalized === "cancelled") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function POEventsPage() {
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "past" | "open" | "closed"
  >("all");

  const [selectedEvent, setSelectedEvent] =
    useState<EventWithCount | null>(null);

  const [showRegistrations, setShowRegistrations] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setRefreshing(true);

      const [
        { data: eventsData, error: eventsError },
        { data: registrationsData, error: registrationsError },
        { data: volunteersData, error: volunteersError },
      ] = await Promise.all([
        supabase
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
              created_at,
              updated_at
            `
          )
          .order("event_date", { ascending: true }),

        supabase
          .from("event_registrations")
          .select("id, event_id, volunteer_id, status"),

        supabase
          .from("volunteers")
          .select(
            `
              id,
              full_name,
              roll_number,
              department,
              course,
              year,
              section,
              volunteer_id,
              photo_url
            `
          ),
      ]);

      if (eventsError) {
        console.error("Events loading error:", eventsError);
        throw eventsError;
      }

      if (registrationsError) {
        console.error("Registrations loading error:", registrationsError);
      }

      if (volunteersError) {
        console.error("Volunteers loading error:", volunteersError);
      }

      const registrationRows =
        (registrationsData as RegistrationRow[] | null) ?? [];

      const volunteerRows =
        (volunteersData as VolunteerRow[] | null) ?? [];

      const countMap = new Map<string, number>();

      registrationRows.forEach((registration) => {
        const current = countMap.get(registration.event_id) ?? 0;
        countMap.set(registration.event_id, current + 1);
      });

      const eventRows =
        (eventsData as EventRow[] | null)?.map((event) => ({
          ...event,
          registrationCount: countMap.get(event.id) ?? 0,
        })) ?? [];

      setEvents(eventRows);
      setRegistrations(registrationRows);
      setVolunteers(volunteerRows);
    } catch (error) {
      console.error("Failed to load PO events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.venue?.toLowerCase().includes(query) ||
        event.status.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filter === "upcoming") return isUpcoming(event);
      if (filter === "past") return !isUpcoming(event);
      if (filter === "open") return getRegistrationOpen(event);
      if (filter === "closed") return !getRegistrationOpen(event);

      return true;
    });
  }, [events, search, filter]);

  const totalEvents = events.length;

  const upcomingEvents = events.filter(isUpcoming).length;

  const registrationOpen = events.filter(getRegistrationOpen).length;

  const totalRegistrations = registrations.length;

  const selectedRegistrations = useMemo(() => {
    if (!selectedEvent) return [];

    return registrations
      .filter((registration) => registration.event_id === selectedEvent.id)
      .map((registration) => {
        const volunteer = volunteers.find(
          (item) => item.id === registration.volunteer_id
        );

        return {
          registration,
          volunteer,
        };
      });
  }, [selectedEvent, registrations, volunteers]);

  function openEvent(event: EventWithCount) {
    setSelectedEvent(event);
    setShowRegistrations(false);
  }

  function closeEvent() {
    setSelectedEvent(null);
    setShowRegistrations(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-28 rounded-2xl bg-white" />
              <div className="h-28 rounded-2xl bg-white" />
            </div>

            <div className="h-20 rounded-2xl bg-white" />
            <div className="h-64 rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          {/* PAGE HEADER */}
          <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 text-xs text-slate-400">
                Program Officer Portal
                <span className="mx-2">›</span>
                Events
              </div>

              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
                Events
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and monitor all NSS events and their registration status.
              </p>
            </div>

            <button
              type="button"
              onClick={loadEvents}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* STAT CARDS */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<CalendarDays size={20} />}
              value={totalEvents}
              label="Total Events"
            />

            <StatCard
              icon={<Clock3 size={20} />}
              value={upcomingEvents}
              label="Upcoming Events"
            />

            <StatCard
              icon={<Users size={20} />}
              value={registrationOpen}
              label="Registration Open"
            />
          </div>

          {/* SEARCH + FILTER */}
          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-[520px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All
                </FilterButton>

                <FilterButton
                  active={filter === "upcoming"}
                  onClick={() => setFilter("upcoming")}
                >
                  Upcoming
                </FilterButton>

                <FilterButton
                  active={filter === "past"}
                  onClick={() => setFilter("past")}
                >
                  Past
                </FilterButton>

                <FilterButton
                  active={filter === "open"}
                  onClick={() => setFilter("open")}
                >
                  Registration Open
                </FilterButton>

                <FilterButton
                  active={filter === "closed"}
                  onClick={() => setFilter("closed")}
                >
                  Registration Closed
                </FilterButton>
              </div>
            </div>
          </section>

          {/* EVENTS */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-950">
                  All Events
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1 ? "event" : "events"} found
                </p>
              </div>

              <div className="hidden text-xs text-slate-400 sm:block">
                {totalRegistrations} total registrations
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <CalendarDays size={25} />
                </div>

                <h3 className="font-serif text-lg font-bold text-slate-900">
                  No events found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing the search or filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onView={() => openEvent(event)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* EVENT DETAILS DRAWER */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={closeEvent}
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs text-slate-400">Event Details</p>

                <h2 className="mt-1 font-serif text-xl font-bold text-slate-950">
                  {selectedEvent.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEvent}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl bg-[#102f8f] p-6 text-white">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    {getStatusLabel(selectedEvent.status)}
                  </span>

                  <span className="text-sm font-semibold">
                    {selectedEvent.registrationCount} registered
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold">
                  {selectedEvent.title}
                </h3>

                {selectedEvent.description && (
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  icon={<CalendarDays size={17} />}
                  label="Date"
                  value={formatDate(selectedEvent.event_date)}
                />

                <InfoItem
                  icon={<Clock3 size={17} />}
                  label="Time"
                  value={
                    selectedEvent.start_time
                      ? `${formatTime(selectedEvent.start_time)}${
                          selectedEvent.end_time
                            ? ` – ${formatTime(selectedEvent.end_time)}`
                            : ""
                        }`
                      : "Time not specified"
                  }
                />

                <InfoItem
                  icon={<MapPin size={17} />}
                  label="Venue"
                  value={selectedEvent.venue || "Venue not specified"}
                />

                <InfoItem
                  icon={<Users size={17} />}
                  label="Registrations"
                  value={`${selectedEvent.registrationCount} volunteers`}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-950">
                      Registered Volunteers
                    </h3>

                    <p className="text-xs text-slate-500">
                      Volunteers registered for this event
                    </p>
                  </div>

                  {selectedEvent.registrationCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegistrations(!showRegistrations)
                      }
                      className="text-sm font-semibold text-[#12358f] hover:underline"
                    >
                      {showRegistrations ? "Hide" : "View All"}
                    </button>
                  )}
                </div>

                {!showRegistrations ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Users size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {selectedEvent.registrationCount}{" "}
                          {selectedEvent.registrationCount === 1
                            ? "Volunteer"
                            : "Volunteers"}
                        </p>

                        <p className="text-xs text-slate-500">
                          Registered for this event
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRegistrations.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                        No registration details available.
                      </div>
                    ) : (
                      selectedRegistrations.map(
                        ({ registration, volunteer }) => (
                          <div
                            key={registration.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                          >
                            {volunteer?.photo_url ? (
                              <img
                                src={volunteer.photo_url}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                                {volunteer?.full_name?.charAt(0) || "V"}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {volunteer?.full_name || "Volunteer"}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {volunteer?.roll_number || "No roll number"}
                                {volunteer?.department
                                  ? ` • ${volunteer.department}`
                                  : ""}
                              </p>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              {registration.status || "Registered"}
                            </span>
                          </div>
                        )
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
          {icon}
        </div>

        <span className="font-serif text-2xl font-bold text-slate-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[#12358f] text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function EventCard({
  event,
  onView,
}: {
  event: EventWithCount;
  onView: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-slate-950">
                {event.title}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                  event.status
                )}`}
              >
                {getStatusLabel(event.status)}
              </span>
            </div>

            {event.description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                {event.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#12358f]" />
                <span>{formatDate(event.event_date)}</span>
              </div>

              {event.start_time && (
                <div className="flex items-center gap-2">
                  <Clock3 size={15} className="text-[#12358f]" />
                  <span>
                    {formatTime(event.start_time)}
                    {event.end_time
                      ? ` – ${formatTime(event.end_time)}`
                      : ""}
                  </span>
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#12358f]" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 lg:w-[220px] lg:items-end">
            <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-700">
              <Users size={16} className="text-[#12358f]" />
              {event.registrationCount} registered
            </div>

            <button
              type="button"
              onClick={onView}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#12358f] px-5 text-sm font-semibold text-[#12358f] transition hover:bg-[#12358f] hover:text-white"
            >
              <Eye size={16} />
              View Event
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {isUpcoming(event) ? "Upcoming event" : "Past event"}
          </span>

          <span>
            {getRegistrationOpen(event)
              ? "Registration Open"
              : "Registration Closed"}
          </span>
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-[#12358f]">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>

      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}