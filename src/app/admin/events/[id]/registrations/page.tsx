"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  event_time: string | null;
  event_type: string | null;
  location: string | null;
  registration_link: string | null;
  is_published: boolean | null;
  registration_open: boolean | null;
  registration_deadline: string | null;
}

interface Volunteer {
  id: string;
  full_name: string;
  roll_number: string;
  hall_ticket_number: string | null;
  department: string;
  course: string | null;
  year: string;
  semester: string | null;
  section: string | null;
  college_email: string;
  personal_email: string | null;
  mobile_number: string;
  whatsapp_number: string | null;
  nss_unit: string | null;
  volunteer_id: string | null;
  status: string | null;
}

interface Registration {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  registered_at: string;
  created_at: string;
  updated_at: string;

  volunteer: Volunteer | null;
}

/* =========================================================
   PAGE
========================================================= */

export default function EventRegistrationsPage() {
  const params = useParams();
  const router = useRouter();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const [event, setEvent] = useState<EventItem | null>(null);

  const [registrations, setRegistrations] = useState<
    Registration[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [exporting, setExporting] = useState<
    "pdf" | "excel" | null
  >(null);

  /* =======================================================
     ERROR MESSAGE
  ======================================================= */

  const getErrorMessage = (error: unknown) => {
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
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (value: string | null) => {
    if (!value) return "—";

    const date = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     FORMAT DATE TIME
  ======================================================= */

  const formatDateTime = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = (
    value: string | null
  ) => {
    if (!value) return "";

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    const hour = Number(parts[0]);

    if (Number.isNaN(hour)) {
      return value;
    }

    const minute = parts[1];

    const suffix =
      hour >= 12 ? "PM" : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
  };

  /* =======================================================
     LOAD EVENT
  ======================================================= */

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      throw new Error(
        "Event ID is missing."
      );
    }

    const {
      data,
      error: eventError,
    } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error(
        "Event loading error:",
        eventError
      );

      throw new Error(
        eventError.message ||
          eventError.details ||
          "Unable to load event."
      );
    }

    if (!data) {
      throw new Error(
        "Event not found."
      );
    }

    setEvent(data as EventItem);
  }, [eventId]);

  /* =======================================================
     LOAD REGISTRATIONS
  ======================================================= */

  const loadRegistrations =
    useCallback(async () => {
      if (!eventId) {
        throw new Error(
          "Event ID is missing."
        );
      }

      const {
        data,
        error: registrationsError,
      } = await supabase
        .from("event_registrations")
        .select(
          `
          id,
          event_id,
          volunteer_id,
          status,
          registered_at,
          created_at,
          updated_at,
          volunteer:volunteers (
            id,
            full_name,
            roll_number,
            hall_ticket_number,
            department,
            course,
            year,
            semester,
            section,
            college_email,
            personal_email,
            mobile_number,
            whatsapp_number,
            nss_unit,
            volunteer_id,
            status
          )
        `
        )
        .eq("event_id", eventId)
        .order("registered_at", {
          ascending: false,
        });

      if (registrationsError) {
        console.error(
          "Registrations loading error:",
          registrationsError
        );

        throw new Error(
          registrationsError.message ||
            registrationsError.details ||
            "Unable to load registrations."
        );
      }

      setRegistrations(
        (data ?? []) as unknown as Registration[]
      );
    }, [eventId]);

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      try {
        await Promise.all([
          loadEvent(),
          loadRegistrations(),
        ]);
      } catch (err) {
        console.error(
          "Registration page loading error:",
          err
        );

        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadEvent, loadRegistrations]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId, loadData]);

  /* =======================================================
     FILTERED REGISTRATIONS
  ======================================================= */

  const filteredRegistrations =
    useMemo(() => {
      const text =
        search.trim().toLowerCase();

      if (!text) {
        return registrations;
      }

      return registrations.filter(
        (registration) => {
          const volunteer =
            registration.volunteer;

          if (!volunteer) {
            return (
              registration.status
                ?.toLowerCase()
                .includes(text)
            );
          }

          const searchable = [
            volunteer.full_name,
            volunteer.roll_number,
            volunteer.hall_ticket_number,
            volunteer.department,
            volunteer.course,
            volunteer.year,
            volunteer.semester,
            volunteer.section,
            volunteer.college_email,
            volunteer.personal_email,
            volunteer.mobile_number,
            volunteer.whatsapp_number,
            volunteer.nss_unit,
            volunteer.volunteer_id,
            registration.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(text);
        }
      );
    }, [registrations, search]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalRegistrations =
    registrations.length;

  const confirmedRegistrations =
    registrations.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "registered"
    ).length;

  const cancelledRegistrations =
    registrations.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "cancelled"
    ).length;

  /* =======================================================
     EXCEL DOWNLOAD
  ======================================================= */

  const downloadExcel = () => {
    if (!event) return;

    if (registrations.length === 0) {
      setError(
        "There are no registered volunteers to download."
      );
      return;
    }

    setExporting("excel");
    setError("");
    setSuccess("");

    try {
      const rows =
        registrations.map(
          (registration, index) => {
            const volunteer =
              registration.volunteer;

            return {
              "S.No": index + 1,

              "Volunteer ID":
                volunteer?.volunteer_id ||
                "",

              "Full Name":
                volunteer?.full_name ||
                "Volunteer profile unavailable",

              "Roll Number":
                volunteer?.roll_number ||
                "",

              "Hall Ticket Number":
                volunteer?.hall_ticket_number ||
                "",

              Department:
                volunteer?.department ||
                "",

              Course:
                volunteer?.course ||
                "",

              Year:
                volunteer?.year ||
                "",

              Semester:
                volunteer?.semester ||
                "",

              Section:
                volunteer?.section ||
                "",

              "College Email":
                volunteer?.college_email ||
                "",

              "Personal Email":
                volunteer?.personal_email ||
                "",

              "Mobile Number":
                volunteer?.mobile_number ||
                "",

              "WhatsApp Number":
                volunteer?.whatsapp_number ||
                "",

              "NSS Unit":
                volunteer?.nss_unit ||
                "",

              "Registration Status":
                registration.status ||
                "",

              "Registered At":
                formatDateTime(
                  registration.registered_at
                ),
            };
          }
        );

      const worksheet =
        XLSX.utils.json_to_sheet(rows);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 18 },
        { wch: 30 },
        { wch: 18 },
        { wch: 20 },
        { wch: 24 },
        { wch: 24 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 34 },
        { wch: 34 },
        { wch: 18 },
        { wch: 18 },
        { wch: 15 },
        { wch: 20 },
        { wch: 24 },
      ];

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Registrations"
      );

      const safeTitle =
        event.title
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          )
          .toLowerCase() ||
        "event";

      XLSX.writeFile(
        workbook,
        `${safeTitle}-registrations.xlsx`
      );

      setSuccess(
        "Excel file downloaded successfully."
      );
    } catch (err) {
      console.error(
        "Excel export error:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setExporting(null);
    }
  };

  /* =======================================================
     PDF DOWNLOAD
  ======================================================= */

  const downloadPDF = () => {
    if (!event) return;

    if (registrations.length === 0) {
      setError(
        "There are no registered volunteers to download."
      );
      return;
    }

    setExporting("pdf");
    setError("");
    setSuccess("");

    try {
      const doc =
        new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      doc.setFontSize(18);

      doc.text(
        "NSS Event Registration List",
        pageWidth / 2,
        15,
        {
          align: "center",
        }
      );

      doc.setFontSize(13);

      doc.text(
        event.title,
        pageWidth / 2,
        23,
        {
          align: "center",
        }
      );

      doc.setFontSize(9);

      const eventDetails = [
        `Date: ${formatDate(
          event.event_date
        )}`,
        event.start_time
          ? `Time: ${formatTime(
              event.start_time
            )}`
          : event.event_time
          ? `Time: ${formatTime(
              event.event_time
            )}`
          : "",
        event.venue
          ? `Venue: ${event.venue}`
          : event.location
          ? `Venue: ${event.location}`
          : "",
        `Total Registrations: ${totalRegistrations}`,
      ]
        .filter(Boolean)
        .join("    |    ");

      doc.text(
        eventDetails,
        pageWidth / 2,
        30,
        {
          align: "center",
        }
      );

      const tableRows =
        registrations.map(
          (registration, index) => {
            const volunteer =
              registration.volunteer;

            return [
              index + 1,
              volunteer?.full_name ||
                "Profile unavailable",
              volunteer?.roll_number ||
                "—",
              volunteer?.department ||
                "—",
              volunteer?.year ||
                "—",
              volunteer?.college_email ||
                "—",
              volunteer?.mobile_number ||
                "—",
              registration.status ||
                "—",
              formatDateTime(
                registration.registered_at
              ),
            ];
          }
        );

      autoTable(doc, {
        startY: 36,

        head: [
          [
            "S.No",
            "Volunteer Name",
            "Roll Number",
            "Department",
            "Year",
            "College Email",
            "Mobile",
            "Status",
            "Registered At",
          ],
        ],

        body: tableRows,

        theme: "grid",

        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
        },

        headStyles: {
          fontSize: 7,
          fontStyle: "bold",
        },

        columnStyles: {
          0: {
            cellWidth: 10,
          },
          1: {
            cellWidth: 38,
          },
          2: {
            cellWidth: 25,
          },
          3: {
            cellWidth: 30,
          },
          4: {
            cellWidth: 15,
          },
          5: {
            cellWidth: 48,
          },
          6: {
            cellWidth: 27,
          },
          7: {
            cellWidth: 22,
          },
          8: {
            cellWidth: 35,
          },
        },
      });

      const safeTitle =
        event.title
          .replace(
            /[^a-z0-9]+/gi,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          )
          .toLowerCase() ||
        "event";

      doc.save(
        `${safeTitle}-registrations.pdf`
      );

      setSuccess(
        "PDF file downloaded successfully."
      );
    } catch (err) {
      console.error(
        "PDF export error:",
        err
      );

      setError(
        getErrorMessage(err)
      );
    } finally {
      setExporting(null);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <RefreshCw className="mx-auto h-10 w-10 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-sm font-semibold text-gray-500">
              Loading registrations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/events"
              )
            }
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Events
          </button>

          <button
            type="button"
            onClick={() =>
              loadData(true)
            }
            disabled={refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
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

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">

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
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">

            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />

              <p className="text-sm font-semibold">
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              <X className="h-5 w-5" />
            </button>

          </div>
        )}

        {/* =================================================
            EVENT HEADER
        ================================================= */}

        {event && (
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">

            <div className="flex flex-col lg:flex-row">

              {/* IMAGE */}

              <div className="h-56 w-full shrink-0 bg-slate-100 lg:h-auto lg:w-80">

                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-56 items-center justify-center text-[#0F2B7B]">
                    <CalendarDays className="h-16 w-16" />
                  </div>
                )}

              </div>

              {/* DETAILS */}

              <div className="flex-1 p-6 sm:p-8">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#0F2B7B]">
                    {event.event_type ||
                      "Event"}
                  </span>

                  {event.is_published && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Published
                    </span>
                  )}

                  {event.registration_open ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Registration Open
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      Registration Closed
                    </span>
                  )}

                </div>

                <h1 className="mt-3 text-3xl font-bold text-[#0F2B7B]">
                  {event.title}
                </h1>

                {event.description && (
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-gray-500">
                    {event.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">

                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#0F2B7B]" />

                    {formatDate(
                      event.event_date
                    )}
                  </span>

                  {(event.start_time ||
                    event.event_time) && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-gray-400" />

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

                  {(event.venue ||
                    event.location) && (
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />

                      {event.venue ||
                        event.location}
                    </span>
                  )}

                </div>

                {event.registration_deadline && (
                  <p className="mt-4 text-sm font-semibold text-gray-500">
                    Registration deadline:{" "}
                    {formatDateTime(
                      event.registration_deadline
                    )}
                  </p>
                )}

              </div>

            </div>
          </section>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0F2B7B]">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Registrations
                </p>

                <p className="text-2xl font-bold text-[#0F2B7B]">
                  {totalRegistrations}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <CheckCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Registered
                </p>

                <p className="text-2xl font-bold text-green-700">
                  {confirmedRegistrations}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <X className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Cancelled
                </p>

                <p className="text-2xl font-bold text-red-700">
                  {cancelledRegistrations}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* =================================================
            REGISTRATION MANAGEMENT
        ================================================= */}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">

          {/* HEADER */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-[#0F2B7B]">
                  Registered Volunteers
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View and download volunteers registered for this event.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={
                    downloadExcel
                  }
                  disabled={
                    exporting !== null ||
                    registrations.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exporting ===
                  "excel" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}

                  Download Excel
                </button>

                <button
                  type="button"
                  onClick={
                    downloadPDF
                  }
                  disabled={
                    exporting !== null ||
                    registrations.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exporting ===
                  "pdf" ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}

                  Download PDF
                </button>

              </div>

            </div>

            {/* SEARCH */}

            <div className="mt-5 relative max-w-xl">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search by name, roll number, department, email..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredRegistrations.length ===
          0 ? (
            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                {registrations.length ===
                0
                  ? "No registrations yet"
                  : "No matching volunteers"}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {registrations.length ===
                0
                  ? "Volunteers who register for this event will appear here."
                  : "Try a different search term."}
              </p>

            </div>
          ) : (

            /* =================================================
               DESKTOP TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px]">

                <thead className="bg-slate-50">

                  <tr className="border-b border-slate-200 text-left">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      #
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Volunteer
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Academic
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Registered
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  {filteredRegistrations.map(
                    (
                      registration,
                      index
                    ) => {
                      const volunteer =
                        registration.volunteer;

                      return (
                        <tr
                          key={
                            registration.id
                          }
                          className="transition hover:bg-slate-50"
                        >

                          {/* NUMBER */}

                          <td className="px-5 py-5 align-top text-sm font-bold text-gray-500">
                            {index + 1}
                          </td>

                          {/* VOLUNTEER */}

                          <td className="px-5 py-5 align-top">

                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-[#0F2B7B]">
                                {volunteer?.full_name
                                  ?.charAt(
                                    0
                                  )
                                  .toUpperCase() ||
                                  "V"}
                              </div>

                              <div>
                                <p className="font-bold text-gray-900">
                                  {volunteer?.full_name ||
                                    "Volunteer profile unavailable"}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  Roll No:{" "}
                                  {volunteer?.roll_number ||
                                    "—"}
                                </p>

                                {volunteer?.volunteer_id && (
                                  <p className="mt-1 text-xs text-gray-400">
                                    Volunteer ID:{" "}
                                    {
                                      volunteer.volunteer_id
                                    }
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* ACADEMIC */}

                          <td className="px-5 py-5 align-top">

                            <p className="font-semibold text-gray-800">
                              {volunteer?.department ||
                                "—"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {[
                                volunteer?.course,
                                volunteer?.year
                                  ? `Year ${volunteer.year}`
                                  : null,
                                volunteer?.semester
                                  ? `Sem ${volunteer.semester}`
                                  : null,
                                volunteer?.section
                                  ? `Sec ${volunteer.section}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(
                                  " • "
                                ) ||
                                "—"}
                            </p>

                          </td>

                          {/* CONTACT */}

                          <td className="px-5 py-5 align-top">

                            <div className="space-y-2">

                              {volunteer?.college_email && (
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4 shrink-0 text-[#0F2B7B]" />

                                  {volunteer.college_email}
                                </p>
                              )}

                              {volunteer?.mobile_number && (
                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />

                                  {volunteer.mobile_number}
                                </p>
                              )}

                            </div>

                          </td>

                          {/* REGISTERED */}

                          <td className="px-5 py-5 align-top">

                            <p className="text-sm font-semibold text-gray-800">
                              {formatDateTime(
                                registration.registered_at
                              )}
                            </p>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5 align-top">

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                                registration.status
                                  ?.toLowerCase() ===
                                "registered"
                                  ? "bg-green-100 text-green-700"
                                  : registration.status
                                      ?.toLowerCase() ===
                                    "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-gray-700"
                              }`}
                            >
                              {registration.status ||
                                "Unknown"}
                            </span>

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

        {/* =================================================
            DOWNLOAD INFO
        ================================================= */}

        {registrations.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">
              <Download className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-bold">
                  Registration data
                </p>

                <p className="mt-1 text-blue-800">
                  The downloaded files contain the registered volunteer information currently stored in the database.
                </p>
              </div>
            </div>

            <p className="shrink-0 font-bold">
              {filteredRegistrations.length}{" "}
              shown /{" "}
              {registrations.length}{" "}
              total
            </p>

          </div>
        )}

      </div>
    </div>
  );
}