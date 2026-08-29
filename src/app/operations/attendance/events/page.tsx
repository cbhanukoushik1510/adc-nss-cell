"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FileText,
  MapPin,
  MoreVertical,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
  Loader2,
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
  attendance_token: string | null;
  event_time: string | null;
  event_type: string | null;
  location: string | null;
  registration_link: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
};

type EventForm = {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  event_type: string;
  location: string;
  capacity: string;
  registration_deadline: string;
  registration_open: boolean;
  is_published: boolean;
};

type FilterType =
  | "all"
  | "draft"
  | "published"
  | "completed";

const EMPTY_FORM: EventForm = {
  title: "",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  event_type: "",
  location: "",
  capacity: "",
  registration_deadline: "",
  registration_open: true,
  is_published: false,
};

function formatDate(date: string) {
  if (!date) return "—";

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

  const parts = time.split(":");
  const hour = Number(parts[0]);
  const minute = parts[1] || "00";

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function normalizeStatus(
  status: string | null | undefined
) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isCompleted(event: EventRow) {
  const status = normalizeStatus(event.status);

  if (
    status === "completed" ||
    status === "complete"
  ) {
    return true;
  }

  if (!event.event_date) return false;

  return (
    new Date(`${event.event_date}T23:59:59`) <
    new Date()
  );
}

function getDisplayStatus(event: EventRow) {
  if (isCompleted(event)) return "completed";

  if (event.is_published) return "published";

  return "draft";
}

export default function AttendanceEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] =
    useState<EventRow | null>(null);

  const [form, setForm] =
    useState<EventForm>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [deleteEvent, setDeleteEvent] =
    useState<EventRow | null>(null);

  const [deleting, setDeleting] = useState(false);

  /*
   * ==========================================================
   * LOAD EVENTS
   * ==========================================================
   */

  const loadEvents = useCallback(async () => {
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      /*
       * Verify Attendance Coordinator.
       */
      const {
        data: operationsUser,
        error: operationsError,
      } = await supabase
        .from("nss_operations_team")
        .select("id, role, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (operationsError) {
        throw operationsError;
      }

      if (!operationsUser) {
        throw new Error(
          "Your Operations Team account could not be verified."
        );
      }

      if (
        operationsUser.role !==
        "attendance_coordinator"
      ) {
        throw new Error(
          "You are not authorized to manage events."
        );
      }

      if (operationsUser.is_active === false) {
        throw new Error(
          "Your Attendance Coordinator account is inactive."
        );
      }

      /*
       * Load events.
       */
      const {
        data,
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
        .order("event_date", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (eventsError) {
        throw eventsError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error(
        "Attendance events error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load events."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /*
   * ==========================================================
   * FILTER EVENTS
   * ==========================================================
   */

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const displayStatus =
        getDisplayStatus(event);

      const matchesFilter =
        filter === "all" ||
        displayStatus === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      return (
        event.title
          ?.toLowerCase()
          .includes(query) ||
        event.venue
          ?.toLowerCase()
          .includes(query) ||
        event.location
          ?.toLowerCase()
          .includes(query) ||
        event.event_type
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [events, filter, search]);

  /*
   * ==========================================================
   * COUNTS
   * ==========================================================
   */

  const counts = useMemo(() => {
    return {
      all: events.length,

      draft: events.filter(
        (event) =>
          getDisplayStatus(event) === "draft"
      ).length,

      published: events.filter(
        (event) =>
          getDisplayStatus(event) === "published"
      ).length,

      completed: events.filter(
        (event) =>
          getDisplayStatus(event) === "completed"
      ).length,
    };
  }, [events]);

  /*
   * ==========================================================
   * OPEN CREATE FORM
   * ==========================================================
   */

  const handleCreate = () => {
    setEditingEvent(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowForm(true);
    setOpenMenu(null);
  };

  /*
   * ==========================================================
   * OPEN EDIT FORM
   * ==========================================================
   */

  const handleEdit = (event: EventRow) => {
    setEditingEvent(event);

    setForm({
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date || "",
      start_time: event.start_time
        ? event.start_time.slice(0, 5)
        : "",
      end_time: event.end_time
        ? event.end_time.slice(0, 5)
        : "",
      venue: event.venue || "",
      event_type: event.event_type || "",
      location: event.location || "",
      capacity:
        event.capacity !== null &&
        event.capacity !== undefined
          ? String(event.capacity)
          : "",
      registration_deadline:
        event.registration_deadline
          ? new Date(
              event.registration_deadline
            )
              .toISOString()
              .slice(0, 16)
          : "",
      registration_open:
        event.registration_open !== false,
      is_published:
        event.is_published === true,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
    setOpenMenu(null);
  };

  /*
   * ==========================================================
   * FORM CHANGE
   * ==========================================================
   */

  const updateForm = (
    field: keyof EventForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * ==========================================================
   * SAVE EVENT
   * ==========================================================
   */

  const handleSave = async (
    publishOverride?: boolean
  ) => {
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Event title is required.");
      return;
    }

    if (!form.event_date) {
      setError("Event date is required.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const published =
        publishOverride !== undefined
          ? publishOverride
          : form.is_published;

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        event_date: form.event_date,
        start_time:
          form.start_time || null,
        end_time:
          form.end_time || null,
        event_time:
          form.start_time || null,
        venue:
          form.venue.trim() || null,
        event_type:
          form.event_type.trim() || null,
        location:
          form.location.trim() || null,
        capacity:
          form.capacity.trim()
            ? Number(form.capacity)
            : null,
        participants_count:
          editingEvent?.participants_count || 0,
        registration_open:
          form.registration_open,
        registration_deadline:
          form.registration_deadline
            ? new Date(
                form.registration_deadline
              ).toISOString()
            : null,
        is_published: published,
        status: published
          ? "published"
          : "draft",
      };

      if (editingEvent) {
        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update(payload)
          .eq("id", editingEvent.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          published
            ? "Event updated and published successfully."
            : "Event updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("events")
          .insert({
            ...payload,
            created_by: user.id,
          });

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          published
            ? "Event created and published successfully."
            : "Event saved as draft successfully."
        );
      }

      setShowForm(false);
      setEditingEvent(null);
      setForm(EMPTY_FORM);

      await loadEvents();
    } catch (err) {
      console.error(
        "Save event error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save event."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * PUBLISH / UNPUBLISH
   * ==========================================================
   */

  const togglePublish = async (
    event: EventRow
  ) => {
    setError("");
    setSuccess("");
    setOpenMenu(null);

    try {
      const newPublished =
        event.is_published !== true;

      const {
        error: updateError,
      } = await supabase
        .from("events")
        .update({
          is_published: newPublished,
          status: newPublished
            ? "published"
            : "draft",
        })
        .eq("id", event.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        newPublished
          ? "Event published successfully."
          : "Event moved back to draft."
      );

      await loadEvents();
    } catch (err) {
      console.error(
        "Publish event error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update event."
      );
    }
  };

  /*
   * ==========================================================
   * REGISTRATION TOGGLE
   * ==========================================================
   */

  const toggleRegistration = async (
    event: EventRow
  ) => {
    setError("");
    setSuccess("");
    setOpenMenu(null);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("events")
        .update({
          registration_open:
            event.registration_open !== true,
        })
        .eq("id", event.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        event.registration_open
          ? "Event registration closed."
          : "Event registration opened."
      );

      await loadEvents();
    } catch (err) {
      console.error(
        "Registration toggle error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update registration."
      );
    }
  };

  /*
   * ==========================================================
   * DELETE
   * ==========================================================
   */

  const confirmDelete = async () => {
    if (!deleteEvent) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("events")
        .delete()
        .eq("id", deleteEvent.id);

      if (deleteError) {
        throw deleteError;
      }

      setDeleteEvent(null);

      setSuccess(
        "Event deleted successfully."
      );

      await loadEvents();
    } catch (err) {
      console.error(
        "Delete event error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete event."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-10">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/operations/attendance"
              className="transition hover:text-slate-900"
            >
              Attendance
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-700">
              Events
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Event Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create, manage, publish and monitor NSS
            events.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
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

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </section>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <AlertBox
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {success && (
        <AlertBox
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          title="All Events"
          value={counts.all}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />

        <MiniStat
          title="Draft"
          value={counts.draft}
          active={filter === "draft"}
          onClick={() => setFilter("draft")}
        />

        <MiniStat
          title="Published"
          value={counts.published}
          active={filter === "published"}
          onClick={() => setFilter("published")}
        />

        <MiniStat
          title="Completed"
          value={counts.completed}
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
        />
      </section>

      {/* =====================================================
          SEARCH / FILTER
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events, venue, location or type..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              count={counts.all}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />

            <FilterButton
              label="Draft"
              count={counts.draft}
              active={filter === "draft"}
              onClick={() => setFilter("draft")}
            />

            <FilterButton
              label="Published"
              count={counts.published}
              active={filter === "published"}
              onClick={() =>
                setFilter("published")
              }
            />

            <FilterButton
              label="Completed"
              count={counts.completed}
              active={filter === "completed"}
              onClick={() =>
                setFilter("completed")
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          EVENTS
      ====================================================== */}

      {loading ? (
        <EventsSkeleton />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          search={search}
          onCreate={handleCreate}
          onClear={() => {
            setSearch("");
            setFilter("all");
          }}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Event
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Date & Time
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Registration
                    </th>

                    <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map(
                    (event) => (
                      <EventTableRow
                        key={event.id}
                        event={event}
                        menuOpen={
                          openMenu === event.id
                        }
                        onMenu={() =>
                          setOpenMenu(
                            openMenu === event.id
                              ? null
                              : event.id
                          )
                        }
                        onEdit={() =>
                          handleEdit(event)
                        }
                        onPublish={() =>
                          togglePublish(event)
                        }
                        onRegistration={() =>
                          toggleRegistration(
                            event
                          )
                        }
                        onDelete={() =>
                          setDeleteEvent(event)
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredEvents.map(
              (event) => (
                <EventMobileCard
                  key={event.id}
                  event={event}
                  onEdit={() =>
                    handleEdit(event)
                  }
                  onPublish={() =>
                    togglePublish(event)
                  }
                  onRegistration={() =>
                    toggleRegistration(event)
                  }
                  onDelete={() =>
                    setDeleteEvent(event)
                  }
                />
              )
            )}
          </div>
        </>
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <EventFormModal
          form={form}
          editing={!!editingEvent}
          saving={saving}
          onChange={updateForm}
          onClose={() => {
            if (!saving) {
              setShowForm(false);
              setEditingEvent(null);
            }
          }}
          onSave={() => handleSave()}
          onPublish={() =>
            handleSave(true)
          }
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteEvent && (
        <DeleteModal
          event={deleteEvent}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteEvent(null);
            }
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

/*
 * ============================================================
 * MINI STAT
 * ============================================================
 */

function MiniStat({
  title,
  value,
  active,
  onClick,
}: {
  title: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left shadow-sm transition ${
        active
          ? "border-slate-900 bg-slate-950 text-white"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <p
        className={`text-xs font-medium ${
          active
            ? "text-slate-300"
            : "text-slate-500"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          active
            ? "text-white"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </button>
  );
}

/*
 * ============================================================
 * FILTER BUTTON
 * ============================================================
 */

function FilterButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition ${
        active
          ? "bg-slate-950 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {label}

      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/15 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/*
 * ============================================================
 * EVENT TABLE ROW
 * ============================================================
 */

function EventTableRow({
  event,
  menuOpen,
  onMenu,
  onEdit,
  onPublish,
  onRegistration,
  onDelete,
}: {
  event: EventRow;
  menuOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onRegistration: () => void;
  onDelete: () => void;
}) {
  const status = getDisplayStatus(event);

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0">
            <p className="max-w-[270px] truncate text-sm font-semibold text-slate-900">
              {event.title}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {event.event_type ||
                "NSS Event"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-800">
          {formatDate(event.event_date)}
        </p>

        {event.start_time && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 size={13} />
            {formatTime(event.start_time)}
          </p>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="max-w-[190px]">
          <p className="truncate text-sm text-slate-700">
            {event.venue ||
              event.location ||
              "Not specified"}
          </p>

          {event.location &&
            event.venue && (
              <p className="mt-1 truncate text-xs text-slate-400">
                {event.location}
              </p>
            )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Users
            size={15}
            className="text-slate-400"
          />

          <span className="text-sm font-medium text-slate-700">
            {event.participants_count || 0}

            {event.capacity
              ? ` / ${event.capacity}`
              : ""}
          </span>
        </div>

        <p
          className={`mt-1 text-[11px] font-medium ${
            event.registration_open
              ? "text-emerald-600"
              : "text-slate-400"
          }`}
        >
          {event.registration_open
            ? "Registration Open"
            : "Registration Closed"}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-5 py-4">
        <div className="relative flex justify-end">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <MoreVertical size={17} />
          </button>

          {menuOpen && (
            <ActionMenu
              event={event}
              onEdit={onEdit}
              onPublish={onPublish}
              onRegistration={
                onRegistration
              }
              onDelete={onDelete}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

/*
 * ============================================================
 * MOBILE EVENT CARD
 * ============================================================
 */

function EventMobileCard({
  event,
  onEdit,
  onPublish,
  onRegistration,
  onDelete,
}: {
  event: EventRow;
  onEdit: () => void;
  onPublish: () => void;
  onRegistration: () => void;
  onDelete: () => void;
}) {
  const status = getDisplayStatus(event);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarDays size={18} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {event.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {event.event_type ||
                "NSS Event"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoItem
          icon={<CalendarDays size={14} />}
          label="Date"
          value={formatDate(
            event.event_date
          )}
        />

        <InfoItem
          icon={<Clock3 size={14} />}
          label="Time"
          value={
            formatTime(
              event.start_time
            ) || "Not set"
          }
        />

        <InfoItem
          icon={<MapPin size={14} />}
          label="Venue"
          value={
            event.venue ||
            event.location ||
            "Not specified"
          }
        />

        <InfoItem
          icon={<Users size={14} />}
          label="Registration"
          value={`${event.participants_count || 0}${
            event.capacity
              ? ` / ${event.capacity}`
              : ""
          }`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Edit3 size={14} />
          Edit
        </button>

        <button
          type="button"
          onClick={onPublish}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          {event.is_published ? (
            <>
              <Eye size={14} />
              Unpublish
            </>
          ) : (
            <>
              <Check size={14} />
              Publish
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRegistration}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {event.registration_open
            ? "Close Registration"
            : "Open Registration"}
        </button>

        <Link
          href={`/operations/attendance/events/${event.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Eye size={14} />
          View
        </Link>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={14} />
        Delete Event
      </button>
    </div>
  );
}

/*
 * ============================================================
 * ACTION MENU
 * ============================================================
 */

function ActionMenu({
  event,
  onEdit,
  onPublish,
  onRegistration,
  onDelete,
}: {
  event: EventRow;
  onEdit: () => void;
  onPublish: () => void;
  onRegistration: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      <Link
        href={`/operations/attendance/events/${event.id}`}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Eye size={15} />
        View Event
      </Link>

      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Edit3 size={15} />
        Edit Event
      </button>

      <button
        type="button"
        onClick={onPublish}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {event.is_published ? (
          <>
            <XCircle size={15} />
            Unpublish Event
          </>
        ) : (
          <>
            <Check size={15} />
            Publish Event
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onRegistration}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <Users size={15} />

        {event.registration_open
          ? "Close Registration"
          : "Open Registration"}
      </button>

      <Link
        href={`/operations/attendance/events/${event.id}/qr`}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <QrCode size={15} />
        Attendance QR
      </Link>

      <div className="my-1 border-t border-slate-100" />

      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete Event
      </button>
    </div>
  );
}

/*
 * ============================================================
 * STATUS BADGE
 * ============================================================
 */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles = {
    draft:
      "bg-slate-100 text-slate-600",
    published:
      "bg-emerald-50 text-emerald-700",
    completed:
      "bg-blue-50 text-blue-700",
  };

  const labels = {
    draft: "Draft",
    published: "Published",
    completed: "Completed",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        styles[
          status as keyof typeof styles
        ] || styles.draft
      }`}
    >
      {labels[
        status as keyof typeof labels
      ] || "Draft"}
    </span>
  );
}

/*
 * ============================================================
 * INFO ITEM
 * ============================================================
 */

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
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/*
 * ============================================================
 * EVENT FORM MODAL
 * ============================================================
 */

function EventFormModal({
  form,
  editing,
  saving,
  onChange,
  onClose,
  onSave,
  onPublish,
}: {
  form: EventForm;
  editing: boolean;
  saving: boolean;
  onChange: (
    field: keyof EventForm,
    value: string | boolean
  ) => void;
  onClose: () => void;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {editing
                ? "Edit Event"
                : "Create Event"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add the details for the NSS event.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">
            {/* Basic Details */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Basic Details
              </h3>

              <div className="mt-3 space-y-4">
                <Input
                  label="Event Title"
                  required
                  value={form.title}
                  onChange={(value) =>
                    onChange(
                      "title",
                      value
                    )
                  }
                  placeholder="Enter event title"
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      onChange(
                        "description",
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Describe the NSS event..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Event Type"
                    value={form.event_type}
                    onChange={(value) =>
                      onChange(
                        "event_type",
                        value
                      )
                    }
                    placeholder="e.g. Blood Donation"
                  />

                  <Input
                    label="Capacity"
                    type="number"
                    value={form.capacity}
                    onChange={(value) =>
                      onChange(
                        "capacity",
                        value
                      )
                    }
                    placeholder="Maximum participants"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Date & Time
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Event Date"
                  required
                  type="date"
                  value={form.event_date}
                  onChange={(value) =>
                    onChange(
                      "event_date",
                      value
                    )
                  }
                />

                <Input
                  label="Start Time"
                  type="time"
                  value={form.start_time}
                  onChange={(value) =>
                    onChange(
                      "start_time",
                      value
                    )
                  }
                />

                <Input
                  label="End Time"
                  type="time"
                  value={form.end_time}
                  onChange={(value) =>
                    onChange(
                      "end_time",
                      value
                    )
                  }
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Location
              </h3>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Venue"
                  value={form.venue}
                  onChange={(value) =>
                    onChange(
                      "venue",
                      value
                    )
                  }
                  placeholder="e.g. College Auditorium"
                />

                <Input
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    onChange(
                      "location",
                      value
                    )
                  }
                  placeholder="Building / campus location"
                />
              </div>
            </div>

            {/* Registration */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Registration
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Open Registration
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Allow volunteers to register for
                      this event.
                    </p>
                  </div>

                  <Toggle
                    checked={
                      form.registration_open
                    }
                    onChange={(value) =>
                      onChange(
                        "registration_open",
                        value
                      )
                    }
                  />
                </label>

                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-700">
                    Registration Deadline
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      form.registration_deadline
                    }
                    onChange={(e) =>
                      onChange(
                        "registration_deadline",
                        e.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Publishing */}
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Publishing
              </h3>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Publish Event
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Published events can be displayed
                      to volunteers and used for
                      registration.
                    </p>
                  </div>

                  <Toggle
                    checked={form.is_published}
                    onChange={(value) =>
                      onChange(
                        "is_published",
                        value
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          {!editing && (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="mx-auto animate-spin"
                />
              ) : (
                "Save Draft"
              )}
            </button>
          )}

          <button
            type="button"
            onClick={
              form.is_published
                ? onSave
                : onPublish
            }
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : form.is_published ? (
              "Save Changes"
            ) : (
              "Publish Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * INPUT
 * ============================================================
 */

function Input({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
      />
    </div>
  );
}

/*
 * ============================================================
 * TOGGLE
 * ============================================================
 */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? "bg-slate-950"
          : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
          checked
            ? "left-6"
            : "left-1"
        }`}
      />
    </button>
  );
}

/*
 * ============================================================
 * DELETE MODAL
 * ============================================================
 */

function DeleteModal({
  event,
  deleting,
  onCancel,
  onConfirm,
}: {
  event: EventRow;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 size={20} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          Delete Event?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            {event.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * ALERT
 * ============================================================
 */

function AlertBox({
  type,
  message,
  onClose,
}: {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? (
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <Check
          size={18}
          className="mt-0.5 shrink-0"
        />
      )}

      <p className="flex-1 leading-6">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 transition hover:bg-black/5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/*
 * ============================================================
 * EMPTY STATE
 * ============================================================
 */

function EmptyState({
  search,
  onCreate,
  onClear,
}: {
  search: string;
  onCreate: () => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <CalendarDays size={25} />
      </div>

      <h2 className="mt-5 text-base font-bold text-slate-900">
        {search
          ? "No matching events"
          : "No events yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Try changing your search or filter."
          : "Create your first NSS event to start managing registrations and attendance."}
      </p>

      <div className="mt-5 flex justify-center gap-2">
        {search && (
          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear Search
          </button>
        )}

        {!search && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={15} />
            Create Event
          </button>
        )}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * SKELETON
 * ============================================================
 */

function EventsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        )
      )}
    </div>
  );
}