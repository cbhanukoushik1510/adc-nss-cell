"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  ExternalLink,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   EVENT TYPE
========================================================= */

interface EventItem {
  id: string;

  title: string;
  description: string | null;

  event_type: string;

  event_date: string;
  event_time: string | null;

  location: string | null;

  image_url: string | null;

  registration_link: string | null;

  is_published: boolean;

  created_at: string;
  updated_at: string;
}

/* =========================================================
   FORM TYPE
========================================================= */

interface EventForm {
  title: string;
  description: string;
  event_type: string;

  event_date: string;
  event_time: string;

  location: string;

  image_url: string;

  registration_link: string;

  is_published: boolean;
}

/* =========================================================
   DEFAULT FORM
========================================================= */

const emptyForm: EventForm = {
  title: "",
  description: "",
  event_type: "Event",

  event_date: "",
  event_time: "",

  location: "",

  image_url: "",

  registration_link: "",

  is_published: false,
};

/* =========================================================
   FILTER
========================================================= */

type EventFilter =
  | "All"
  | "Published"
  | "Draft";

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<EventFilter>("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingEvent, setEditingEvent] =
    useState<EventItem | null>(null);

  const [form, setForm] =
    useState<EventForm>(emptyForm);

  /* =======================================================
     LOAD EVENTS
  ======================================================= */

  const loadEvents = async (refresh = false) => {
  if (refresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  setError("");

  try {
    const { data, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .order("event_time", { ascending: true });

    if (eventsError) {
      console.error("Supabase events error:", {
        message: eventsError.message,
        details: eventsError.details,
        hint: eventsError.hint,
        code: eventsError.code,
      });

      throw new Error(
        eventsError.message ||
          eventsError.details ||
          "Supabase could not load events."
      );
    }

    setEvents((data ?? []) as EventItem[]);
  } catch (err) {
    console.error("Events loading error:", err);

    let message = "Unable to load events.";

    if (err instanceof Error) {
      message = err.message;
    } else if (
      typeof err === "object" &&
      err !== null
    ) {
      const supabaseError = err as {
        message?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      message =
        supabaseError.message ||
        supabaseError.details ||
        "Unable to load events.";
    }

    setError(message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadEvents();
  }, []);

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =======================================================
     OPEN CREATE FORM
  ======================================================= */

  const openCreateForm = () => {
    clearMessages();

    setEditingEvent(null);

    setForm({
      ...emptyForm,
    });

    setShowForm(true);
  };

  /* =======================================================
     OPEN EDIT FORM
  ======================================================= */

  const openEditForm = (
    event: EventItem
  ) => {
    clearMessages();

    setEditingEvent(event);

    setForm({
      title: event.title || "",

      description:
        event.description || "",

      event_type:
        event.event_type || "Event",

      event_date:
        event.event_date || "",

      event_time:
        event.event_time
          ? event.event_time.slice(0, 5)
          : "",

      location:
        event.location || "",

      image_url:
        event.image_url || "",

      registration_link:
        event.registration_link || "",

      is_published:
        event.is_published,
    });

    setShowForm(true);
  };

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);

    setEditingEvent(null);

    setForm({
      ...emptyForm,
    });
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const updateForm = (
    field: keyof EventForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     SAVE EVENT
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!form.title.trim()) {
      setError(
        "Event title is required."
      );
      return;
    }

    if (!form.event_date) {
      setError(
        "Event date is required."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim() || null,

        event_type:
          form.event_type.trim() ||
          "Event",

        event_date:
          form.event_date,

        event_time:
          form.event_time || null,

        location:
          form.location.trim() || null,

        image_url:
          form.image_url.trim() || null,

        registration_link:
          form.registration_link.trim() ||
          null,

        is_published:
          form.is_published,
      };

      if (editingEvent) {
        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update(payload)
          .eq(
            "id",
            editingEvent.id
          );

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Event updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("events")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          form.is_published
            ? "Event created and published successfully."
            : "Event saved as draft successfully."
        );
      }

      closeForm();

      await loadEvents(true);
    } catch (err) {
      console.error(
        "Event save error:",
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

  /* =======================================================
     DELETE EVENT
  ======================================================= */

  const handleDelete = async (
    event: EventItem
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${event.title}"?`
      );

    if (!confirmed) return;

    clearMessages();

    setDeletingId(event.id);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id);

      if (deleteError) {
        throw deleteError;
      }

      setEvents((current) =>
        current.filter(
          (item) =>
            item.id !== event.id
        )
      );

      setSuccess(
        "Event deleted successfully."
      );
    } catch (err) {
      console.error(
        "Event delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete event."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     TOGGLE PUBLISH
  ======================================================= */

  const togglePublish = async (
    event: EventItem
  ) => {
    clearMessages();

    setPublishingId(event.id);

    try {
      const newStatus =
        !event.is_published;

      const {
        error: updateError,
      } = await supabase
        .from("events")
        .update({
          is_published: newStatus,
        })
        .eq("id", event.id);

      if (updateError) {
        throw updateError;
      }

      setEvents((current) =>
        current.map((item) =>
          item.id === event.id
            ? {
                ...item,
                is_published:
                  newStatus,
              }
            : item
        )
      );

      setSuccess(
        newStatus
          ? "Event published successfully."
          : "Event unpublished successfully."
      );
    } catch (err) {
      console.error(
        "Publish toggle error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to change publish status."
      );
    } finally {
      setPublishingId(null);
    }
  };

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    events.length;

  const publishedCount =
    events.filter(
      (event) =>
        event.is_published
    ).length;

  const draftCount =
    events.filter(
      (event) =>
        !event.is_published
    ).length;

  /* =======================================================
     FILTERED EVENTS
  ======================================================= */

  const filteredEvents =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          if (
            filter === "Published" &&
            !event.is_published
          ) {
            return false;
          }

          if (
            filter === "Draft" &&
            event.is_published
          ) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          const searchableText = [
            event.title,
            event.description,
            event.event_type,
            event.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchText
          );
        }
      );
    }, [
      events,
      search,
      filter,
    ]);

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (
    value: string
  ) => {
    if (!value) return "—";

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =======================================================
     TIME FORMAT
  ======================================================= */

  const formatTime = (
    value: string | null
  ) => {
    if (!value) return "";

    const parts =
      value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hour =
      Number(parts[0]);

    const minute =
      parts[1];

    if (
      Number.isNaN(hour)
    ) {
      return value;
    }

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B]">
                  Events
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Create, manage and publish NSS events.
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                loadEvents(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#143a96]"
            >
              <Plus className="h-5 w-5" />

              Add Event
            </button>

          </div>
        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">

            <div className="flex items-center gap-3">

              <CheckCircle className="h-5 w-5 shrink-0" />

              <p className="text-sm font-semibold">
                {success}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="text-green-700 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X className="h-5 w-5" />
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Total Events
            </p>

            <p className="mt-2 text-3xl font-bold text-[#0F2B7B]">
              {totalCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-gray-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-600">
              {draftCount}
            </p>
          </div>

        </div>

        {/* =================================================
            EVENTS CARD
        ================================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          {/* HEADER */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Event Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage all upcoming and past NSS events.
                </p>
              </div>

              <div className="relative w-full lg:w-[380px]">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search events..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* FILTERS */}

            <div className="mt-5 flex flex-wrap gap-2">

              {(
                [
                  "All",
                  "Published",
                  "Draft",
                ] as EventFilter[]
              ).map(
                (item) => {

                  const count =
                    item === "All"
                      ? totalCount
                      : item ===
                        "Published"
                      ? publishedCount
                      : draftCount;

                  const active =
                    filter === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(item)
                      }
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-[#0F2B7B] text-white"
                          : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                      }`}
                    >
                      {item}

                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                          active
                            ? "bg-white/15"
                            : "bg-white"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="p-14 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading events...
              </p>

            </div>
          ) : filteredEvents.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No events found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "No events match your search."
                  : filter ===
                    "Published"
                  ? "There are no published events."
                  : filter === "Draft"
                  ? "There are no draft events."
                  : "Create your first NSS event."}
              </p>

              {!search &&
                filter === "All" && (
                  <button
                    type="button"
                    onClick={
                      openCreateForm
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />

                    Create Event
                  </button>
                )}

            </div>
          ) : (

            /* =================================================
               EVENT LIST
            ================================================= */

            <div className="divide-y divide-slate-200">

              {filteredEvents.map(
                (event) => (
                  <article
                    key={event.id}
                    className="p-5 transition hover:bg-slate-50 sm:p-6"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                      {/* EVENT IMAGE */}

                      <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-32 sm:w-48">

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
                          <div className="flex h-full w-full items-center justify-center text-[#0F2B7B]">
                            <CalendarDays className="h-10 w-10" />
                          </div>
                        )}

                      </div>

                      {/* EVENT INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-gray-900">
                            {event.title}
                          </h3>

                          {event.is_published ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              <EyeOff className="h-3.5 w-3.5" />
                              Draft
                            </span>
                          )}

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0F2B7B]">
                            {event.event_type}
                          </span>

                        </div>

                        {event.description && (
                          <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                            {
                              event.description
                            }
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-[#0F2B7B]" />

                            {formatDate(
                              event.event_date
                            )}
                          </span>

                          {event.event_time && (
                            <span className="inline-flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />

                              {formatTime(
                                event.event_time
                              )}
                            </span>
                          )}

                          {event.location && (
                            <span className="inline-flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />

                              {event.location}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2 xl:w-[360px] xl:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            togglePublish(
                              event
                            )
                          }
                          disabled={
                            publishingId ===
                            event.id
                          }
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            event.is_published
                              ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {publishingId ===
                          event.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : event.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}

                          {event.is_published
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              event
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-slate-50"
                        >
                          <Edit3 className="h-4 w-4" />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              event
                            )
                          }
                          disabled={
                            deletingId ===
                            event.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId ===
                          event.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#0F2B7B]">
                    {editingEvent
                      ? "Edit Event"
                      : "Create New Event"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {editingEvent
                      ? "Update the event information below."
                      : "Add a new NSS event to the system."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  className="rounded-xl p-2 text-gray-500 transition hover:bg-slate-100 hover:text-gray-900"
                >
                  <X className="h-6 w-6" />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-6 p-6"
              >

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Title
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "title",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Example: NSS Orientation Programme"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Type
                  </label>

                  <select
                    value={
                      form.event_type
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "event_type",
                        event
                          .target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="Event">
                      Event
                    </option>

                    <option value="Workshop">
                      Workshop
                    </option>

                    <option value="Camp">
                      Camp
                    </option>

                    <option value="Meeting">
                      Meeting
                    </option>

                    <option value="Awareness">
                      Awareness Programme
                    </option>

                    <option value="Celebration">
                      Celebration
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "description",
                        event
                          .target
                          .value
                      )
                    }
                    rows={5}
                    placeholder="Describe the event..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DATE / TIME */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Event Date
                      <span className="text-red-500">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="date"
                      value={
                        form.event_date
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "event_date",
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Event Time
                    </label>

                    <input
                      type="time"
                      value={
                        form.event_time
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "event_time",
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                </div>

                {/* LOCATION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={
                      form.location
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "location",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Example: ADC Auditorium"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* IMAGE URL */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      form.image_url
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "image_url",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                  {form.image_url && (
                    <div className="mt-3 h-40 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={
                          form.image_url
                        }
                        alt="Event preview"
                        className="h-full w-full object-cover"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* REGISTRATION LINK */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Registration Link
                  </label>

                  <div className="relative">

                    <ExternalLink className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="url"
                      value={
                        form.registration_link
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "registration_link",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="https://..."
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                  </div>
                </div>

                {/* PUBLISH */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <label className="flex cursor-pointer items-start gap-4">

                    <input
                      type="checkbox"
                      checked={
                        form.is_published
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "is_published",
                          event
                            .target
                            .checked
                        )
                      }
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0F2B7B] focus:ring-[#0F2B7B]"
                    />

                    <div>

                      <p className="font-bold text-gray-800">
                        Publish this event
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        Published events can be displayed on the public website. Draft events remain available only for management.
                      </p>

                    </div>

                  </label>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : editingEvent
                      ? "Save Changes"
                      : form.is_published
                      ? "Create & Publish"
                      : "Save Draft"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminDashboardLayout>
  );
}