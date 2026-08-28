"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  UserCheck,
  MessageSquare,
  ShieldCheck,
  Search,
  Eye,
  Clock,
  MapPin,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter,
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

type Volunteer = {
  id: string;
  full_name: string;
  roll_number: string;
  department: string;
  course: string | null;
  year: string;
  semester: string | null;
  section: string | null;
  academic_year: string | null;
  nss_unit: string | null;
  volunteer_id: string | null;
  college_email: string;
  mobile_number: string;
  photo_url: string | null;
};

type AttendanceEvent = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  status: string;
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

  volunteer: Volunteer | null;
  event: AttendanceEvent | null;
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(time: string | null | undefined) {
  if (!time) return "";

  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);

  if (Number.isNaN(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function normalizeStatus(status: string | null | undefined) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

function isPresent(status: string) {
  return [
    "present",
    "p",
    "attended",
    "approved",
  ].includes(normalizeStatus(status));
}

function isAbsent(status: string) {
  return [
    "absent",
    "a",
    "not present",
  ].includes(normalizeStatus(status));
}


function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim())))).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}

export default function AuthorityAttendancePage() {
  const router = useRouter();

  const [authority, setAuthority] =
    useState<Authority | null>(null);

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] = useState("");

  const [academicYear, setAcademicYear] =
    useState("all");

  const [department, setDepartment] =
    useState("all");

  const [course, setCourse] =
    useState("all");

  const [year, setYear] =
    useState("all");

  const [section, setSection] =
    useState("all");

  const [nssUnit, setNssUnit] =
    useState("all");

  const [eventId, setEventId] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [dateFilter, setDateFilter] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadData = useCallback(
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
           2. AUTHORITY PROFILE
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
            "Authority error:",
            authorityError
          );

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

        /* ---------------------------------------------------
           3. PRINCIPAL / VP SECURITY CHECK
        --------------------------------------------------- */

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

        /* ---------------------------------------------------
           4. ATTENDANCE RECORDS
        --------------------------------------------------- */

        const {
          data: attendanceData,
          error: attendanceError,
        } = await supabase
          .from("attendance_records")
          .select(
            `
              id,
              attendance_event_id,
              volunteer_id,
              scanned_at,
              status,
              notes,
              created_at,
              updated_at
            `
          )
          .order("scanned_at", {
            ascending: false,
          });

        if (attendanceError) {
          console.error(
            "Attendance records error:",
            attendanceError
          );

          throw new Error(
            attendanceError.message ||
              "Unable to load attendance records."
          );
        }

        const rawRecords =
          attendanceData || [];

        /* ---------------------------------------------------
           5. LOAD VOLUNTEERS
        --------------------------------------------------- */

        const volunteerIds = [
          ...new Set(
            rawRecords.map(
              (record) => record.volunteer_id
            )
          ),
        ];

        let volunteers: Volunteer[] = [];

        if (volunteerIds.length > 0) {
          const {
            data: volunteerData,
            error: volunteerError,
          } = await supabase
            .from("volunteers")
            .select(
              `
                id,
                full_name,
                roll_number,
                department,
                course,
                year,
                semester,
                section,
                academic_year,
                nss_unit,
                volunteer_id,
                college_email,
                mobile_number,
                photo_url
              `
            )
            .in("id", volunteerIds);

          if (volunteerError) {
            console.error(
              "Volunteer loading error:",
              volunteerError
            );

            throw new Error(
              volunteerError.message ||
                "Unable to load volunteer information."
            );
          }

          volunteers =
            volunteerData || [];
        }

        /* ---------------------------------------------------
           6. LOAD ATTENDANCE EVENTS
        --------------------------------------------------- */

        const eventIds = [
          ...new Set(
            rawRecords.map(
              (record) =>
                record.attendance_event_id
            )
          ),
        ];

        let attendanceEvents:
          AttendanceEvent[] = [];

        if (eventIds.length > 0) {
          const {
            data: eventData,
            error: eventError,
          } = await supabase
            .from("attendance_events")
            .select(
              `
                id,
                title,
                description,
                event_date,
                start_time,
                end_time,
                venue,
                status
              `
            )
            .in("id", eventIds);

          if (eventError) {
            console.error(
              "Attendance events error:",
              eventError
            );

            throw new Error(
              eventError.message ||
                "Unable to load attendance events."
            );
          }

          attendanceEvents =
            eventData || [];
        }

        /* ---------------------------------------------------
           7. CREATE LOOKUP MAPS
        --------------------------------------------------- */

        const volunteerMap = new Map<
          string,
          Volunteer
        >();

        volunteers.forEach((volunteer) => {
          volunteerMap.set(
            volunteer.id,
            volunteer
          );
        });

        const eventMap = new Map<
          string,
          AttendanceEvent
        >();

        attendanceEvents.forEach((event) => {
          eventMap.set(event.id, event);
        });

        /* ---------------------------------------------------
           8. COMBINE DATA
        --------------------------------------------------- */

        const combinedRecords: AttendanceRecord[] =
          rawRecords.map((record) => ({
            ...record,
            volunteer:
              volunteerMap.get(
                record.volunteer_id
              ) || null,
            event:
              eventMap.get(
                record.attendance_event_id
              ) || null,
          }));

        setRecords(combinedRecords);
      } catch (err) {
        console.error(
          "Authority attendance error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance."
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

  /* =======================================================
     UNIQUE FILTER VALUES
  ======================================================= */

  const academicYears = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.academic_year)),
    [records]
  );

  const departments = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.department)),
    [records]
  );

  const courses = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.course)),
    [records]
  );

  const years = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.year)),
    [records]
  );

  const sections = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.section)),
    [records]
  );

  const nssUnits = useMemo(
    () => uniqueStrings(records.map((record) => record.volunteer?.nss_unit)),
    [records]
  );

  const attendanceEvents = useMemo(() => {
    const map = new Map<
      string,
      AttendanceEvent
    >();

    records.forEach((record) => {
      if (record.event) {
        map.set(
          record.event.id,
          record.event
        );
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(
          `${b.event_date}T00:00:00`
        ).getTime() -
        new Date(
          `${a.event_date}T00:00:00`
        ).getTime()
    );
  }, [records]);

  /* =======================================================
     FILTER RECORDS
  ======================================================= */

  const filteredRecords = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return records.filter((record) => {
      const volunteer =
        record.volunteer;

      const event = record.event;

      /* SEARCH */

      const searchableText = [
        volunteer?.full_name,
        volunteer?.roll_number,
        volunteer?.volunteer_id,
        volunteer?.department,
        volunteer?.course,
        volunteer?.nss_unit,
        event?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (
        searchValue &&
        !searchableText.includes(
          searchValue
        )
      ) {
        return false;
      }

      /* ACADEMIC YEAR */

      if (
        academicYear !== "all" &&
        volunteer?.academic_year !==
          academicYear
      ) {
        return false;
      }

      /* DEPARTMENT */

      if (
        department !== "all" &&
        volunteer?.department !==
          department
      ) {
        return false;
      }

      /* COURSE */

      if (
        course !== "all" &&
        volunteer?.course !== course
      ) {
        return false;
      }

      /* YEAR */

      if (
        year !== "all" &&
        volunteer?.year !== year
      ) {
        return false;
      }

      /* SECTION */

      if (
        section !== "all" &&
        volunteer?.section !== section
      ) {
        return false;
      }

      /* NSS UNIT */

      if (
        nssUnit !== "all" &&
        volunteer?.nss_unit !== nssUnit
      ) {
        return false;
      }

      /* EVENT */

      if (
        eventId !== "all" &&
        record.attendance_event_id !==
          eventId
      ) {
        return false;
      }

      /* STATUS */

      if (
        status !== "all" &&
        normalizeStatus(
          record.status
        ) !== status
      ) {
        return false;
      }

      /* DATE */

      if (dateFilter) {
        const scannedDate =
          new Date(
            record.scanned_at
          );

        const selectedDate =
          scannedDate
            .toISOString()
            .split("T")[0];

        if (
          selectedDate !==
          dateFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    records,
    search,
    academicYear,
    department,
    course,
    year,
    section,
    nssUnit,
    eventId,
    status,
    dateFilter,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalRecords =
    filteredRecords.length;

  const presentCount =
    filteredRecords.filter((record) =>
      isPresent(record.status)
    ).length;

  const absentCount =
    filteredRecords.filter((record) =>
      isAbsent(record.status)
    ).length;

  const otherCount =
    totalRecords -
    presentCount -
    absentCount;

  const volunteersCovered = new Set(
    filteredRecords.map(
      (record) => record.volunteer_id
    )
  ).size;

  const attendancePercentage =
    totalRecords > 0
      ? Math.round(
          (presentCount /
            totalRecords) *
            100
        )
      : 0;

  const resetFilters = () => {
    setSearch("");
    setAcademicYear("all");
    setDepartment("all");
    setCourse("all");
    setYear("all");
    setSection("all");
    setNssUnit("all");
    setEventId("all");
    setStatus("all");
    setDateFilter("");
  };

  const roleLabel =
    authority?.designation ||
    authority?.role ||
    "Authority";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F2B7B]" />
          <p className="mt-4 text-sm text-gray-500">Loading attendance...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">!</div>
          <h1 className="mt-5 text-xl font-bold text-gray-900">Unable to load attendance</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">{error}</p>
          <button onClick={() => loadData()} className="mt-6 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#163A8C]">Try Again</button>
        </div>
      </main>
    );
  }

  if (!authority) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* PAGE HEADER */}

        <section className="mb-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                <span>
                  Authority Portal
                </span>

                <ChevronRight
                  size={13}
                />

                <span className="text-[#0F2B7B]">
                  Attendance
                </span>

              </div>

              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                NSS Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View volunteer attendance
                records, events and
                participation status.
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

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <SummaryCard
            icon={
              <ClipboardCheck
                size={20}
              />
            }
            label="Total Records"
            value={totalRecords}
          />

          <SummaryCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            label="Present"
            value={presentCount}
            variant="green"
          />

          <SummaryCard
            icon={
              <XCircle size={20} />
            }
            label="Absent"
            value={absentCount}
            variant="red"
          />

          <SummaryCard
            icon={
              <Users size={20} />
            }
            label="Volunteers Covered"
            value={volunteersCovered}
          />

          <SummaryCard
            icon={
              <BarChart3
                size={20}
              />
            }
            label="Attendance Rate"
            value={attendancePercentage}
            suffix="%"
          />

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-4 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0F2B7B]">
                <Filter size={18} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Filter Attendance
                </h3>

                <p className="text-xs text-gray-500">
                  Narrow down attendance
                  records.
                </p>
              </div>

            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0F2B7B] hover:underline"
            >
              Reset Filters
            </button>

          </div>

          {/* SEARCH */}

          <div className="relative">

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
              placeholder="Search volunteer name, roll number, volunteer ID, department or event..."
              className="w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

          {/* FILTER GRID */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

            <SelectFilter
              label="Academic Year"
              value={academicYear}
              onChange={
                setAcademicYear
              }
              options={
                academicYears
              }
            />

            <SelectFilter
              label="Department"
              value={department}
              onChange={
                setDepartment
              }
              options={
                departments
              }
            />

            <SelectFilter
              label="Course"
              value={course}
              onChange={setCourse}
              options={courses}
            />

            <SelectFilter
              label="Year"
              value={year}
              onChange={setYear}
              options={years}
            />

            <SelectFilter
              label="Section"
              value={section}
              onChange={setSection}
              options={sections}
            />

            <SelectFilter
              label="NSS Unit"
              value={nssUnit}
              onChange={setNssUnit}
              options={nssUnits}
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Attendance Event
              </label>

              <select
                value={eventId}
                onChange={(e) =>
                  setEventId(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white"
              >
                <option value="all">
                  All Events
                </option>

                {attendanceEvents.map(
                  (event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.title}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white"
              >
                <option value="all">
                  All Status
                </option>

                <option value="present">
                  Present
                </option>

                <option value="absent">
                  Absent
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Attendance Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white"
              />
            </div>

          </div>

        </section>

        {/* =================================================
            RECORD HEADER
        ================================================= */}

        <section className="mt-6">

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-lg font-bold text-gray-900">
                Attendance Records
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {filteredRecords.length}{" "}
                record
                {filteredRecords.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#0F2B7B]">
              View Only
            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredRecords.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-gray-400">
                <ClipboardCheck
                  size={25}
                />
              </div>

              <h3 className="mt-4 font-bold text-gray-800">
                No attendance records
                found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search
                or filters.
              </p>

              <button
                onClick={
                  resetFilters
                }
                className="mt-4 rounded-lg bg-[#0F2B7B] px-4 py-2 text-xs font-semibold text-white"
              >
                Clear Filters
              </button>

            </div>
          ) : (

            /* =================================================
               DESKTOP TABLE
            ================================================= */

            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1150px]">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Volunteer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Academic
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Department
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        NSS Unit
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Event
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Date & Time
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                        View
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredRecords.map(
                      (record) => {

                        const volunteer =
                          record.volunteer;

                        const event =
                          record.event;

                        const present =
                          isPresent(
                            record.status
                          );

                        const absent =
                          isAbsent(
                            record.status
                          );

                        return (
                          <tr
                            key={
                              record.id
                            }
                            className="transition hover:bg-slate-50"
                          >

                            {/* VOLUNTEER */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                {volunteer?.photo_url ? (
                                  <img
                                    src={
                                      volunteer.photo_url
                                    }
                                    alt={
                                      volunteer.full_name
                                    }
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#0F2B7B]">
                                    {volunteer?.full_name
                                      ?.charAt(
                                        0
                                      )
                                      ?.toUpperCase() ||
                                      "V"}
                                  </div>
                                )}

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-gray-900">
                                    {volunteer?.full_name ||
                                      "Volunteer unavailable"}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-500">
                                    Roll No:{" "}
                                    {volunteer?.roll_number ||
                                      "-"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* ACADEMIC */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-semibold text-gray-800">
                                {volunteer?.academic_year ||
                                  "-"}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {volunteer?.year ||
                                  "-"}
                                {volunteer?.semester
                                  ? ` • Sem ${volunteer.semester}`
                                  : ""}
                                {volunteer?.section
                                  ? ` • Sec ${volunteer.section}`
                                  : ""}
                              </p>

                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-semibold text-gray-800">
                                {volunteer?.department ||
                                  "-"}
                              </p>

                              {volunteer?.course && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    volunteer.course
                                  }
                                </p>
                              )}

                            </td>

                            {/* NSS UNIT */}

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0F2B7B]">
                                {volunteer?.nss_unit ||
                                  "-"}
                              </span>

                            </td>

                            {/* EVENT */}

                            <td className="max-w-[220px] px-5 py-4">

                              <p className="truncate text-sm font-semibold text-gray-800">
                                {event?.title ||
                                  "Event unavailable"}
                              </p>

                              {event?.venue && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    event.venue
                                  }
                                </p>
                              )}

                            </td>

                            {/* DATE */}

                            <td className="px-5 py-4">

                              <p className="text-sm font-medium text-gray-800">
                                {formatDateTime(
                                  record.scanned_at
                                )}
                              </p>

                              {event?.event_date && (
                                <p className="mt-1 text-xs text-gray-400">
                                  Event:{" "}
                                  {formatDate(
                                    event.event_date
                                  )}
                                </p>
                              )}

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">

                              <StatusBadge
                                status={
                                  record.status
                                }
                              />

                            </td>

                            {/* VIEW */}

                            <td className="px-5 py-4 text-right">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/authority/attendance/${record.id}`
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F2B7B] px-3 py-2 text-xs font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                              >

                                <Eye
                                  size={
                                    15
                                  }
                                />

                                View

                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* =================================================
              MOBILE / TABLET CARDS
          ================================================= */}

          {filteredRecords.length >
            0 && (
            <div className="space-y-4 lg:hidden">

              {filteredRecords.map(
                (record) => {

                  const volunteer =
                    record.volunteer;

                  const event =
                    record.event;

                  return (
                    <article
                      key={
                        record.id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                      {/* VOLUNTEER */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          {volunteer?.photo_url ? (
                            <img
                              src={
                                volunteer.photo_url
                              }
                              alt={
                                volunteer.full_name
                              }
                              className="h-11 w-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#0F2B7B]">
                              {volunteer?.full_name
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase() ||
                                "V"}
                            </div>
                          )}

                          <div className="min-w-0">

                            <h4 className="truncate text-sm font-bold text-gray-900">
                              {volunteer?.full_name ||
                                "Volunteer unavailable"}
                            </h4>

                            <p className="mt-1 text-xs text-gray-500">
                              Roll No:{" "}
                              {volunteer?.roll_number ||
                                "-"}
                            </p>

                          </div>

                        </div>

                        <StatusBadge
                          status={
                            record.status
                          }
                        />

                      </div>

                      {/* ACADEMIC */}

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <InfoItem
                          label="Academic Year"
                          value={
                            volunteer?.academic_year ||
                            "-"
                          }
                        />

                        <InfoItem
                          label="Department"
                          value={
                            volunteer?.department ||
                            "-"
                          }
                        />

                        <InfoItem
                          label="Course"
                          value={
                            volunteer?.course ||
                            "-"
                          }
                        />

                        <InfoItem
                          label="Year / Section"
                          value={`${volunteer?.year || "-"}${
                            volunteer?.section
                              ? ` / ${volunteer.section}`
                              : ""
                          }`}
                        />

                        <InfoItem
                          label="NSS Unit"
                          value={
                            volunteer?.nss_unit ||
                            "-"
                          }
                        />

                        <InfoItem
                          label="Attendance Time"
                          value={formatDateTime(
                            record.scanned_at
                          )}
                        />

                      </div>

                      {/* EVENT */}

                      <div className="mt-4 rounded-xl bg-slate-50 p-4">

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0F2B7B]">
                            <CalendarDays
                              size={
                                18
                              }
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs font-semibold text-gray-400">
                              Attendance Event
                            </p>

                            <p className="mt-1 font-bold text-gray-800">
                              {event?.title ||
                                "Event unavailable"}
                            </p>

                            {event?.event_date && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                <CalendarDays
                                  size={
                                    13
                                  }
                                />
                                {formatDate(
                                  event.event_date
                                )}

                                {event.start_time && (
                                  <>
                                    <Clock
                                      size={
                                        13
                                      }
                                      className="ml-1"
                                    />

                                    {formatTime(
                                      event.start_time
                                    )}
                                  </>
                                )}
                              </p>
                            )}

                            {event?.venue && (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin
                                  size={
                                    13
                                  }
                                />
                                {
                                  event.venue
                                }
                              </p>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* NOTES */}

                      {record.notes && (
                        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">

                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Notes
                          </p>

                          <p className="mt-1 text-xs leading-5 text-gray-600">
                            {
                              record.notes
                            }
                          </p>

                        </div>
                      )}

                      {/* VIEW */}

                      <button
                        onClick={() =>
                          router.push(
                            `/authority/attendance/${record.id}`
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#0F2B7B] px-4 py-3 text-sm font-bold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
                      >

                        <Eye size={17} />

                        View Attendance

                      </button>

                    </article>
                  );
                }
              )}

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
                Principal and Vice Principal
                accounts can view NSS
                attendance records, volunteer
                information and event
                participation. Attendance
                marking, editing and deletion
                are restricted to authorized
                administrators.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  suffix = "",
  variant = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
  variant?:
    | "blue"
    | "green"
    | "red";
}) {
  const iconClass =
    variant === "green"
      ? "bg-green-50 text-green-600"
      : variant === "red"
      ? "bg-red-50 text-red-600"
      : "bg-blue-50 text-[#0F2B7B]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
          {suffix}
        </span>

      </div>

      <p className="mt-3 text-sm font-medium text-gray-500">
        {label}
      </p>

    </div>
  );
}

/* =========================================================
   SELECT FILTER
========================================================= */

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-gray-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0F2B7B] focus:bg-white"
      >

        <option value="all">
          All {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    normalizeStatus(status);

  const present =
    isPresent(status);

  const absent =
    isAbsent(status);

  if (present) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
        <CheckCircle2
          size={13}
        />
        Present
      </span>
    );
  }

  if (absent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
        <XCircle size={13} />
        Absent
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold capitalize text-gray-600">
      <ClipboardCheck
        size={13}
      />
      {normalized || "Unknown"}
    </span>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}