"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  Search,
  QrCode,
  Eye,
  Lock,
  Unlock,
  Pencil,
  Trash2,
  Download,
  X,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

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
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface EventForm {
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
}

export default function AdminAttendancePage() {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<AttendanceEvent | null>(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [copied, setCopied] = useState(false);

  const qrCanvasRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    venue: "",
  });

  // =========================================================
  // ATTENDANCE URL
  // =========================================================

  const getAttendanceUrl = (qrToken: string) => {
    if (typeof window === "undefined") {
      return `/attendance/${qrToken}`;
    }

    return `${window.location.origin}/attendance/${qrToken}`;
  };

  // =========================================================
  // LOAD EVENTS
  // =========================================================

  const loadEvents = async (refresh = false) => {
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
          status,
          created_by,
          created_at,
          updated_at
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

      setEvents((data || []) as unknown as AttendanceEvent[]);
    } catch (err) {
      console.error(
        "Attendance events loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance events."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // =========================================================
  // CREATE EVENT
  // =========================================================

  const createEvent = async () => {
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Event name is required.");
      return;
    }

    if (!form.event_date) {
      setError("Event date is required.");
      return;
    }

    if (
      form.start_time &&
      form.end_time &&
      form.end_time < form.start_time
    ) {
      setError("End time cannot be before start time.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "You must be logged in to create an attendance event."
        );
      }

      const {
        data: createdEvent,
        error: insertError,
      } = await supabase
        .from("attendance_events")
        .insert({
          title: form.title.trim(),
          description:
            form.description.trim() || null,
          event_date: form.event_date,
          start_time:
            form.start_time || null,
          end_time:
            form.end_time || null,
          venue:
            form.venue.trim() || null,
          status: "open",
          created_by: user.id,
        })
        .select(`
          id,
          title,
          description,
          event_date,
          start_time,
          end_time,
          venue,
          qr_token,
          status,
          created_by,
          created_at,
          updated_at
        `)
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        "Attendance event created successfully."
      );

      setForm({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        venue: "",
      });

      setShowCreate(false);

      // FIX:
      // createdEvent can be typed by Supabase as a generic Event.
      // We first check that it exists, then safely treat the selected
      // row as our AttendanceEvent shape.
      if (createdEvent) {
        const attendanceEvent =
          createdEvent as unknown as AttendanceEvent;

        setSelectedEvent(attendanceEvent);
        setShowQR(true);
      }

      await loadEvents(true);
    } catch (err) {
      console.error(
        "Attendance event creation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create attendance event."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT EVENT
  // =========================================================

  const startEditEvent = (
    event: AttendanceEvent
  ) => {
    setError("");
    setSuccess("");

    setForm({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      start_time: event.start_time
        ? event.start_time.slice(0, 5)
        : "",
      end_time: event.end_time
        ? event.end_time.slice(0, 5)
        : "",
      venue: event.venue || "",
    });

    setSelectedEvent(event);
    setShowCreate(true);
  };

  const updateEvent = async () => {
    if (!selectedEvent) return;

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Event name is required.");
      return;
    }

    if (!form.event_date) {
      setError("Event date is required.");
      return;
    }

    if (
      form.start_time &&
      form.end_time &&
      form.end_time < form.start_time
    ) {
      setError("End time cannot be before start time.");
      return;
    }

    setSaving(true);

    try {
      const {
        error: updateError,
      } = await supabase
        .from("attendance_events")
        .update({
          title: form.title.trim(),
          description:
            form.description.trim() || null,
          event_date: form.event_date,
          start_time:
            form.start_time || null,
          end_time:
            form.end_time || null,
          venue:
            form.venue.trim() || null,
        })
        .eq("id", selectedEvent.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "Attendance event updated successfully."
      );

      setShowCreate(false);
      setSelectedEvent(null);

      setForm({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        venue: "",
      });

      await loadEvents(true);
    } catch (err) {
      console.error(
        "Attendance event update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update attendance event."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CLOSE / REOPEN
  // =========================================================

  const toggleEventStatus = async (
    event: AttendanceEvent
  ) => {
    setError("");
    setSuccess("");

    const newStatus =
      event.status === "open"
        ? "closed"
        : "open";

    try {
      const {
        error: updateError,
      } = await supabase
        .from("attendance_events")
        .update({
          status: newStatus,
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
                status: newStatus,
              }
            : item
        )
      );

      if (
        selectedEvent &&
        selectedEvent.id === event.id
      ) {
        setSelectedEvent({
          ...selectedEvent,
          status: newStatus,
        });
      }

      setSuccess(
        newStatus === "closed"
          ? "Attendance has been closed."
          : "Attendance has been reopened."
      );
    } catch (err) {
      console.error(
        "Attendance status update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update attendance status."
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteEvent = async (
    event: AttendanceEvent
  ) => {
    const confirmed = window.confirm(
      `Delete "${event.title}" and all attendance records for this event?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("attendance_events")
        .delete()
        .eq("id", event.id);

      if (deleteError) {
        throw deleteError;
      }

      setEvents((current) =>
        current.filter(
          (item) => item.id !== event.id
        )
      );

      if (
        selectedEvent &&
        selectedEvent.id === event.id
      ) {
        setSelectedEvent(null);
        setShowQR(false);
      }

      setSuccess(
        "Attendance event deleted successfully."
      );
    } catch (err) {
      console.error(
        "Attendance event delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete attendance event."
      );
    }
  };

  // =========================================================
  // SHOW QR
  // =========================================================

  const openQR = (
    event: AttendanceEvent
  ) => {
    setError("");
    setSuccess("");
    setCopied(false);

    setSelectedEvent(event);
    setShowQR(true);
  };

  // =========================================================
  // COPY ATTENDANCE LINK
  // =========================================================

  const copyAttendanceLink = async () => {
    if (!selectedEvent) return;

    const url = getAttendanceUrl(
      selectedEvent.qr_token
    );

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      setSuccess(
        "Attendance link copied to clipboard."
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(
        "Copy attendance URL error:",
        err
      );

      setError(
        "Unable to copy the attendance link."
      );
    }
  };

  // =========================================================
  // DOWNLOAD QR + EVENT DETAILS
  // =========================================================

  const downloadQRCode = () => {
    if (!selectedEvent) return;

    const canvas =
      qrCanvasRef.current?.querySelector(
        "canvas"
      );

    if (!canvas) {
      setError(
        "QR code is not ready yet. Please try again."
      );
      return;
    }

    const qrSize = 700;

    const outputCanvas =
      document.createElement("canvas");

    outputCanvas.width = 1200;
    outputCanvas.height = 1450;

    const ctx =
      outputCanvas.getContext("2d");

    if (!ctx) {
      setError(
        "Unable to create QR download."
      );
      return;
    }

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );

    // Header
    ctx.fillStyle = "#0F2B7B";
    ctx.fillRect(
      0,
      0,
      outputCanvas.width,
      180
    );

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";

    ctx.font =
      "bold 46px Arial";

    ctx.fillText(
      "NSS ATTENDANCE",
      outputCanvas.width / 2,
      75
    );

    ctx.font =
      "bold 30px Arial";

    ctx.fillText(
      "Scan QR Code to Mark Attendance",
      outputCanvas.width / 2,
      130
    );

    // Event title
    ctx.fillStyle = "#111827";

    ctx.font =
      "bold 42px Arial";

    const title =
      selectedEvent.title;

    ctx.fillText(
      title.length > 40
        ? `${title.substring(0, 40)}...`
        : title,
      outputCanvas.width / 2,
      250
    );

    // QR
    const qrX =
      (outputCanvas.width - qrSize) / 2;

    const qrY = 300;

    ctx.drawImage(
      canvas,
      qrX,
      qrY,
      qrSize,
      qrSize
    );

    // Event details
    ctx.textAlign = "left";

    ctx.fillStyle = "#374151";

    ctx.font =
      "bold 28px Arial";

    let y = 1080;

    ctx.fillText(
      `Date: ${formatDate(
        selectedEvent.event_date
      )}`,
      120,
      y
    );

    y += 55;

    if (
      selectedEvent.start_time
    ) {
      const time =
        selectedEvent.start_time.slice(
          0,
          5
        ) +
        (selectedEvent.end_time
          ? ` - ${selectedEvent.end_time.slice(
              0,
              5
            )}`
          : "");

      ctx.fillText(
        `Time: ${time}`,
        120,
        y
      );

      y += 55;
    }

    if (selectedEvent.venue) {
      ctx.fillText(
        `Venue: ${selectedEvent.venue}`,
        120,
        y
      );

      y += 55;
    }

    ctx.fillStyle = "#0F2B7B";

    ctx.font =
      "bold 25px Arial";

    ctx.fillText(
      "Scan the QR code with your phone to mark attendance.",
      120,
      1340
    );

    // Download
    const link =
      document.createElement("a");

    const safeName =
      selectedEvent.title
        .replace(
          /[^a-z0-9]+/gi,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .toLowerCase() ||
      "attendance";

    link.download =
      `${safeName}-attendance-qr.png`;

    link.href =
      outputCanvas.toDataURL(
        "image/png"
      );

    link.click();

    setSuccess(
      "QR code with event details downloaded."
    );
  };

  // =========================================================
  // OPEN ATTENDANCE PAGE
  // =========================================================

  const openAttendancePageForEvent = (
    event: AttendanceEvent
  ) => {
    const url = getAttendanceUrl(
      event.qr_token
    );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openAttendancePage = () => {
    if (!selectedEvent) return;

    openAttendancePageForEvent(
      selectedEvent
    );
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredEvents = events.filter(
    (event) => {
      const text = search
        .trim()
        .toLowerCase();

      if (!text) return true;

      return [
        event.title,
        event.description,
        event.venue,
        event.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text);
    }
  );

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (
    value: string
  ) => {
    if (!value) return "—";

    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // TIME
  // =========================================================

  const formatTime = (
    start: string | null,
    end: string | null
  ) => {
    if (!start) return "";

    const startText =
      start.slice(0, 5);

    if (!end) {
      return startText;
    }

    return `${startText} - ${end.slice(
      0,
      5
    )}`;
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <CalendarCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#0F2B7B]">
                Attendance
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create events, generate QR attendance and manage volunteer attendance.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                loadEvents(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
              onClick={() => {
                setError("");
                setSuccess("");
                setSelectedEvent(null);

                setForm({
                  title: "",
                  description: "",
                  event_date: "",
                  start_time: "",
                  end_time: "",
                  venue: "",
                });

                setShowCreate(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#143a96]"
            >
              <Plus className="h-5 w-5" />

              Create Attendance
            </button>

          </div>
        </div>

        {/* MESSAGES */}

        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

          <div className="relative max-w-xl">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search attendance events..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </section>

        {/* EVENTS */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-xl font-bold text-[#0F2B7B]">
              Attendance Events
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage attendance forms created for NSS events.
            </p>

          </div>

          {loading ? (
            <div className="p-14 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading attendance events...
              </p>

            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-14 text-center">

              <CalendarCheck className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 text-lg font-bold text-gray-800">
                No attendance events
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first attendance event to generate a QR code.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {filteredEvents.map(
                (event) => (
                  <div
                    key={event.id}
                    className="p-5 transition hover:bg-slate-50 sm:p-6"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                      {/* EVENT INFO */}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-lg font-bold text-gray-900">
                            {event.title}
                          </h3>

                          {event.status ===
                          "open" ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              OPEN
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              CLOSED
                            </span>
                          )}

                        </div>

                        {event.description && (
                          <p className="mt-2 max-w-3xl text-sm text-gray-500">
                            {event.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                          <span>
                            📅{" "}
                            {formatDate(
                              event.event_date
                            )}
                          </span>

                          {event.start_time && (
                            <span>
                              🕐{" "}
                              {formatTime(
                                event.start_time,
                                event.end_time
                              )}
                            </span>
                          )}

                          {event.venue && (
                            <span>
                              📍{" "}
                              {event.venue}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        {/* QR */}

                        <button
                          type="button"
                          onClick={() =>
                            openQR(event)
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-[#0F2B7B] hover:bg-blue-100"
                        >
                          <QrCode className="h-4 w-4" />

                          Show QR
                        </button>

                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() =>
                            openAttendancePageForEvent(
                              event
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />

                          Open
                        </button>

                        {/* CLOSE / REOPEN */}

                        <button
                          type="button"
                          onClick={() =>
                            toggleEventStatus(
                              event
                            )
                          }
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
                            event.status ===
                            "open"
                              ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {event.status ===
                          "open" ? (
                            <>
                              <Lock className="h-4 w-4" />

                              Close
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4" />

                              Reopen
                            </>
                          )}
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() =>
                            startEditEvent(
                              event
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />

                          Edit
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            deleteEvent(
                              event
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />

                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* CREATE / EDIT MODAL */}

        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#0F2B7B]">
                    {selectedEvent
                      ? "Edit Attendance Event"
                      : "Create Attendance Event"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedEvent
                      ? "Update the attendance event details."
                      : "Create an event and generate a unique QR attendance form."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!saving) {
                      setShowCreate(false);
                      setSelectedEvent(null);
                    }
                  }}
                  className="rounded-xl p-2 text-gray-500 hover:bg-slate-100"
                >
                  <X className="h-6 w-6" />
                </button>

              </div>

              <div className="space-y-5 p-6">

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Name *
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title:
                          e.target.value,
                      })
                    }
                    placeholder="Example: NSS Community Service Programme"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="Describe the event..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DATE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Event Date *
                  </label>

                  <input
                    type="date"
                    value={
                      form.event_date
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_date:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* TIME */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={
                        form.start_time
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          start_time:
                            e.target.value,
                        })
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
                      onChange={(e) =>
                        setForm({
                          ...form,
                          end_time:
                            e.target.value,
                        })
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
                    onChange={(e) =>
                      setForm({
                        ...form,
                        venue:
                          e.target.value,
                      })
                    }
                    placeholder="Example: College Auditorium"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => {
                      if (!saving) {
                        setShowCreate(false);
                        setSelectedEvent(null);
                      }
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      selectedEvent
                        ? updateEvent
                        : createEvent
                    }
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 text-sm font-bold text-white hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    )}

                    {saving
                      ? "Saving..."
                      : selectedEvent
                      ? "Save Changes"
                      : "Create Attendance"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* QR MODAL */}

        {showQR &&
          selectedEvent && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">

              <div className="my-6 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* QR HEADER */}

                <div className="flex items-center justify-between bg-[#0F2B7B] px-6 py-5 text-white">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <QrCode className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">
                        Attendance QR Code
                      </h2>

                      <p className="text-sm text-blue-100">
                        Scan this QR code to open attendance
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowQR(false)
                    }
                    className="rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>

                </div>

                {/* QR BODY */}

                <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">

                  {/* QR */}

                  <div className="flex flex-col items-center justify-center">

                    <div
                      ref={qrCanvasRef}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg"
                    >

                      <QRCodeCanvas
                        value={getAttendanceUrl(
                          selectedEvent.qr_token
                        )}
                        size={300}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin
                      />

                    </div>

                    <div className="mt-5 text-center">

                      <p className="text-sm font-bold text-gray-700">
                        Scan with a phone camera
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        The QR opens the volunteer attendance page.
                      </p>

                    </div>

                  </div>

                  {/* EVENT DETAILS */}

                  <div className="flex flex-col">

                    <div className="rounded-2xl bg-slate-50 p-5">

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                            Event
                          </p>

                          <h3 className="mt-1 text-xl font-bold text-[#0F2B7B]">
                            {selectedEvent.title}
                          </h3>
                        </div>

                        {selectedEvent.status ===
                        "open" ? (
                          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            OPEN
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            CLOSED
                          </span>
                        )}

                      </div>

                      {selectedEvent.description && (
                        <p className="mt-4 text-sm leading-6 text-gray-600">
                          {
                            selectedEvent.description
                          }
                        </p>
                      )}

                      <div className="mt-5 space-y-3">

                        <div className="flex gap-3">
                          <span className="text-lg">
                            📅
                          </span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                              Date
                            </p>

                            <p className="text-sm font-semibold text-gray-800">
                              {formatDate(
                                selectedEvent.event_date
                              )}
                            </p>
                          </div>
                        </div>

                        {selectedEvent.start_time && (
                          <div className="flex gap-3">
                            <span className="text-lg">
                              🕐
                            </span>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                Time
                              </p>

                              <p className="text-sm font-semibold text-gray-800">
                                {formatTime(
                                  selectedEvent.start_time,
                                  selectedEvent.end_time
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        {selectedEvent.venue && (
                          <div className="flex gap-3">
                            <span className="text-lg">
                              📍
                            </span>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                Venue
                              </p>

                              <p className="text-sm font-semibold text-gray-800">
                                {
                                  selectedEvent.venue
                                }
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>

                    {/* LINK */}

                    <div className="mt-4">

                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">
                        Attendance Link
                      </label>

                      <div className="flex gap-2">

                        <input
                          type="text"
                          readOnly
                          value={getAttendanceUrl(
                            selectedEvent.qr_token
                          )}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-gray-600 outline-none"
                        />

                        <button
                          type="button"
                          onClick={
                            copyAttendanceLink
                          }
                          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-100 px-4 text-gray-700 hover:bg-slate-200"
                          title="Copy attendance link"
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-auto grid gap-3 pt-5 sm:grid-cols-2">

                      <button
                        type="button"
                        onClick={
                          downloadQRCode
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-bold text-white shadow-sm hover:bg-[#143a96]"
                      >
                        <Download className="h-5 w-5" />

                        Download QR
                      </button>

                      {/* FIX:
                          Do NOT use `event` here.
                          This modal is outside filteredEvents.map().
                          Use the already selected event.
                      */}

                      <button
  type="button"
  onClick={openAttendancePage}
  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-gray-700 hover:bg-slate-50"
>
  <Eye className="h-5 w-5" />
  Open Attendance
</button>

                    </div>

                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
                      <strong>How it works:</strong>{" "}
                      Share or display this QR code at the event. Volunteers scan it, open the attendance page, verify their account and submit attendance.
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

      </div>
    </AdminDashboardLayout>
  );
}