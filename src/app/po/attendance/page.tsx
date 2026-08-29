"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
  ClipboardCheck,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type AttendanceEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  qr_token: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type AttendanceRecord = {
  id: string;
  attendance_event_id: string;
  volunteer_id: string;
  scanned_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  volunteer_id: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  section: string | null;
  academic_year: string | null;
  nss_unit: string | null;
  photo_url: string | null;
};

type EventSummary = {
  event: AttendanceEvent;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
};

type AttendanceStudent = {
  record: AttendanceRecord;
  volunteer: Volunteer | null;
};

function normalize(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) return "—";

  const parts = value.split(":");

  if (parts.length < 2) return value;

  const hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) return value;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function getStatusLabel(value: string | null | undefined) {
  const status = normalize(value);

  if (status === "present") return "Present";
  if (status === "absent") return "Absent";
  if (status === "late") return "Late";
  if (status === "excused") return "Excused";

  return value || "Unknown";
}

function getStatusClass(value: string | null | undefined) {
  const status = normalize(value);

  if (status === "present") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "absent") {
    return "bg-red-50 text-red-700";
  }

  if (status === "late") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "excused") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-slate-100 text-slate-600";
}

function getInitials(name: string | null | undefined) {
  if (!name) return "V";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function Avatar({
  volunteer,
  large = false,
}: {
  volunteer: Volunteer | null;
  large?: boolean;
}) {
  const size = large ? "h-16 w-16" : "h-10 w-10";

  if (volunteer?.photo_url) {
    return (
      <img
        src={volunteer.photo_url}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover ring-2 ring-slate-100`}
      />
    );
  }

  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#12358f] text-sm font-bold text-white`}
    >
      {getInitials(volunteer?.full_name)}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="font-serif text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#12358f] focus:ring-2 focus:ring-[#12358f]/10"
      >
        <option value="">All</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default function POAttendancePage() {
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * MAIN EVENT PAGE FILTERS
   */
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatus, setEventStatus] = useState("");

  /*
   * SELECTED EVENT
   */
  const [selectedEventId, setSelectedEventId] =
    useState<string | null>(null);

  /*
   * STUDENT ATTENDANCE FILTERS
   */
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDepartment, setStudentDepartment] = useState("");
  const [studentYear, setStudentYear] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentUnit, setStudentUnit] = useState("");
  const [studentStatus, setStudentStatus] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<AttendanceStudent | null>(null);

  const loadAttendance = useCallback(async () => {
    try {
      setRefreshing(true);

      const [
        eventsResponse,
        recordsResponse,
        volunteersResponse,
      ] = await Promise.all([
        supabase
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
          .order("event_date", { ascending: false }),

        supabase
          .from("attendance_records")
          .select(`
            id,
            attendance_event_id,
            volunteer_id,
            scanned_at,
            status,
            notes,
            created_at,
            updated_at
          `)
          .order("scanned_at", { ascending: false }),

        supabase
          .from("volunteers")
          .select(`
            id,
            full_name,
            roll_number,
            volunteer_id,
            department,
            course,
            year,
            section,
            academic_year,
            nss_unit,
            photo_url
          `)
          .order("full_name", { ascending: true }),
      ]);

      if (eventsResponse.error) {
        throw eventsResponse.error;
      }

      if (recordsResponse.error) {
        throw recordsResponse.error;
      }

      if (volunteersResponse.error) {
        throw volunteersResponse.error;
      }

      setEvents(
        (eventsResponse.data as AttendanceEvent[]) || []
      );

      setRecords(
        (recordsResponse.data as AttendanceRecord[]) || []
      );

      setVolunteers(
        (volunteersResponse.data as Volunteer[]) || []
      );
    } catch (error) {
      console.error("PO attendance loading error:", error);

      setEvents([]);
      setRecords([]);
      setVolunteers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /*
   * VOLUNTEER LOOKUP
   */
  const volunteerMap = useMemo(() => {
    const map = new Map<string, Volunteer>();

    volunteers.forEach((volunteer) => {
      map.set(volunteer.id, volunteer);
    });

    return map;
  }, [volunteers]);

  /*
   * EVENT SUMMARIES
   *
   * IMPORTANT:
   * The main page is EVENT-WISE.
   */
  const eventSummaries = useMemo<EventSummary[]>(() => {
    return events.map((event) => {
      const eventRecords = records.filter(
        (record) => record.attendance_event_id === event.id
      );

      const present = eventRecords.filter(
        (record) => normalize(record.status) === "present"
      ).length;

      const absent = eventRecords.filter(
        (record) => normalize(record.status) === "absent"
      ).length;

      const late = eventRecords.filter(
        (record) => normalize(record.status) === "late"
      ).length;

      const excused = eventRecords.filter(
        (record) => normalize(record.status) === "excused"
      ).length;

      const total = eventRecords.length;

      const attendanceRate =
        total > 0
          ? Math.round((present / total) * 1000) / 10
          : 0;

      return {
        event,
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate,
      };
    });
  }, [events, records]);

  /*
   * FILTER EVENTS
   */
  const filteredEventSummaries = useMemo(() => {
    const query = normalize(eventSearch);

    return eventSummaries.filter((summary) => {
      const matchesSearch =
        !query ||
        [
          summary.event.title,
          summary.event.description,
          summary.event.venue,
          summary.event.status,
        ].some((value) => normalize(value).includes(query));

      const matchesStatus =
        !eventStatus ||
        normalize(summary.event.status) ===
          normalize(eventStatus);

      return matchesSearch && matchesStatus;
    });
  }, [eventSummaries, eventSearch, eventStatus]);

  /*
   * OVERALL EVENT-WISE STATS
   */
  const overallStats = useMemo(() => {
    const totalRecords = records.length;

    const present = records.filter(
      (record) => normalize(record.status) === "present"
    ).length;

    const absent = records.filter(
      (record) => normalize(record.status) === "absent"
    ).length;

    const late = records.filter(
      (record) => normalize(record.status) === "late"
    ).length;

    const rate =
      totalRecords > 0
        ? Math.round((present / totalRecords) * 100)
        : 0;

    return {
      events: events.length,
      records: totalRecords,
      present,
      absent,
      late,
      rate,
    };
  }, [events, records]);

  /*
   * SELECTED EVENT
   */
  const selectedEventSummary = useMemo(() => {
    if (!selectedEventId) return null;

    return (
      eventSummaries.find(
        (summary) => summary.event.id === selectedEventId
      ) || null
    );
  }, [selectedEventId, eventSummaries]);

  /*
   * STUDENTS FOR SELECTED EVENT
   */
  const selectedEventStudents = useMemo<AttendanceStudent[]>(() => {
    if (!selectedEventId) return [];

    return records
      .filter(
        (record) => record.attendance_event_id === selectedEventId
      )
      .map((record) => ({
        record,
        volunteer: volunteerMap.get(record.volunteer_id) || null,
      }));
  }, [selectedEventId, records, volunteerMap]);

  /*
   * STUDENT FILTER OPTIONS
   */
  const studentDepartments = useMemo(() => {
    return Array.from(
      new Set(
        selectedEventStudents
          .map((item) => item.volunteer?.department)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [selectedEventStudents]);

  const studentYears = useMemo(() => {
    return Array.from(
      new Set(
        selectedEventStudents
          .map((item) => item.volunteer?.year)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [selectedEventStudents]);

  const studentSections = useMemo(() => {
    return Array.from(
      new Set(
        selectedEventStudents
          .map((item) => item.volunteer?.section)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [selectedEventStudents]);

  const studentUnits = useMemo(() => {
    return Array.from(
      new Set(
        selectedEventStudents
          .map((item) => item.volunteer?.nss_unit)
          .filter(Boolean)
      )
    ).sort() as string[];
  }, [selectedEventStudents]);

  /*
   * FILTER STUDENTS FOR SELECTED EVENT
   */
  const filteredStudents = useMemo(() => {
    const query = normalize(studentSearch);

    return selectedEventStudents.filter(
      ({ record, volunteer }) => {
        const matchesSearch =
          !query ||
          [
            volunteer?.full_name,
            volunteer?.roll_number,
            volunteer?.volunteer_id,
            volunteer?.department,
            volunteer?.course,
          ].some((value) =>
            normalize(value).includes(query)
          );

        const matchesDepartment =
          !studentDepartment ||
          volunteer?.department === studentDepartment;

        const matchesYear =
          !studentYear ||
          volunteer?.year === studentYear;

        const matchesSection =
          !studentSection ||
          volunteer?.section === studentSection;

        const matchesUnit =
          !studentUnit ||
          volunteer?.nss_unit === studentUnit;

        const matchesStatus =
          !studentStatus ||
          normalize(record.status) ===
            normalize(studentStatus);

        return (
          matchesSearch &&
          matchesDepartment &&
          matchesYear &&
          matchesSection &&
          matchesUnit &&
          matchesStatus
        );
      }
    );
  }, [
    selectedEventStudents,
    studentSearch,
    studentDepartment,
    studentYear,
    studentSection,
    studentUnit,
    studentStatus,
  ]);

  function openEvent(eventId: string) {
    setSelectedEventId(eventId);

    setStudentSearch("");
    setStudentDepartment("");
    setStudentYear("");
    setStudentSection("");
    setStudentUnit("");
    setStudentStatus("");
  }

  function closeEvent() {
    setSelectedEventId(null);
    setSelectedStudent(null);
  }

  function clearEventFilters() {
    setEventSearch("");
    setEventStatus("");
  }

  function clearStudentFilters() {
    setStudentSearch("");
    setStudentDepartment("");
    setStudentYear("");
    setStudentSection("");
    setStudentUnit("");
    setStudentStatus("");
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="animate-pulse space-y-6">
            <div className="h-7 w-52 rounded-lg bg-slate-200" />
            <div className="h-4 w-80 rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
              <div className="h-24 rounded-2xl bg-white" />
            </div>

            <div className="h-32 rounded-2xl bg-white" />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-56 rounded-2xl bg-white" />
              <div className="h-56 rounded-2xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * EVENT DETAILS VIEW
   */
  if (selectedEventSummary) {
    const summary = selectedEventSummary;

    return (
      <>
        <main className="min-h-screen bg-[#f7f9fc]">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
            {/* BACK + HEADER */}
            <div className="mb-7">
              <button
                type="button"
                onClick={closeEvent}
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#12358f]"
              >
                <ChevronRight
                  size={16}
                  className="rotate-180"
                />
                Back to Attendance Events
              </button>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                    <span>Program Officer</span>
                    <ChevronRight size={13} />
                    <span>Attendance</span>
                    <ChevronRight size={13} />
                    <span>Event</span>
                  </div>

                  <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
                    {summary.event.title}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      {formatDate(summary.event.event_date)}
                    </span>

                    {summary.event.start_time && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} />
                        {formatTime(summary.event.start_time)}
                        {summary.event.end_time
                          ? ` – ${formatTime(
                              summary.event.end_time
                            )}`
                          : ""}
                      </span>
                    )}

                    {summary.event.venue && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={15} />
                        {summary.event.venue}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={loadAttendance}
                  disabled={refreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={
                      refreshing ? "animate-spin" : ""
                    }
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* EVENT INFORMATION */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Event Status
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-[#12358f]">
                      {summary.event.status || "Active"}
                    </span>

                    {summary.event.description && (
                      <p className="text-sm text-slate-500">
                        {summary.event.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                  <Users
                    size={18}
                    className="text-[#12358f]"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    {summary.total} attendance records
                  </span>
                </div>
              </div>
            </section>

            {/* ATTENDANCE SUMMARY */}
            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                icon={<Users size={20} />}
                value={summary.total}
                label="Attendance Records"
              />

              <StatCard
                icon={<CheckCircle2 size={20} />}
                value={summary.present}
                label="Present"
              />

              <StatCard
                icon={<XCircle size={20} />}
                value={summary.absent}
                label="Absent"
              />

              <StatCard
                icon={<Clock3 size={20} />}
                value={summary.late}
                label="Late"
              />

              <StatCard
                icon={<ClipboardCheck size={20} />}
                value={`${summary.attendanceRate}%`}
                label="Attendance Rate"
              />
            </div>

            {/* STUDENT SEARCH / FILTERS */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                  Search Attended Students
                </label>

                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={studentSearch}
                    onChange={(event) =>
                      setStudentSearch(event.target.value)
                    }
                    placeholder="Search name, roll number, volunteer ID..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <FilterSelect
                  label="Department"
                  value={studentDepartment}
                  options={studentDepartments}
                  onChange={setStudentDepartment}
                />

                <FilterSelect
                  label="Year"
                  value={studentYear}
                  options={studentYears}
                  onChange={setStudentYear}
                />

                <FilterSelect
                  label="Section"
                  value={studentSection}
                  options={studentSections}
                  onChange={setStudentSection}
                />

                <FilterSelect
                  label="NSS Unit"
                  value={studentUnit}
                  options={studentUnits}
                  onChange={setStudentUnit}
                />

                <FilterSelect
                  label="Status"
                  value={studentStatus}
                  options={[
                    "Present",
                    "Absent",
                    "Late",
                    "Excused",
                  ]}
                  onChange={setStudentStatus}
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredStudents.length}
                  </span>{" "}
                  of {selectedEventStudents.length} records
                </p>

                <button
                  type="button"
                  onClick={clearStudentFilters}
                  className="text-xs font-semibold text-[#12358f] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </section>

            {/* STUDENT ATTENDANCE */}
            <section>
              <div className="mb-4">
                <h2 className="font-serif text-xl font-bold text-slate-950">
                  Event Attendance
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Volunteers recorded against this NSS event.
                </p>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Users size={24} />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    No attendance records found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    No volunteers match the selected filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[950px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Student
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Roll / ID
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Department
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Year / Section
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              NSS Unit
                            </th>

                            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                              Status
                            </th>

                            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredStudents.map(
                            ({ record, volunteer }) => (
                              <tr
                                key={record.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar
                                      volunteer={volunteer}
                                    />

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-bold text-slate-900">
                                        {volunteer?.full_name ||
                                          "Unknown Volunteer"}
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {volunteer?.course || "NSS Volunteer"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {volunteer?.roll_number ||
                                      "—"}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {volunteer?.volunteer_id ||
                                      "No Volunteer ID"}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                  {volunteer?.department || "—"}
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm text-slate-700">
                                    {volunteer?.year || "—"}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {volunteer?.section
                                      ? `Section ${volunteer.section}`
                                      : "—"}
                                  </p>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-700">
                                  {volunteer?.nss_unit || "—"}
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                      record.status
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      record.status
                                    )}
                                  </span>
                                </td>

                                <td className="px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedStudent({
                                        record,
                                        volunteer,
                                      })
                                    }
                                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-[#12358f] hover:text-[#12358f]"
                                  >
                                    <Eye size={15} />
                                    View
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="grid gap-4 lg:hidden">
                    {filteredStudents.map(
                      ({ record, volunteer }) => (
                        <article
                          key={record.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar volunteer={volunteer} />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {volunteer?.full_name ||
                                    "Unknown Volunteer"}
                                </h3>

                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                                    record.status
                                  )}`}
                                >
                                  {getStatusLabel(
                                    record.status
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {volunteer?.roll_number ||
                                  "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <DetailBox
                              label="Department"
                              value={
                                volunteer?.department || "—"
                              }
                            />

                            <DetailBox
                              label="Year"
                              value={volunteer?.year || "—"}
                            />

                            <DetailBox
                              label="Section"
                              value={
                                volunteer?.section || "—"
                              }
                            />

                            <DetailBox
                              label="NSS Unit"
                              value={
                                volunteer?.nss_unit || "—"
                              }
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedStudent({
                                record,
                                volunteer,
                              })
                            }
                            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#12358f] text-sm font-semibold text-[#12358f] transition hover:bg-[#12358f] hover:text-white"
                          >
                            <Eye size={16} />
                            View Attendance
                          </button>
                        </article>
                      )
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>

        {/* STUDENT DETAIL DRAWER */}
        {selectedStudent && (
          <div className="fixed inset-0 z-[60]">
            <button
              type="button"
              aria-label="Close student details"
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Attendance Record
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-bold text-slate-950">
                      {selectedStudent.volunteer?.full_name ||
                        "Unknown Volunteer"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStudent(null)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <section className="rounded-2xl bg-[#102f8f] p-6 text-white">
                  <div className="flex items-center gap-4">
                    <Avatar
                      volunteer={selectedStudent.volunteer}
                      large
                    />

                    <div>
                      <h3 className="font-serif text-xl font-bold">
                        {selectedStudent.volunteer
                          ?.full_name ||
                          "Unknown Volunteer"}
                      </h3>

                      <p className="mt-1 text-sm text-white/70">
                        {selectedStudent.volunteer
                          ?.volunteer_id ||
                          selectedStudent.volunteer
                            ?.roll_number ||
                          "—"}
                      </p>

                      <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {getStatusLabel(
                          selectedStudent.record.status
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                    <CalendarDays
                      size={18}
                      className="text-[#12358f]"
                    />
                    Event Details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Event"
                      value={summary.event.title}
                    />

                    <DetailBox
                      label="Event Date"
                      value={formatDate(
                        summary.event.event_date
                      )}
                    />

                    <DetailBox
                      label="Venue"
                      value={
                        summary.event.venue || "—"
                      }
                    />

                    <DetailBox
                      label="Attendance Status"
                      value={getStatusLabel(
                        selectedStudent.record.status
                      )}
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                    <Users
                      size={18}
                      className="text-[#12358f]"
                    />
                    Volunteer Details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Roll Number"
                      value={
                        selectedStudent.volunteer
                          ?.roll_number || "—"
                      }
                    />

                    <DetailBox
                      label="Volunteer ID"
                      value={
                        selectedStudent.volunteer
                          ?.volunteer_id || "—"
                      }
                    />

                    <DetailBox
                      label="Department"
                      value={
                        selectedStudent.volunteer
                          ?.department || "—"
                      }
                    />

                    <DetailBox
                      label="Course"
                      value={
                        selectedStudent.volunteer
                          ?.course || "—"
                      }
                    />

                    <DetailBox
                      label="Year"
                      value={
                        selectedStudent.volunteer?.year ||
                        "—"
                      }
                    />

                    <DetailBox
                      label="Section"
                      value={
                        selectedStudent.volunteer
                          ?.section || "—"
                      }
                    />

                    <DetailBox
                      label="Academic Year"
                      value={
                        selectedStudent.volunteer
                          ?.academic_year || "—"
                      }
                    />

                    <DetailBox
                      label="NSS Unit"
                      value={
                        selectedStudent.volunteer
                          ?.nss_unit || "—"
                      }
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                    <Clock3
                      size={18}
                      className="text-[#12358f]"
                    />
                    Attendance Timing
                  </h3>

                  <DetailBox
                    label="Scanned At"
                    value={new Date(
                      selectedStudent.record.scanned_at
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  />
                </section>

                {selectedStudent.record.notes && (
                  <section>
                    <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                      <AlertCircle
                        size={18}
                        className="text-[#12358f]"
                      />
                      Notes
                    </h3>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm leading-6 text-slate-700">
                        {selectedStudent.record.notes}
                      </p>
                    </div>
                  </section>
                )}
              </div>
            </aside>
          </div>
        )}
      </>
    );
  }

  /*
   * MAIN EVENT-WISE ATTENDANCE PAGE
   */
  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-xs text-slate-400">
              Program Officer Portal
              <span className="mx-2">›</span>
              Attendance
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
              Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View attendance event-wise and monitor NSS volunteer participation.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAttendance}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays size={20} />}
            value={overallStats.events}
            label="Attendance Events"
          />

          <StatCard
            icon={<CheckCircle2 size={20} />}
            value={overallStats.present}
            label="Total Present"
          />

          <StatCard
            icon={<XCircle size={20} />}
            value={overallStats.absent}
            label="Total Absent"
          />

          <StatCard
            icon={<ClipboardCheck size={20} />}
            value={`${overallStats.rate}%`}
            label="Overall Attendance"
          />
        </div>

        {/* EVENT FILTERS */}
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Search Events
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={eventSearch}
                  onChange={(event) =>
                    setEventSearch(event.target.value)
                  }
                  placeholder="Search event title, venue or description..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Event Status
              </label>

              <select
                value={eventStatus}
                onChange={(event) =>
                  setEventStatus(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredEventSummaries.length}
              </span>{" "}
              attendance events
            </p>

            <button
              type="button"
              onClick={clearEventFilters}
              className="text-xs font-semibold text-[#12358f] hover:underline"
            >
              Clear filters
            </button>
          </div>
        </section>

        {/* EVENTS */}
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold text-slate-950">
              Attendance Events
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select an event to view its complete attendance details.
            </p>
          </div>

          {filteredEventSummaries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays size={25} />
              </div>

              <h3 className="font-serif text-lg font-bold text-slate-900">
                No attendance events found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Attendance events will appear here once they are created.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredEventSummaries.map((summary) => (
                <article
                  key={summary.event.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* EVENT HEADER */}
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
                            <CalendarDays size={17} />
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${
                              normalize(
                                summary.event.status
                              ) === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : normalize(
                                      summary.event.status
                                    ) === "completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-50 text-[#12358f]"
                            }`}
                          >
                            {summary.event.status ||
                              "Active"}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-slate-950">
                          {summary.event.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatDate(
                              summary.event.event_date
                            )}
                          </span>

                          {summary.event.venue && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={13} />
                              {summary.event.venue}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-serif text-2xl font-bold text-slate-950">
                          {summary.attendanceRate}%
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Attendance
                        </p>
                      </div>
                    </div>

                    {summary.event.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                        {summary.event.description}
                      </p>
                    )}
                  </div>

                  {/* SUMMARY */}
                  <div className="grid grid-cols-4 border-b border-slate-100">
                    <EventStat
                      value={summary.total}
                      label="Records"
                    />

                    <EventStat
                      value={summary.present}
                      label="Present"
                      type="present"
                    />

                    <EventStat
                      value={summary.absent}
                      label="Absent"
                      type="absent"
                    />

                    <EventStat
                      value={summary.late}
                      label="Late"
                      type="late"
                    />
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Event Attendance
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {summary.total} recorded volunteer
                        {summary.total === 1 ? "" : "s"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openEvent(summary.event.id)
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#12358f] px-4 text-xs font-semibold text-white transition hover:bg-[#0d2870]"
                    >
                      <Eye size={15} />
                      View Attendance
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EventStat({
  value,
  label,
  type,
}: {
  value: number;
  label: string;
  type?: "present" | "absent" | "late";
}) {
  let valueClass = "text-slate-950";

  if (type === "present") {
    valueClass = "text-emerald-600";
  }

  if (type === "absent") {
    valueClass = "text-red-600";
  }

  if (type === "late") {
    valueClass = "text-amber-600";
  }

  return (
    <div className="border-r border-slate-100 p-4 text-center last:border-r-0">
      <p className={`font-serif text-xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}