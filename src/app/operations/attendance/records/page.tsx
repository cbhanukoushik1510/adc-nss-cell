"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  QrCode,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  location: string | null;
  status: string | null;
  capacity: number | null;
  participants_count: number | null;
  attendance_token: string | null;
  event_time: string | null;
  event_type: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
};

type AttendanceItem = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  source: string;
  scanned_at: string | null;
  marked_at: string | null;
  marked_by: string | null;
};

type VolunteerItem = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  course: string | null;
  year: string;
  nss_unit: string | null;
  volunteer_id: string | null;
};

type EventStats = {
  event: EventItem;
  total: number;
  present: number;
  absent: number;
  pending: number;
  percentage: number;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string | null): string {
  if (!value) return "";

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isPresent(status: string | null): boolean {
  const value = (status || "").toLowerCase();

  return (
    value === "present" ||
    value === "attended" ||
    value === "approved"
  );
}

function isAbsent(status: string | null): boolean {
  return (status || "").toLowerCase() === "absent";
}

function getStatus(event: EventItem): string {
  if (event.status) {
    return event.status;
  }

  return event.is_published ? "Published" : "Draft";
}

/* =========================================================
   PAGE
========================================================= */

export default function AttendancePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [selectedEvent, setSelectedEvent] =
    useState<EventStats | null>(null);

  const [showQR, setShowQR] = useState<EventItem | null>(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);

      /*
       * EVENTS
       *
       * Using select("*") deliberately.
       * This prevents this page from breaking if additional
       * event columns exist in your database.
       */

      const eventsResponse = await supabase
        .from("events")
        .select("*")
        .order("event_date", {
          ascending: false,
        });

      if (eventsResponse.error) {
        console.error(
          "Attendance events error:",
          eventsResponse.error
        );

        throw new Error(
          eventsResponse.error.message ||
            "Unable to load events."
        );
      }

      /*
       * ATTENDANCE
       */

      const attendanceResponse = await supabase
        .from("attendance")
        .select("*");

      if (attendanceResponse.error) {
        console.error(
          "Attendance records error:",
          attendanceResponse.error
        );

        throw new Error(
          attendanceResponse.error.message ||
            "Unable to load attendance."
        );
      }

      /*
       * VOLUNTEERS
       */

      const volunteersResponse = await supabase
        .from("volunteers")
        .select(`
          id,
          full_name,
          roll_number,
          department,
          course,
          year,
          nss_unit,
          volunteer_id
        `);

      if (volunteersResponse.error) {
        console.error(
          "Volunteers error:",
          volunteersResponse.error
        );

        throw new Error(
          volunteersResponse.error.message ||
            "Unable to load volunteers."
        );
      }

      setEvents(
        (eventsResponse.data || []) as EventItem[]
      );

      setAttendance(
        (attendanceResponse.data || []) as AttendanceItem[]
      );

      setVolunteers(
        (volunteersResponse.data || []) as VolunteerItem[]
      );
    } catch (error) {
      console.error("Operations attendance error:", error);

      /*
       * Do not crash the entire page.
       */

      setEvents([]);
      setAttendance([]);
      setVolunteers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     EVENT-WISE STATS
  ======================================================= */

  const eventStats = useMemo<EventStats[]>(() => {
    return events.map((event) => {
      const records = attendance.filter(
        (record) => record.event_id === event.id
      );

      const present = records.filter((record) =>
        isPresent(record.status)
      ).length;

      const absent = records.filter((record) =>
        isAbsent(record.status)
      ).length;

      /*
       * participants_count comes from your events table.
       *
       * If it is unavailable, attendance record count is used.
       */

      const total =
        typeof event.participants_count === "number"
          ? event.participants_count
          : records.length;

      const pending = Math.max(
        total - present - absent,
        0
      );

      const percentage =
        total > 0
          ? Math.round((present / total) * 100)
          : 0;

      return {
        event,
        total,
        present,
        absent,
        pending,
        percentage,
      };
    });
  }, [events, attendance]);

  /* =======================================================
     FILTERED EVENTS
  ======================================================= */

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return eventStats.filter((item) => {
      const event = item.event;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        (event.venue || "")
          .toLowerCase()
          .includes(query) ||
        (event.location || "")
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "published") {
        return (
          event.is_published === true ||
          getStatus(event).toLowerCase() ===
            "published"
        );
      }

      if (filter === "upcoming") {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const eventDate = new Date(
          `${event.event_date}T00:00:00`
        );

        return eventDate >= today;
      }

      if (filter === "completed") {
        const status = getStatus(event).toLowerCase();

        return (
          status === "completed" ||
          status === "closed"
        );
      }

      return true;
    });
  }, [eventStats, search, filter]);

  /* =======================================================
     DASHBOARD STATS
  ======================================================= */

  const dashboardStats = useMemo(() => {
    const totalEvents = events.length;

    const participants = eventStats.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const present = eventStats.reduce(
      (sum, item) => sum + item.present,
      0
    );

    const absent = eventStats.reduce(
      (sum, item) => sum + item.absent,
      0
    );

    const percentage =
      participants > 0
        ? Math.round(
            (present / participants) * 100
          )
        : 0;

    return {
      totalEvents,
      participants,
      present,
      absent,
      percentage,
    };
  }, [events.length, eventStats]);

  /* =======================================================
     EVENT VOLUNTEERS
  ======================================================= */

  const getEventVolunteers = (
    eventId: string
  ) => {
    return attendance
      .filter(
        (record) => record.event_id === eventId
      )
      .map((record) => {
        const volunteer = volunteers.find(
          (item) => item.id === record.volunteer_id
        );

        return {
          attendance: record,
          volunteer,
        };
      })
      .filter((item) => item.volunteer);
  };

  /* =======================================================
     DOWNLOAD CSV
  ======================================================= */

  const downloadAttendance = (
    event: EventItem
  ) => {
    const rows = getEventVolunteers(event.id);

    const headers = [
      "S.No",
      "Volunteer ID",
      "Name",
      "Roll Number",
      "Department",
      "Course",
      "Year",
      "NSS Unit",
      "Status",
      "Source",
      "Marked At",
    ];

    const csvRows = rows.map(
      (item, index) => {
        const volunteer = item.volunteer!;
        const record = item.attendance;

        return [
          index + 1,
          volunteer.volunteer_id || "",
          volunteer.full_name || "",
          volunteer.roll_number || "",
          volunteer.department || "",
          volunteer.course || "",
          volunteer.year || "",
          volunteer.nss_unit || "",
          record.status || "",
          record.source || "",
          record.marked_at
            ? new Date(
                record.marked_at
              ).toLocaleString("en-IN")
            : "",
        ];
      }
    );

    const csv = [
      headers,
      ...csvRows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(
              value ?? ""
            );

            return `"${text.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${event.title
        .replace(
          /[^a-z0-9]/gi,
          "-"
        )
        .toLowerCase()}-attendance.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="text-sm text-gray-500">
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-500">
            Operations Team
          </p>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor event-wise NSS attendance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
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

      {/* STATS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Events"
          value={
            dashboardStats.totalEvents
          }
          icon={
            <CalendarDays size={20} />
          }
        />

        <StatCard
          title="Participants"
          value={
            dashboardStats.participants
          }
          icon={<Users size={20} />}
        />

        <StatCard
          title="Present"
          value={
            dashboardStats.present
          }
          icon={
            <CheckCircle2 size={20} />
          }
        />

        <StatCard
          title="Attendance Rate"
          value={`${dashboardStats.percentage}%`}
          icon={<Clock3 size={20} />}
        />
      </div>

      {/* FILTER BAR */}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search events, venue or location..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400"
          >
            <option value="all">
              All Events
            </option>

            <option value="published">
              Published
            </option>

            <option value="upcoming">
              Upcoming
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* EVENTS */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

        <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Event-wise Attendance
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              View attendance records for each event.
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {filteredEvents.length} event
            {filteredEvents.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="px-6 py-16 text-center">

            <CalendarDays
              size={42}
              className="mx-auto mb-3 text-gray-300"
            />

            <h3 className="font-semibold text-gray-800">
              No events found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Events created in the system will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">

            {filteredEvents.map(
              (item) => {
                const event =
                  item.event;

                return (
                  <div
                    key={event.id}
                    className="p-5 transition hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

                      {/* EVENT INFO */}

                      <div className="min-w-0 flex-1">

                        <div className="mb-2 flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-gray-900">
                            {event.title}
                          </h3>

                          <StatusBadge
                            status={getStatus(
                              event
                            )}
                          />
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">

                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              event.event_date
                            )}
                          </span>

                          {(event.start_time ||
                            event.event_time) && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3
                                size={14}
                              />

                              {formatTime(
                                event.start_time ||
                                  event.event_time
                              )}

                              {event.end_time
                                ? ` - ${formatTime(
                                    event.end_time
                                  )}`
                                : ""}
                            </span>
                          )}

                          {(event.venue ||
                            event.location) && (
                            <span>
                              📍{" "}
                              {event.venue ||
                                event.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* COUNTS */}

                      <div className="grid grid-cols-3 gap-2 xl:w-[320px]">

                        <MiniStat
                          label="Present"
                          value={
                            item.present
                          }
                        />

                        <MiniStat
                          label="Absent"
                          value={
                            item.absent
                          }
                        />

                        <MiniStat
                          label="Total"
                          value={
                            item.total
                          }
                        />
                      </div>

                      {/* PROGRESS */}

                      <div className="xl:w-[180px]">

                        <div className="mb-1.5 flex items-center justify-between">

                          <span className="text-xs text-gray-500">
                            Attendance
                          </span>

                          <span className="text-sm font-semibold text-gray-900">
                            {
                              item.percentage
                            }%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className="h-full rounded-full bg-gray-900 transition-all"
                            style={{
                              width: `${Math.min(
                                item.percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedEvent(
                              item
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Eye
                            size={15}
                          />

                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadAttendance(
                              event
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Download
                            size={15}
                          />

                          Download
                        </button>

                        {event.attendance_token && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowQR(
                                event
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800"
                          >
                            <QrCode
                              size={15}
                            />

                            QR
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div className="min-w-0">

                <h2 className="truncate font-semibold text-gray-900">
                  {
                    selectedEvent
                      .event.title
                  }
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(
                    selectedEvent
                      .event
                      .event_date
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(
                    null
                  )
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 p-5 md:grid-cols-4">

              <ModalStat
                title="Total"
                value={
                  selectedEvent.total
                }
              />

              <ModalStat
                title="Present"
                value={
                  selectedEvent.present
                }
              />

              <ModalStat
                title="Absent"
                value={
                  selectedEvent.absent
                }
              />

              <ModalStat
                title="Attendance"
                value={`${selectedEvent.percentage}%`}
              />
            </div>

            {/* TABLE */}

            <div className="flex-1 overflow-auto">

              {getEventVolunteers(
                selectedEvent.event.id
              ).length === 0 ? (

                <div className="px-6 py-16 text-center">

                  <Users
                    size={40}
                    className="mx-auto mb-3 text-gray-300"
                  />

                  <p className="font-medium text-gray-700">
                    No attendance records yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Volunteer attendance will appear here after it is marked.
                  </p>
                </div>

              ) : (

                <div className="min-w-[850px]">

                  <table className="w-full text-left">

                    <thead className="sticky top-0 border-b border-gray-100 bg-gray-50">

                      <tr>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Volunteer
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Roll Number
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Department
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Unit
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Status
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-gray-500">
                          Source
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {getEventVolunteers(
                        selectedEvent.event.id
                      ).map(
                        (item) => {
                          const volunteer =
                            item.volunteer!;

                          const record =
                            item.attendance;

                          return (
                            <tr
                              key={
                                record.id
                              }
                              className="hover:bg-gray-50"
                            >

                              <td className="px-5 py-3">

                                <p className="text-sm font-medium text-gray-900">
                                  {
                                    volunteer.full_name
                                  }
                                </p>

                                <p className="text-xs text-gray-500">
                                  {
                                    volunteer.volunteer_id ||
                                    "—"
                                  }
                                </p>
                              </td>

                              <td className="px-5 py-3 text-sm text-gray-600">
                                {
                                  volunteer.roll_number
                                }
                              </td>

                              <td className="px-5 py-3 text-sm text-gray-600">
                                {
                                  volunteer.department
                                }
                              </td>

                              <td className="px-5 py-3 text-sm text-gray-600">
                                {
                                  volunteer.nss_unit ||
                                  "—"
                                }
                              </td>

                              <td className="px-5 py-3">
                                <AttendanceBadge
                                  status={
                                    record.status
                                  }
                                />
                              </td>

                              <td className="px-5 py-3 text-xs capitalize text-gray-500">
                                {
                                  record.source ||
                                  "—"
                                }
                              </td>

                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="flex justify-end border-t border-gray-100 px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  downloadAttendance(
                    selectedEvent.event
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Download size={16} />

                Download Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          QR MODAL
      ===================================================== */}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>

                <h2 className="font-semibold text-gray-900">
                  Attendance QR
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {showQR.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowQR(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 text-center">

              <div className="mx-auto mb-5 flex h-56 w-56 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">

                <div>

                  <QrCode
                    size={130}
                    className="mx-auto text-gray-900"
                  />

                  <p className="mt-3 max-w-[180px] break-all text-[9px] text-gray-500">
                    {
                      showQR.attendance_token
                    }
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700">
                Attendance Token
              </p>

              <div className="mt-2 break-all rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                {
                  showQR.attendance_token
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">

      <p className="text-[10px] text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   MODAL STAT
========================================================= */

function ModalStat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">

      <p className="text-xs text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EVENT STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const value =
    status.toLowerCase();

  let classes =
    "bg-gray-100 text-gray-700";

  if (
    value === "published"
  ) {
    classes =
      "bg-green-50 text-green-700";
  }

  if (
    value === "draft"
  ) {
    classes =
      "bg-yellow-50 text-yellow-700";
  }

  if (
    value === "completed" ||
    value === "closed"
  ) {
    classes =
      "bg-blue-50 text-blue-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ATTENDANCE STATUS
========================================================= */

function AttendanceBadge({
  status,
}: {
  status: string;
}) {
  const value =
    status.toLowerCase();

  let classes =
    "bg-yellow-50 text-yellow-700";

  if (
    value === "present" ||
    value === "attended" ||
    value === "approved"
  ) {
    classes =
      "bg-green-50 text-green-700";
  }

  if (
    value === "absent"
  ) {
    classes =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${classes}`}
    >
      {status || "Pending"}
    </span>
  );
}