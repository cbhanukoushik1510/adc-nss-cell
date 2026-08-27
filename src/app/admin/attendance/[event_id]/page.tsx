"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  RefreshCw,
  Search,
  Users,
  Clock,
  Mail,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

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
  status: "open" | "closed";
}

interface Volunteer {
  id: string;
  full_name: string;
  roll_number: string;
  college_email: string;
  mobile_number: string;
  department: string;
  course: string | null;
  year: string;
  role: string | null;
  volunteer_id: string | null;
}

interface AttendanceRecord {
  id: string;
  attendance_event_id: string;
  volunteer_id: string;
  scanned_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  volunteer: Volunteer | null;
}

/* ============================================================
   UUID VALIDATION
============================================================ */

const isValidUUID = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

export default function AttendanceRecordsPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] =
    useState<AttendanceEvent | null>(null);

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  const [exportingExcel, setExportingExcel] =
    useState(false);

  const [exportingPdf, setExportingPdf] =
    useState(false);

  /* ============================================================
     GET EVENT ID
  ============================================================ */

  const eventId = useMemo(() => {
    const value = params?.event_id;

    if (typeof value === "string") {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value[0]?.trim() || "";
    }

    return "";
  }, [params]);

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  const formatDate = useCallback(
    (value: string) => {
      if (!value) return "—";

      const date = new Date(`${value}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    },
    []
  );

  /* ============================================================
     FORMAT TIME
  ============================================================ */

  const formatTime = useCallback(
    (value: string | null) => {
      if (!value) return "";

      const [hours, minutes] =
        value.slice(0, 5).split(":");

      const date = new Date();

      date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
      );

      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    },
    []
  );

  /* ============================================================
     FORMAT SCANNED TIME
  ============================================================ */

  const formatScannedAt = useCallback(
    (value: string) => {
      if (!value) return "—";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    },
    []
  );

  /* ============================================================
     LOAD ATTENDANCE
  ============================================================ */

  const loadAttendance = useCallback(
    async (refresh = false) => {
      if (!eventId) {
        setError(
          "No attendance event ID was provided in the URL."
        );

        setEvent(null);
        setRecords([]);
        setLoading(false);
        return;
      }

      if (!isValidUUID(eventId)) {
        console.error(
          "Invalid attendance event ID:",
          eventId
        );

        setError(
          "Invalid attendance event URL. The event ID is not a valid UUID."
        );

        setEvent(null);
        setRecords([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /* ======================================================
           LOAD EVENT
        ====================================================== */

        const {
          data: eventData,
          error: eventError,
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
            status
          `)
          .eq("id", eventId)
          .maybeSingle();

        if (eventError) {
          console.error(
            "Attendance event error:",
            eventError
          );

          throw new Error(
            eventError.message ||
              "Unable to load attendance event."
          );
        }

        if (!eventData) {
          throw new Error(
            "Attendance event could not be found."
          );
        }

        setEvent(
          eventData as AttendanceEvent
        );

        /* ======================================================
           LOAD ATTENDANCE RECORDS
        ====================================================== */

        const {
          data: attendanceData,
          error: attendanceError,
        } = await supabase
          .from("attendance_records")
          .select(`
            id,
            attendance_event_id,
            volunteer_id,
            scanned_at,
            status,
            notes,
            created_at,
            updated_at,
            volunteer:volunteers (
              id,
              full_name,
              roll_number,
              college_email,
              mobile_number,
              department,
              course,
              year,
              role,
              volunteer_id
            )
          `)
          .eq(
            "attendance_event_id",
            eventId
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

        /* ======================================================
           NORMALIZE RELATION
        ====================================================== */

        const formattedRecords: AttendanceRecord[] =
          (attendanceData || []).map(
            (record: any) => ({
              id: record.id,
              attendance_event_id:
                record.attendance_event_id,
              volunteer_id:
                record.volunteer_id,
              scanned_at:
                record.scanned_at,
              status:
                record.status,
              notes:
                record.notes,
              created_at:
                record.created_at,
              updated_at:
                record.updated_at,
              volunteer:
                Array.isArray(record.volunteer)
                  ? record.volunteer[0] || null
                  : record.volunteer || null,
            })
          );

        setRecords(formattedRecords);
      } catch (err) {
        console.error(
          "Attendance loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load attendance records."
        );

        setRecords([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId]
  );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  /* ============================================================
     SEARCH FILTER
  ============================================================ */

  const filteredRecords = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return records;
    }

    return records.filter((record) => {
      const volunteer =
        record.volunteer;

      if (!volunteer) {
        return record.status
          .toLowerCase()
          .includes(text);
      }

      return [
        volunteer.full_name,
        volunteer.roll_number,
        volunteer.college_email,
        volunteer.mobile_number,
        volunteer.department,
        volunteer.course,
        volunteer.year,
        volunteer.role,
        volunteer.volunteer_id,
        record.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text);
    });
  }, [records, search]);

  /* ============================================================
     PRESENT COUNT
  ============================================================ */

  const presentCount = useMemo(() => {
    return records.filter(
      (record) =>
        record.status.toLowerCase() ===
        "present"
    ).length;
  }, [records]);

  /* ============================================================
     SAFE EXCEL CELL
  ============================================================ */

  const escapeExcel = (value: unknown) => {
    const text =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    return `"${text.replace(/"/g, '""')}"`;
  };

  /* ============================================================
     DOWNLOAD EXCEL
  ============================================================ */

  const downloadExcel = useCallback(() => {
    if (!event || records.length === 0) {
      return;
    }

    setExportingExcel(true);

    try {
      const rows = records.map(
        (record, index) => {
          const volunteer =
            record.volunteer;

          return [
            index + 1,
            volunteer?.volunteer_id || "",
            volunteer?.full_name || "",
            volunteer?.roll_number || "",
            volunteer?.department || "",
            volunteer?.course || "",
            volunteer?.year || "",
            volunteer?.college_email || "",
            volunteer?.mobile_number || "",
            volunteer?.role || "",
            formatScannedAt(
              record.scanned_at
            ),
            record.status
              .toUpperCase(),
            record.notes || "",
          ];
        }
      );

      const headers = [
        "S.No",
        "Volunteer ID",
        "Full Name",
        "Roll Number",
        "Department",
        "Course",
        "Year",
        "College Email",
        "Mobile Number",
        "Role",
        "Marked At",
        "Status",
        "Notes",
      ];

      const eventInfo = [
        ["NSS ATTENDANCE REPORT"],
        ["Event", event.title],
        [
          "Date",
          formatDate(event.event_date),
        ],
        [
          "Time",
          `${event.start_time ? formatTime(event.start_time) : ""}${
            event.end_time
              ? ` - ${formatTime(event.end_time)}`
              : ""
          }`,
        ],
        [
          "Venue",
          event.venue || "",
        ],
        [
          "Total Present",
          presentCount,
        ],
        ["Total Records", records.length],
        [],
      ];

      const worksheetRows = [
        ...eventInfo,
        headers,
        ...rows,
      ];

      const worksheet = worksheetRows
        .map((row) =>
          row
            .map((cell) =>
              escapeExcel(cell)
            )
            .join("\t")
        )
        .join("\n");

      const blob = new Blob(
        [
          "\ufeff",
          worksheet,
        ],
        {
          type: "application/vnd.ms-excel;charset=utf-8;",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      const safeTitle =
        event.title
          .replace(
            /[^a-z0-9]/gi,
            "_"
          )
          .replace(
            /_+/g,
            "_"
          )
          .slice(0, 80);

      link.href = url;

      link.download =
        `Attendance_${safeTitle || "Event"}.xls`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Excel export error:",
        err
      );

      setError(
        "Unable to download the Excel attendance report."
      );
    } finally {
      setExportingExcel(false);
    }
  }, [
    event,
    records,
    presentCount,
    formatDate,
    formatTime,
    formatScannedAt,
  ]);

  /* ============================================================
     DOWNLOAD PDF
  ============================================================ */

  const downloadPDF = useCallback(
    async () => {
      if (!event || records.length === 0) {
        return;
      }

      setExportingPdf(true);

      try {
        const jsPDFModule =
          await import("jspdf");

        const autoTableModule =
          await import(
            "jspdf-autotable"
          );

        const jsPDF =
          jsPDFModule.default;

        const autoTable =
          autoTableModule.default;

        const doc =
          new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });

        /* ======================================================
           TITLE
        ====================================================== */

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");

        doc.text(
          "NSS Attendance Report",
          14,
          15
        );

        /* ======================================================
           EVENT DETAILS
        ====================================================== */

        doc.setFontSize(10);
        doc.setFont(
          "helvetica",
          "normal"
        );

        let currentY = 23;

        doc.text(
          `Event: ${event.title}`,
          14,
          currentY
        );

        currentY += 6;

        doc.text(
          `Date: ${formatDate(event.event_date)}`,
          14,
          currentY
        );

        currentY += 6;

        const eventTime =
          `${event.start_time ? formatTime(event.start_time) : ""}${
            event.end_time
              ? ` - ${formatTime(event.end_time)}`
              : ""
          }`;

        doc.text(
          `Time: ${eventTime || "Not specified"}`,
          14,
          currentY
        );

        currentY += 6;

        doc.text(
          `Venue: ${event.venue || "Not specified"}`,
          14,
          currentY
        );

        currentY += 6;

        doc.text(
          `Total Present: ${presentCount}    Total Records: ${records.length}`,
          14,
          currentY
        );

        currentY += 5;

        /* ======================================================
           TABLE
        ====================================================== */

        const tableRows =
          records.map(
            (record, index) => {
              const volunteer =
                record.volunteer;

              return [
                String(index + 1),
                volunteer?.volunteer_id ||
                  "—",
                volunteer?.full_name ||
                  "—",
                volunteer?.roll_number ||
                  "—",
                volunteer?.department ||
                  "—",
                volunteer?.course ||
                  "—",
                volunteer?.year ||
                  "—",
                volunteer?.college_email ||
                  "—",
                formatScannedAt(
                  record.scanned_at
                ),
                record.status
                  .toUpperCase(),
              ];
            }
          );

        autoTable(
          doc,
          {
            startY: currentY + 3,
            head: [
              [
                "S.No",
                "Volunteer ID",
                "Name",
                "Roll No.",
                "Department",
                "Course",
                "Year",
                "Email",
                "Marked At",
                "Status",
              ],
            ],
            body: tableRows,
            styles: {
              fontSize: 7,
              cellPadding: 2,
              overflow: "linebreak",
            },
            headStyles: {
              fontStyle: "bold",
            },
            margin: {
              left: 10,
              right: 10,
            },
            didDrawPage: () => {
              const pageNumber =
                doc.getNumberOfPages();

              doc.setFontSize(8);

              doc.text(
                `NSS Attendance • Page ${pageNumber}`,
                14,
                205
              );
            },
          }
        );

        /* ======================================================
           SAVE
        ====================================================== */

        const safeTitle =
          event.title
            .replace(
              /[^a-z0-9]/gi,
              "_"
            )
            .replace(
              /_+/g,
              "_"
            )
            .slice(0, 80);

        doc.save(
          `Attendance_${safeTitle || "Event"}.pdf`
        );
      } catch (err) {
        console.error(
          "PDF export error:",
          err
        );

        setError(
          "Unable to download the PDF attendance report. Make sure jspdf and jspdf-autotable are installed."
        );
      } finally {
        setExportingPdf(false);
      }
    },
    [
      event,
      records,
      presentCount,
      formatDate,
      formatTime,
      formatScannedAt,
    ]
  );

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/attendance"
                )
              }
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-gray-600 shadow-sm transition hover:bg-slate-50"
              title="Back to Attendance"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <Users className="h-6 w-6" />
            </div>

            <div className="min-w-0">

              <h1 className="text-2xl font-bold text-[#0F2B7B] sm:text-3xl">
                Attendance Records
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View volunteers who marked attendance for this event.
              </p>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* EXCEL */}

            <button
              type="button"
              onClick={downloadExcel}
              disabled={
                exportingExcel ||
                loading ||
                records.length === 0 ||
                !event
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingExcel ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}

              {exportingExcel
                ? "Exporting..."
                : "Download Excel"}
            </button>

            {/* PDF */}

            <button
              type="button"
              onClick={downloadPDF}
              disabled={
                exportingPdf ||
                loading ||
                records.length === 0 ||
                !event
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingPdf ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}

              {exportingPdf
                ? "Generating..."
                : "Download PDF"}
            </button>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadAttendance(true)
              }
              disabled={
                refreshing ||
                !isValidUUID(eventId)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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

          </div>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

              <div className="min-w-0">

                <h2 className="font-bold text-red-800">
                  Unable to Load Attendance
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                {!isValidUUID(eventId) && (
                  <div className="mt-4 rounded-xl bg-white/70 p-3">

                    <p className="text-xs font-bold uppercase tracking-wide text-red-500">
                      Current URL Event ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-red-700">
                      {eventId || "Missing"}
                    </p>

                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/attendance"
                    )
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#143a96]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Attendance
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================
            EVENT INFORMATION
        ====================================================== */}

        {event && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">

            <div className="bg-[#0F2B7B] px-6 py-6 text-white">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="min-w-0">

                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Attendance Event
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {event.title}
                  </h2>

                  {event.description && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                      {event.description}
                    </p>
                  )}

                </div>

                {event.status === "open" ? (
                  <span className="inline-flex w-fit shrink-0 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                    OPEN
                  </span>
                ) : (
                  <span className="inline-flex w-fit shrink-0 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                    CLOSED
                  </span>
                )}

              </div>

            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

              {/* DATE */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-2">

                  <CalendarCheck className="h-5 w-5 text-[#0F2B7B]" />

                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Date
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold text-gray-800">
                  {formatDate(
                    event.event_date
                  )}
                </p>

              </div>

              {/* TIME */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-2">

                  <Clock className="h-5 w-5 text-[#0F2B7B]" />

                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Time
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold text-gray-800">

                  {event.start_time
                    ? formatTime(
                        event.start_time
                      )
                    : "Not specified"}

                  {event.end_time &&
                    ` - ${formatTime(
                      event.end_time
                    )}`}

                </p>

              </div>

              {/* PRESENT */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-2">

                  <Users className="h-5 w-5 text-[#0F2B7B]" />

                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Total Present
                  </p>

                </div>

                <p className="mt-2 text-2xl font-bold text-[#0F2B7B]">
                  {presentCount}
                </p>

              </div>

              {/* RECORDS */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="h-5 w-5 text-green-600" />

                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    Records
                  </p>

                </div>

                <p className="mt-2 text-2xl font-bold text-gray-800">
                  {records.length}
                </p>

              </div>

            </div>

          </section>
        )}

        {/* ======================================================
            SEARCH
        ====================================================== */}

        {event && (
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative w-full max-w-xl">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search volunteer, roll number, department..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">

                <Download className="h-4 w-4" />

                <span>
                  Downloads include all attendance records for this event.
                </span>

              </div>

            </div>

          </section>
        )}

        {/* ======================================================
            ATTENDANCE TABLE
        ====================================================== */}

        {event && (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

            <div className="border-b border-slate-200 p-5">

              <h2 className="text-xl font-bold text-[#0F2B7B]">
                Volunteer Attendance
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredRecords.length} attendance record
                {filteredRecords.length === 1
                  ? ""
                  : "s"} found.
              </p>

            </div>

            {loading ? (
              <div className="p-14 text-center">

                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

                <p className="mt-4 text-sm text-gray-500">
                  Loading attendance records...
                </p>

              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-14 text-center">

                <Users className="mx-auto h-12 w-12 text-gray-300" />

                <h3 className="mt-4 text-lg font-bold text-gray-800">
                  No attendance records
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {search
                    ? "No volunteers match your search."
                    : "No volunteers have marked attendance for this event yet."}
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Volunteer
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Roll Number
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Department
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Course / Year
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Marked At
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredRecords.map(
                      (record) => {
                        const volunteer =
                          record.volunteer;

                        return (
                          <tr
                            key={record.id}
                            className="transition hover:bg-slate-50"
                          >

                            {/* VOLUNTEER */}

                            <td className="px-5 py-5">

                              {volunteer ? (
                                <div className="flex items-center gap-3">

                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0F2B7B]">
                                    {volunteer.full_name
                                      ?.charAt(0)
                                      .toUpperCase() ||
                                      "V"}
                                  </div>

                                  <div className="min-w-0">

                                    <p className="font-bold text-gray-900">
                                      {
                                        volunteer.full_name
                                      }
                                    </p>

                                    {volunteer.volunteer_id && (
                                      <p className="mt-1 text-xs text-gray-400">
                                        ID:{" "}
                                        {
                                          volunteer.volunteer_id
                                        }
                                      </p>
                                    )}

                                  </div>

                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  Volunteer profile unavailable
                                </span>
                              )}

                            </td>

                            {/* ROLL */}

                            <td className="px-5 py-5">

                              <span className="font-semibold text-gray-800">
                                {volunteer?.roll_number ||
                                  "—"}
                              </span>

                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-5 py-5">

                              <span className="text-sm font-semibold text-gray-700">
                                {volunteer?.department ||
                                  "—"}
                              </span>

                            </td>

                            {/* COURSE / YEAR */}

                            <td className="px-5 py-5">

                              <div className="flex items-start gap-2">

                                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                                <div>

                                  <p className="text-sm font-semibold text-gray-800">
                                    {volunteer?.course ||
                                      "—"}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    Year{" "}
                                    {volunteer?.year ||
                                      "—"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* EMAIL */}

                            <td className="px-5 py-5">

                              {volunteer?.college_email ? (
                                <div className="flex items-center gap-2">

                                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />

                                  <span className="max-w-[220px] truncate text-sm text-gray-700">
                                    {
                                      volunteer.college_email
                                    }
                                  </span>

                                </div>
                              ) : (
                                "—"
                              )}

                            </td>

                            {/* MARKED AT */}

                            <td className="px-5 py-5">

                              <div className="flex items-center gap-2">

                                <Clock className="h-4 w-4 shrink-0 text-gray-400" />

                                <span className="text-sm font-semibold text-gray-700">
                                  {formatScannedAt(
                                    record.scanned_at
                                  )}
                                </span>

                              </div>

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-5">

                              {record.status.toLowerCase() ===
                              "present" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">

                                  <CheckCircle2 className="h-3.5 w-3.5" />

                                  PRESENT

                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase text-gray-600">
                                  {
                                    record.status
                                  }
                                </span>
                              )}

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

      </div>
    </AdminDashboardLayout>
  );
}