"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  Lock,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Unlock,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   TYPES
========================================================= */

interface EventItem {
  id: string;

  title: string;
  description: string | null;

  event_date: string;

  start_time: string | null;
  end_time: string | null;

  venue: string | null;

  image_url: string | null;

  status: string;

  capacity: number | null;

  participants_count: number;

  created_by: string | null;

  created_at: string;
  updated_at: string;

  attendance_token: string | null;

  /*
   * Older / additional event fields that already exist
   * in your events table.
   */
  event_time: string | null;
  event_type: string | null;
  location: string | null;
  registration_link: string | null;
  is_published: boolean | null;

  /*
   * Registration control fields.
   */
  registration_open: boolean | null;
  registration_deadline: string | null;
}

interface EventForm {
  title: string;
  description: string;

  event_date: string;
  start_time: string;
  end_time: string;

  venue: string;

  image_url: string;

  registration_link: string;

  status: string;

  capacity: string;

  is_published: boolean;

  registration_open: boolean;

  registration_deadline: string;
}

const emptyForm: EventForm = {
  title: "",
  description: "",

  event_date: "",
  start_time: "",
  end_time: "",

  venue: "",

  image_url: "",

  registration_link: "",

  status: "Upcoming",

  capacity: "",

  is_published: false,

  registration_open: false,

  registration_deadline: "",
};

type EventFilter =
  | "All"
  | "Published"
  | "Draft";

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const item = error as {
      message?: string;
      details?: string;
      hint?: string;
    };

    return (
      item.message ||
      item.details ||
      item.hint ||
      "Something went wrong."
    );
  }

  return "Something went wrong.";
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminEventsPage() {
  const [events, setEvents] =
    useState<EventItem[]>([]);

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

  const [registrationId, setRegistrationId] =
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
     CHECK REGISTRATION STATUS
  ======================================================= */

  const isRegistrationOpen = useCallback(
    (event: EventItem) => {
      /*
       * Registration must first be manually enabled.
       */
      if (event.registration_open !== true) {
        return false;
      }

      /*
       * No deadline means registration stays open
       * until an admin manually closes it.
       */
      if (!event.registration_deadline) {
        return true;
      }

      const deadline = new Date(
        event.registration_deadline
      ).getTime();

      /*
       * Invalid deadline:
       * do not accidentally close registration.
       */
      if (Number.isNaN(deadline)) {
        return true;
      }

      /*
       * Automatic close after deadline.
       */
      return Date.now() < deadline;
    },
    []
  );

  /* =======================================================
     LOAD EVENTS
  ======================================================= */

  const loadEvents = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
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
            image_url,
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
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          });

        if (eventsError) {
          console.error(
            "Supabase events loading error:",
            eventsError
          );

          throw eventsError;
        }

        setEvents(
          (data ?? []) as EventItem[]
        );
      } catch (err) {
        console.error(
          "Events loading error:",
          err
        );

        setError(
          getErrorMessage(err) ||
            "Unable to load events."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =======================================================
     CREATE FORM
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
     EDIT FORM
  ======================================================= */

  const openEditForm = (
    event: EventItem
  ) => {
    clearMessages();

    setEditingEvent(event);

    let deadline = "";

    if (event.registration_deadline) {
      const date = new Date(
        event.registration_deadline
      );

      if (!Number.isNaN(date.getTime())) {
        const year =
          date.getFullYear();

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          date.getDate()
        ).padStart(2, "0");

        const hours = String(
          date.getHours()
        ).padStart(2, "0");

        const minutes = String(
          date.getMinutes()
        ).padStart(2, "0");

        deadline =
          `${year}-${month}-${day}` +
          `T${hours}:${minutes}`;
      }
    }

    setForm({
      title: event.title || "",

      description:
        event.description || "",

      event_date:
        event.event_date || "",

      start_time:
        event.start_time
          ? event.start_time.slice(0, 5)
          : event.event_time
          ? event.event_time.slice(0, 5)
          : "",

      end_time:
        event.end_time
          ? event.end_time.slice(0, 5)
          : "",

      venue:
        event.venue ||
        event.location ||
        "",

      image_url:
        event.image_url || "",

      registration_link:
        event.registration_link || "",

      status:
        event.status || "Upcoming",

      capacity:
        event.capacity !== null &&
        event.capacity !== undefined
          ? String(event.capacity)
          : "",

      is_published:
        event.is_published === true,

      registration_open:
        event.registration_open === true,

      registration_deadline:
        deadline,
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

    if (
      form.start_time &&
      form.end_time &&
      form.end_time <= form.start_time
    ) {
      setError(
        "End time must be after start time."
      );
      return;
    }

    /* Validate capacity */

    let capacity: number | null = null;

    if (form.capacity.trim()) {
      const parsed = Number(
        form.capacity
      );

      if (
        !Number.isInteger(parsed) ||
        parsed < 1
      ) {
        setError(
          "Capacity must be a positive whole number."
        );
        return;
      }

      capacity = parsed;
    }

    /* Validate registration deadline */

    let registrationDeadline:
      | string
      | null = null;

    if (form.registration_deadline) {
      const deadlineDate = new Date(
        form.registration_deadline
      );

      if (
        Number.isNaN(
          deadlineDate.getTime()
        )
      ) {
        setError(
          "Please enter a valid registration deadline."
        );
        return;
      }

      if (
        form.registration_open &&
        deadlineDate.getTime() <= Date.now()
      ) {
        setError(
          "Registration deadline must be in the future when opening registration."
        );
        return;
      }

      registrationDeadline =
        deadlineDate.toISOString();
    }

    setSaving(true);

    try {
      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          null,

        event_date:
          form.event_date,

        start_time:
          form.start_time || null,

        end_time:
          form.end_time || null,

        venue:
          form.venue.trim() ||
          null,

        image_url:
          form.image_url.trim() ||
          null,

        registration_link:
          form.registration_link.trim() ||
          null,

        status:
          form.status || "Upcoming",

        capacity,

        is_published:
          form.is_published,

        registration_open:
          form.registration_open,

        registration_deadline:
          registrationDeadline,
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
          .insert({
            ...payload,

            /*
             * New events always start with
             * zero registered participants.
             */
            participants_count: 0,
          });

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
        getErrorMessage(err) ||
          "Unable to save event."
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
        getErrorMessage(err) ||
          "Unable to delete event."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  const togglePublish = async (
    event: EventItem
  ) => {
    clearMessages();

    setPublishingId(event.id);

    try {
      const newStatus =
        event.is_published !== true;

      const {
        error: updateError,
      } = await supabase
        .from("events")
        .update({
          is_published:
            newStatus,
        })
        .eq(
          "id",
          event.id
        );

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
        getErrorMessage(err) ||
          "Unable to change publish status."
      );
    } finally {
      setPublishingId(null);
    }
  };

  /* =======================================================
     OPEN / CLOSE REGISTRATION
  ======================================================= */

  const toggleRegistration = async (
    event: EventItem
  ) => {
    clearMessages();

    setRegistrationId(event.id);

    try {
      const currentlyOpen =
        isRegistrationOpen(event);

      /*
       * CLOSE
       */
      if (currentlyOpen) {
        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update({
            registration_open:
              false,
          })
          .eq(
            "id",
            event.id
          );

        if (updateError) {
          throw updateError;
        }

        setEvents((current) =>
          current.map((item) =>
            item.id === event.id
              ? {
                  ...item,
                  registration_open:
                    false,
                }
              : item
          )
        );

        setSuccess(
          "Event registration closed manually."
        );
      }

      /*
       * OPEN / REOPEN
       */
      else {
        const deadlinePassed =
          event.registration_deadline &&
          new Date(
            event.registration_deadline
          ).getTime() <= Date.now();

        /*
         * If the old deadline has expired,
         * remove it during manual reopening.
         *
         * This allows the admin to reopen the
         * registration without an old expired
         * deadline immediately closing it again.
         */
        const newDeadline =
          deadlinePassed
            ? null
            : event.registration_deadline;

        const {
          error: updateError,
        } = await supabase
          .from("events")
          .update({
            registration_open:
              true,

            registration_deadline:
              newDeadline,
          })
          .eq(
            "id",
            event.id
          );

        if (updateError) {
          throw updateError;
        }

        setEvents((current) =>
          current.map((item) =>
            item.id === event.id
              ? {
                  ...item,

                  registration_open:
                    true,

                  registration_deadline:
                    newDeadline,
                }
              : item
          )
        );

        setSuccess(
          deadlinePassed
            ? "Registration reopened manually without the old deadline."
            : "Event registration opened successfully."
        );
      }
    } catch (err) {
      console.error(
        "Registration toggle error:",
        err
      );

      setError(
        getErrorMessage(err) ||
          "Unable to change registration status."
      );
    } finally {
      setRegistrationId(null);
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
        event.is_published === true
    ).length;

  const draftCount =
    events.filter(
      (event) =>
        event.is_published !== true
    ).length;

  /* =======================================================
     FILTER EVENTS
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
            filter ===
              "Published" &&
            event.is_published !== true
          ) {
            return false;
          }

          if (
            filter === "Draft" &&
            event.is_published === true
          ) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          const searchableText = [
            event.title,
            event.description,
            event.status,
            event.event_type,
            event.venue,
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
     DEADLINE FORMAT
  ======================================================= */

  const formatDeadline = (
    value: string | null
  ) => {
    if (!value) {
      return "No deadline";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Invalid deadline";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
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
                  Create, manage, publish and control NSS event registration.
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
              onClick={
                openCreateForm
              }
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
            EVENTS SECTION
        ================================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          {/* SECTION HEADER */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Event Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Manage upcoming and past NSS events.
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
              ).map((item) => {

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
              })}

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
                  : filter === "Published"
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
                (event) => {

                  const registrationOpen =
                    isRegistrationOpen(
                      event
                    );

                  const registeredCount =
                    event.participants_count ||
                    0;

                  return (
                    <article
                      key={event.id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >

                      <div className="flex flex-col gap-5">

                        {/* =================================================
                           MAIN EVENT ROW
                        ================================================= */}

                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start">

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

                              {event.is_published === true ? (
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

                              {event.event_type && (
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0F2B7B]">
                                  {event.event_type}
                                </span>
                              )}

                            </div>

                            {event.description && (
                              <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                                {
                                  event.description
                                }
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                              {/* DATE */}

                              <span className="inline-flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-[#0F2B7B]" />

                                {formatDate(
                                  event.event_date
                                )}
                              </span>

                              {/* TIME */}

                              {(event.start_time ||
                                event.event_time) && (
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />

                                  {formatTime(
                                    event.start_time ||
                                      event.event_time
                                  )}

                                  {event.end_time &&
                                    ` - ${formatTime(
                                      event.end_time
                                    )}`}
                                </span>
                              )}

                              {/* VENUE */}

                              {(event.venue ||
                                event.location) && (
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />

                                  {event.venue ||
                                    event.location}
                                </span>
                              )}

                              {/* REGISTERED */}

                              <span className="inline-flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />

                                {registeredCount}

                                {event.capacity
                                  ? ` / ${event.capacity}`
                                  : ""}

                                registered
                              </span>

                            </div>

                          </div>

                          {/* =================================================
                             ACTION BUTTONS
                          ================================================= */}

                          <div className="w-full shrink-0 xl:w-[340px]">

                            <div className="grid grid-cols-2 gap-2">

                              {/* PUBLISH */}

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
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  event.is_published ===
                                  true
                                    ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                              >
                                {publishingId ===
                                event.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : event.is_published ===
                                  true ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}

                                <span className="hidden sm:inline">
                                  {event.is_published ===
                                  true
                                    ? "Unpublish"
                                    : "Publish"}
                                </span>

                                <span className="sm:hidden">
                                  {event.is_published ===
                                  true
                                    ? "Unpublish"
                                    : "Publish"}
                                </span>
                              </button>

                              {/* REGISTRATIONS - NEW */}

                              <Link
                                href={`/admin/events/${event.id}/registrations`}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0F2B7B]/20 bg-[#0F2B7B] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#143a96]"
                              >
                                <Users className="h-4 w-4" />

                                <span>
                                  Registrations
                                </span>

                                <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
                                  {registeredCount}
                                </span>
                              </Link>

                              {/* OPEN / CLOSE */}

                              <button
                                type="button"
                                onClick={() =>
                                  toggleRegistration(
                                    event
                                  )
                                }
                                disabled={
                                  registrationId ===
                                  event.id
                                }
                                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  registrationOpen
                                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                    : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                              >
                                {registrationId ===
                                event.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : registrationOpen ? (
                                  <Lock className="h-4 w-4" />
                                ) : (
                                  <Unlock className="h-4 w-4" />
                                )}

                                {registrationOpen
                                  ? "Close Registration"
                                  : "Open Registration"}
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    event
                                  )
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-slate-50"
                              >
                                <Edit3 className="h-4 w-4" />

                                Edit
                              </button>

                              {/* DELETE */}

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
                                className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId ===
                                event.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}

                                Delete Event
                              </button>

                            </div>

                          </div>

                        </div>

                        {/* =================================================
                           REGISTRATION STATUS CARD
                        ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            {/* STATUS */}

                            <div className="flex items-center gap-3">

                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  registrationOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {registrationOpen ? (
                                  <Unlock className="h-5 w-5" />
                                ) : (
                                  <Lock className="h-5 w-5" />
                                )}
                              </div>

                              <div>

                                <p className="text-sm font-bold text-gray-800">
                                  Registration{" "}
                                  {registrationOpen
                                    ? "Open"
                                    : "Closed"}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {event.registration_deadline
                                    ? `Deadline: ${formatDeadline(
                                        event.registration_deadline
                                      )}`
                                    : "No registration deadline set"}
                                </p>

                              </div>

                            </div>

                            {/* REGISTERED INFO */}

                            <div className="flex items-center justify-between gap-4 sm:justify-end">

                              <div className="text-sm text-gray-500">

                                <span className="font-bold text-gray-800">
                                  {
                                    registeredCount
                                  }
                                </span>

                                {" "}registered

                                {event.capacity && (
                                  <>
                                    {" "}of{" "}

                                    <span className="font-bold text-gray-800">
                                      {
                                        event.capacity
                                      }
                                    </span>
                                  </>
                                )}

                              </div>

                              {/* QUICK REGISTRATIONS LINK */}

                              <Link
                                href={`/admin/events/${event.id}/registrations`}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2B7B] transition hover:bg-blue-50"
                              >
                                <Users className="h-4 w-4" />

                                View List
                              </Link>

                            </div>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                }
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
                    Event Title{" "}
                    <span className="text-red-500">
                      *
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
                        event.target.value
                      )
                    }
                    placeholder="Example: NSS Orientation Programme"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    required
                  />

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
                        event.target.value
                      )
                    }
                    rows={5}
                    placeholder="Describe the event..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* DATE / TIMES */}

                <div className="grid gap-5 sm:grid-cols-3">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Event Date{" "}
                      <span className="text-red-500">
                        *
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
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                      required
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={
                        form.start_time
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "start_time",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={
                        form.end_time
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "end_time",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* VENUE */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Venue
                  </label>

                  <input
                    type="text"
                    value={
                      form.venue
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "venue",
                        event.target.value
                      )
                    }
                    placeholder="Example: ADC Auditorium"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="Upcoming">
                      Upcoming
                    </option>

                    <option value="Ongoing">
                      Ongoing
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                {/* CAPACITY */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Registration Capacity
                  </label>

                  <div className="relative">

                    <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="number"
                      min="1"
                      value={
                        form.capacity
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "capacity",
                          event.target.value
                        )
                      }
                      placeholder="Leave empty for unlimited"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty if there is no participant limit.
                  </p>

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
                        event.target.value
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
                    External Registration Link
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
                          event.target.value
                        )
                      }
                      placeholder="Optional external registration link"
                      className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Your internal NSS registration page will still use the event ID. This field is only for an optional external registration URL.
                  </p>

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
                          event.target.checked
                        )
                      }
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0F2B7B] focus:ring-[#0F2B7B]"
                    />

                    <div>

                      <p className="font-bold text-gray-800">
                        Publish this event
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        Published events can appear on the public website and Upcoming Events section.
                      </p>

                    </div>

                  </label>

                </div>

                {/* =================================================
                    REGISTRATION CONTROL
                ================================================= */}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0F2B7B] shadow-sm">
                      <Users className="h-5 w-5" />
                    </div>

                    <div>

                      <h3 className="font-bold text-gray-800">
                        Event Registration
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-gray-600">
                        Control whether volunteers can register for this event.
                      </p>

                    </div>

                  </div>

                  {/* OPEN REGISTRATION */}

                  <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-xl border border-white bg-white p-4">

                    <input
                      type="checkbox"
                      checked={
                        form.registration_open
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "registration_open",
                          event.target.checked
                        )
                      }
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-[#0F2B7B] focus:ring-[#0F2B7B]"
                    />

                    <div>

                      <p className="font-bold text-gray-800">
                        Open registration
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-500">
                        Volunteers can register while registration is open and before the deadline.
                      </p>

                    </div>

                  </label>

                  {/* DEADLINE */}

                  <div className="mt-4">

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Registration Deadline
                    </label>

                    <input
                      type="datetime-local"
                      value={
                        form.registration_deadline
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "registration_deadline",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      When this deadline passes, registration is automatically treated as closed. An admin can manually reopen registration.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

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