"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Download,
  Eye,
  FileDown,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
};

type EventRegistration = {
  id: string;
  event_id: string;
  volunteer_id: string;
  status: string;
  registered_at: string;
  created_at: string;
  updated_at: string;
};

type Volunteer = {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  volunteer_id: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  section: string | null;
  academic_year: string | null;
  nss_unit: string | null;
  email: string | null;
  mobile: string | null;
  phone: string | null;
  photo_url: string | null;
};

type RegistrationRow = {
  registration: EventRegistration;
  event: Event | null;
  volunteer: Volunteer | null;
};

type EventSummary = {
  event: Event;
  total: number;
  registered: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
};

/* =========================================================
   HELPERS
========================================================= */

function normalize(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string | null | undefined
): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(
  value: string | null | undefined
): string {
  if (!value) return "—";

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function statusLabel(
  status: string | null | undefined
): string {
  const value = normalize(status);

  if (value === "registered") return "Registered";
  if (value === "approved") return "Approved";
  if (value === "pending") return "Pending";
  if (value === "rejected") return "Rejected";

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "Cancelled";
  }

  return status || "Unknown";
}

function statusClass(
  status: string | null | undefined
): string {
  const value = normalize(status);

  if (value === "registered") {
    return "bg-blue-50 text-blue-700";
  }

  if (value === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "pending") {
    return "bg-amber-50 text-amber-700";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-slate-100 text-slate-600";
}

function getInitials(
  name: string | null | undefined
): string {
  if (!name) return "V";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Avatar({
  volunteer,
  large = false,
}: {
  volunteer: Volunteer | null;
  large?: boolean;
}) {
  const size = large
    ? "h-16 w-16"
    : "h-10 w-10";

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
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#12358f] font-bold text-white`}
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
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
          {icon}
        </div>

        <div>
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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#12358f] focus:ring-2 focus:ring-[#12358f]/10"
      >
        <option value="">All</option>

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

function EventStat({
  value,
  label,
  type,
}: {
  value: number;
  label: string;
  type:
    | "registered"
    | "approved"
    | "pending"
    | "rejected";
}) {
  const classes = {
    registered: "text-blue-600",
    approved: "text-emerald-600",
    pending: "text-amber-600",
    rejected: "text-red-600",
  };

  return (
    <div className="border-r border-slate-100 p-4 text-center last:border-r-0">
      <p
        className={`font-serif text-xl font-bold ${classes[type]}`}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PDF
========================================================= */

async function getPDF() {
  const module = await import("jspdf");
  return module.jsPDF;
}

async function downloadRegistrationPDF(
  row: RegistrationRow
) {
  if (!row.event || !row.volunteer) {
    throw new Error(
      "Event or volunteer information is unavailable."
    );
  }

  const jsPDF = await getPDF();

  const pdf = new jsPDF();

  const event = row.event;
  const volunteer = row.volunteer;
  const registration = row.registration;

  let y = 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "NSS EVENT REGISTRATION",
    105,
    y,
    { align: "center" }
  );

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.text(
    "Program Officer Registration Record",
    105,
    y,
    { align: "center" }
  );

  y += 15;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);

  pdf.text(
    "Event Details",
    15,
    y
  );

  y += 8;

  const eventDetails = [
    ["Event", event.title],
    ["Date", formatDate(event.event_date)],
    [
      "Time",
      event.start_time
        ? `${formatTime(event.start_time)}${
            event.end_time
              ? ` - ${formatTime(event.end_time)}`
              : ""
          }`
        : "—",
    ],
    ["Venue", event.venue || "—"],
    [
      "Event Status",
      statusLabel(event.status),
    ],
  ];

  pdf.setFontSize(10);

  eventDetails.forEach(
    ([label, value]) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 15, y);

      pdf.setFont("helvetica", "normal");

      const lines =
        pdf.splitTextToSize(
          String(value || "—"),
          135
        );

      pdf.text(lines, 55, y);

      y += Math.max(
        7,
        lines.length * 5
      );
    }
  );

  y += 7;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);

  pdf.text(
    "Volunteer Details",
    15,
    y
  );

  y += 8;

  const volunteerDetails = [
    [
      "Full Name",
      volunteer.full_name || "—",
    ],
    [
      "Volunteer ID",
      volunteer.volunteer_id || "—",
    ],
    [
      "Roll Number",
      volunteer.roll_number || "—",
    ],
    [
      "Department",
      volunteer.department || "—",
    ],
    [
      "Course",
      volunteer.course || "—",
    ],
    [
      "Year",
      volunteer.year || "—",
    ],
    [
      "Section",
      volunteer.section || "—",
    ],
    [
      "Academic Year",
      volunteer.academic_year || "—",
    ],
    [
      "NSS Unit",
      volunteer.nss_unit || "—",
    ],
    [
      "Email",
      volunteer.email || "—",
    ],
    [
      "Mobile",
      volunteer.mobile ||
        volunteer.phone ||
        "—",
    ],
  ];

  pdf.setFontSize(10);

  volunteerDetails.forEach(
    ([label, value]) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 15, y);

      pdf.setFont("helvetica", "normal");

      const lines =
        pdf.splitTextToSize(
          String(value || "—"),
          135
        );

      pdf.text(lines, 55, y);

      y += Math.max(
        7,
        lines.length * 5
      );

      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    }
  );

  y += 7;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);

  pdf.text(
    "Registration Details",
    15,
    y
  );

  y += 8;

  const registrationDetails = [
    [
      "Status",
      statusLabel(registration.status),
    ],
    [
      "Registered At",
      formatDateTime(
        registration.registered_at
      ),
    ],
    [
      "Registration ID",
      registration.id,
    ],
    [
      "Last Updated",
      formatDateTime(
        registration.updated_at
      ),
    ],
  ];

  pdf.setFontSize(10);

  registrationDetails.forEach(
    ([label, value]) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${label}:`, 15, y);

      pdf.setFont("helvetica", "normal");

      const lines =
        pdf.splitTextToSize(
          String(value || "—"),
          135
        );

      pdf.text(lines, 55, y);

      y += Math.max(
        7,
        lines.length * 5
      );
    }
  );

  y += 15;

  pdf.setFontSize(8);
  pdf.setTextColor(
    100,
    100,
    100
  );

  pdf.text(
    `Generated from NSS Digital Management Portal • ${formatDateTime(
      new Date().toISOString()
    )}`,
    15,
    y
  );

  const safeName = (
    volunteer.full_name ||
    "volunteer"
  )
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  pdf.save(
    `registration-${safeName || "volunteer"}.pdf`
  );
}

async function downloadEventRegistrationsPDF(
  event: Event,
  rows: RegistrationRow[]
) {
  const jsPDF = await getPDF();

  const pdf = new jsPDF({
    orientation: "landscape",
  });

  let y = 18;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);

  pdf.text(
    "NSS EVENT REGISTRATION REPORT",
    148,
    y,
    { align: "center" }
  );

  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    event.title,
    148,
    y,
    { align: "center" }
  );

  y += 6;

  pdf.text(
    `${formatDate(event.event_date)}${
      event.venue
        ? ` • ${event.venue}`
        : ""
    }`,
    148,
    y,
    { align: "center" }
  );

  y += 14;

  const columns = [
    "S.No",
    "Volunteer",
    "Roll Number",
    "Department",
    "Year",
    "Section",
    "NSS Unit",
    "Status",
    "Registered At",
  ];

  const xPositions = [
    10,
    22,
    70,
    105,
    155,
    175,
    192,
    220,
    245,
  ];

  const drawHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    columns.forEach(
      (column, index) => {
        pdf.text(
          column,
          xPositions[index],
          y
        );
      }
    );

    y += 6;

    pdf.setFont("helvetica", "normal");
  };

  drawHeader();

  rows.forEach(
    (row, index) => {
      if (y > 190) {
        pdf.addPage("landscape");
        y = 18;
        drawHeader();
      }

      const volunteer =
        row.volunteer;

      const values = [
        String(index + 1),
        volunteer?.full_name ||
          "—",
        volunteer?.roll_number ||
          "—",
        volunteer?.department ||
          "—",
        volunteer?.year ||
          "—",
        volunteer?.section ||
          "—",
        volunteer?.nss_unit ||
          "—",
        statusLabel(
          row.registration.status
        ),
        formatDateTime(
          row.registration
            .registered_at
        ),
      ];

      values.forEach(
        (value, valueIndex) => {
          const maxWidth =
            valueIndex === 1
              ? 42
              : 28;

          const lines =
            pdf.splitTextToSize(
              String(value),
              maxWidth
            );

          pdf.text(
            lines[0] || "—",
            xPositions[valueIndex],
            y
          );
        }
      );

      y += 6;
    }
  );

  y += 8;

  pdf.setFontSize(8);
  pdf.setTextColor(
    100,
    100,
    100
  );

  pdf.text(
    `Total registrations: ${rows.length}`,
    10,
    y
  );

  pdf.text(
    `Generated: ${formatDateTime(
      new Date().toISOString()
    )}`,
    245,
    y,
    { align: "right" }
  );

  const safeName = event.title
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  pdf.save(
    `${safeName || "event"}-registrations.pdf`
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PORegistrationsPage() {
  const [
    events,
    setEvents,
  ] = useState<Event[]>([]);

  const [
    registrations,
    setRegistrations,
  ] = useState<EventRegistration[]>(
    []
  );

  const [
    volunteers,
    setVolunteers,
  ] = useState<Volunteer[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    eventStatus,
    setEventStatus,
  ] = useState("");

  const [
    selectedEventId,
    setSelectedEventId,
  ] = useState<string | null>(
    null
  );

  const [
    studentSearch,
    setStudentSearch,
  ] = useState("");

  const [
    department,
    setDepartment,
  ] = useState("");

  const [
    year,
    setYear,
  ] = useState("");

  const [
    section,
    setSection,
  ] = useState("");

  const [
    nssUnit,
    setNssUnit,
  ] = useState("");

  const [
    registrationStatus,
    setRegistrationStatus,
  ] = useState("");

  const [
    selectedRegistration,
    setSelectedRegistration,
  ] = useState<RegistrationRow | null>(
    null
  );

  const [
    pdfLoading,
    setPdfLoading,
  ] = useState(false);

  /* =======================================================
     LOAD REAL DATABASE DATA
  ======================================================= */

  const loadData = useCallback(
    async (
      showPageLoader = true
    ) => {
      try {
        if (showPageLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        /*
         * IMPORTANT:
         *
         * Do NOT use Supabase nested relationships here.
         *
         * We load:
         * 1. event_registrations
         * 2. events
         * 3. volunteers
         *
         * separately and join them in JavaScript.
         */

        const [
          registrationsResult,
          eventsResult,
          volunteersResult,
        ] = await Promise.all([
          supabase
            .from("event_registrations")
            .select(
              `
                id,
                event_id,
                volunteer_id,
                status,
                registered_at,
                created_at,
                updated_at
              `
            )
            .order(
              "registered_at",
              {
                ascending: false,
              }
            ),

          supabase
            .from("events")
            .select("*")
            .order(
              "created_at",
              {
                ascending: false,
              }
            ),

          supabase
            .from("volunteers")
            .select("*"),
        ]);

        if (
          registrationsResult.error
        ) {
          throw registrationsResult.error;
        }

        if (eventsResult.error) {
          throw eventsResult.error;
        }

        if (
          volunteersResult.error
        ) {
          throw volunteersResult.error;
        }

        const registrationData =
          (registrationsResult.data ||
            []) as EventRegistration[];

        const eventData =
          (eventsResult.data ||
            []) as Event[];

        const volunteerData =
          (volunteersResult.data ||
            []) as Volunteer[];

        setRegistrations(
          registrationData
        );

        setEvents(eventData);

        setVolunteers(
          volunteerData
        );
      } catch (err: any) {
        console.error(
          "PO registrations error:",
          {
            message: err?.message,
            details: err?.details,
            hint: err?.hint,
            code: err?.code,
          }
        );

        setError(
          err?.message ||
            "Unable to load event registration data."
        );

        setRegistrations([]);
        setEvents([]);
        setVolunteers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  /* =======================================================
     LOOKUP MAPS
  ======================================================= */

  const eventMap = useMemo(() => {
    const map =
      new Map<string, Event>();

    events.forEach((event) => {
      map.set(event.id, event);
    });

    return map;
  }, [events]);

  const volunteerMap = useMemo(() => {
    const map =
      new Map<string, Volunteer>();

    volunteers.forEach(
      (volunteer) => {
        map.set(
          volunteer.id,
          volunteer
        );
      }
    );

    return map;
  }, [volunteers]);

  /* =======================================================
     EVENT SUMMARIES
  ======================================================= */

  const eventSummaries =
    useMemo<EventSummary[]>(() => {
      return events
        .map((event) => {
          const eventRows =
            registrations.filter(
              (registration) =>
                registration.event_id ===
                event.id
            );

          if (eventRows.length === 0) {
            return null;
          }

          const registered =
            eventRows.filter(
              (row) =>
                normalize(
                  row.status
                ) === "registered"
            ).length;

          const approved =
            eventRows.filter(
              (row) =>
                normalize(
                  row.status
                ) === "approved"
            ).length;

          const pending =
            eventRows.filter(
              (row) =>
                normalize(
                  row.status
                ) === "pending"
            ).length;

          const rejected =
            eventRows.filter(
              (row) =>
                normalize(
                  row.status
                ) === "rejected"
            ).length;

          const cancelled =
            eventRows.filter(
              (row) => {
                const value =
                  normalize(
                    row.status
                  );

                return (
                  value ===
                    "cancelled" ||
                  value ===
                    "canceled"
                );
              }
            ).length;

          return {
            event,
            total:
              eventRows.length,
            registered,
            approved,
            pending,
            rejected,
            cancelled,
          };
        })
        .filter(
          (
            summary
          ): summary is EventSummary =>
            summary !== null
        );
    }, [
      events,
      registrations,
    ]);

  /* =======================================================
     PUBLISHED / VISIBLE EVENTS
  ======================================================= */

  const publishedEventSummaries =
    useMemo(() => {
      return eventSummaries.filter(
        (summary) => {
          const status =
            normalize(
              summary.event.status
            );

          /*
           * Your events table does not
           * have an is_published field
           * in the supplied structure.
           *
           * Therefore status is used.
           */

          return [
            "published",
            "active",
            "upcoming",
            "ongoing",
            "open",
            "completed",
          ].includes(status);
        }
      );
    }, [eventSummaries]);

  /* =======================================================
     EVENT SEARCH
  ======================================================= */

  const filteredEvents =
    useMemo(() => {
      const query =
        normalize(search);

      return publishedEventSummaries.filter(
        (summary) => {
          const matchesSearch =
            !query ||
            [
              summary.event.title,
              summary.event.description,
              summary.event.venue,
            ].some((value) =>
              normalize(
                value
              ).includes(query)
            );

          const matchesStatus =
            !eventStatus ||
            normalize(
              summary.event.status
            ) ===
              normalize(
                eventStatus
              );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      publishedEventSummaries,
      search,
      eventStatus,
    ]);

  /* =======================================================
     OVERALL STATS
  ======================================================= */

  const overallStats =
    useMemo(() => {
      const visibleEventIds =
        new Set(
          publishedEventSummaries.map(
            (item) =>
              item.event.id
          )
        );

      const visibleRegistrations =
        registrations.filter(
          (item) =>
            visibleEventIds.has(
              item.event_id
            )
        );

      return {
        events:
          publishedEventSummaries.length,

        total:
          visibleRegistrations.length,

        approved:
          visibleRegistrations.filter(
            (item) =>
              normalize(
                item.status
              ) === "approved"
          ).length,

        pending:
          visibleRegistrations.filter(
            (item) =>
              normalize(
                item.status
              ) === "pending"
          ).length,
      };
    }, [
      publishedEventSummaries,
      registrations,
    ]);

  /* =======================================================
     SELECTED EVENT
  ======================================================= */

  const selectedEventSummary =
    useMemo(() => {
      if (!selectedEventId) {
        return null;
      }

      return (
        publishedEventSummaries.find(
          (item) =>
            item.event.id ===
            selectedEventId
        ) || null
      );
    }, [
      selectedEventId,
      publishedEventSummaries,
    ]);

  /* =======================================================
     SELECTED EVENT REGISTRATION ROWS
  ======================================================= */

  const selectedRows =
    useMemo<RegistrationRow[]>(() => {
      if (!selectedEventId) {
        return [];
      }

      return registrations
        .filter(
          (registration) =>
            registration.event_id ===
            selectedEventId
        )
        .map(
          (registration) => ({
            registration,

            event:
              eventMap.get(
                registration.event_id
              ) || null,

            volunteer:
              volunteerMap.get(
                registration.volunteer_id
              ) || null,
          })
        );
    }, [
      selectedEventId,
      registrations,
      eventMap,
      volunteerMap,
    ]);

  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

  const departments =
    useMemo(() => {
      return Array.from(
        new Set(
          selectedRows
            .map(
              (row) =>
                row.volunteer
                  ?.department
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        )
      ).sort();
    }, [selectedRows]);

  const years = useMemo(() => {
    return Array.from(
      new Set(
        selectedRows
          .map(
            (row) =>
              row.volunteer?.year
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [selectedRows]);

  const sections =
    useMemo(() => {
      return Array.from(
        new Set(
          selectedRows
            .map(
              (row) =>
                row.volunteer
                  ?.section
            )
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
        )
      ).sort();
    }, [selectedRows]);

  const units = useMemo(() => {
    return Array.from(
      new Set(
        selectedRows
          .map(
            (row) =>
              row.volunteer
                ?.nss_unit
          )
          .filter(
            (
              value
            ): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [selectedRows]);

  /* =======================================================
     FILTERED REGISTRATIONS
  ======================================================= */

  const filteredRows =
    useMemo(() => {
      const query =
        normalize(studentSearch);

      return selectedRows.filter(
        ({
          registration,
          volunteer,
        }) => {
          const matchesSearch =
            !query ||
            [
              volunteer?.full_name,
              volunteer?.roll_number,
              volunteer?.volunteer_id,
              volunteer?.department,
              volunteer?.course,
              volunteer?.email,
              volunteer?.mobile,
              volunteer?.phone,
            ].some((value) =>
              normalize(
                value
              ).includes(query)
            );

          const matchesDepartment =
            !department ||
            volunteer?.department ===
              department;

          const matchesYear =
            !year ||
            volunteer?.year ===
              year;

          const matchesSection =
            !section ||
            volunteer?.section ===
              section;

          const matchesUnit =
            !nssUnit ||
            volunteer?.nss_unit ===
              nssUnit;

          const matchesStatus =
            !registrationStatus ||
            normalize(
              registration.status
            ) ===
              normalize(
                registrationStatus
              );

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
      selectedRows,
      studentSearch,
      department,
      year,
      section,
      nssUnit,
      registrationStatus,
    ]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  function openEvent(
    id: string
  ) {
    setSelectedEventId(id);

    setStudentSearch("");
    setDepartment("");
    setYear("");
    setSection("");
    setNssUnit("");
    setRegistrationStatus("");
  }

  function closeEvent() {
    setSelectedEventId(null);
    setSelectedRegistration(
      null
    );

    setStudentSearch("");
    setDepartment("");
    setYear("");
    setSection("");
    setNssUnit("");
    setRegistrationStatus("");
  }

  function clearEventFilters() {
    setSearch("");
    setEventStatus("");
  }

  function clearStudentFilters() {
    setStudentSearch("");
    setDepartment("");
    setYear("");
    setSection("");
    setNssUnit("");
    setRegistrationStatus("");
  }

  async function handleIndividualPDF(
    row: RegistrationRow
  ) {
    try {
      setPdfLoading(true);

      await downloadRegistrationPDF(
        row
      );
    } catch (err) {
      console.error(
        "Registration PDF error:",
        err
      );
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleEventPDF() {
    if (!selectedEventSummary) {
      return;
    }

    try {
      setPdfLoading(true);

      await downloadEventRegistrationsPDF(
        selectedEventSummary.event,
        filteredRows
      );
    } catch (err) {
      console.error(
        "Event PDF error:",
        err
      );
    } finally {
      setPdfLoading(false);
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />

            <div className="h-4 w-96 rounded bg-slate-200" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-24 rounded-2xl bg-white"
                  />
                )
              )}
            </div>

            <div className="h-24 rounded-2xl bg-white" />

            <div className="grid gap-5 xl:grid-cols-2">
              {Array.from({
                length: 4,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-2xl bg-white"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    events.length === 0 &&
    registrations.length === 0
  ) {
    return (
      <main className="min-h-screen bg-[#f7f9fc]">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex gap-4">
              <AlertCircle
                size={22}
                className="shrink-0 text-red-600"
              />

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load registrations
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadData(true)
                  }
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#12358f] px-4 text-sm font-semibold text-white hover:bg-[#0d2870]"
                >
                  <RefreshCw
                    size={15}
                  />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     EVENT DETAIL VIEW
  ======================================================= */

  if (selectedEventSummary) {
    const summary =
      selectedEventSummary;

    return (
      <>
        <main className="min-h-screen bg-[#f7f9fc]">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">

            {/* HEADER */}
            <div className="mb-7">
              <button
                type="button"
                onClick={closeEvent}
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#12358f]"
              >
                <ChevronLeft
                  size={16}
                />
                Back to Registrations
              </button>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="mb-2 text-xs text-slate-400">
                    Program Officer Portal
                    <span className="mx-2">
                      ›
                    </span>
                    Registrations
                    <span className="mx-2">
                      ›
                    </span>
                    Event Data
                  </p>

                  <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
                    {summary.event.title}
                  </h1>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays
                        size={15}
                      />
                      {formatDate(
                        summary.event
                          .event_date
                      )}
                    </span>

                    {summary.event
                      .start_time && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          size={15}
                        />
                        {formatTime(
                          summary.event
                            .start_time
                        )}

                        {summary.event
                          .end_time
                          ? ` - ${formatTime(
                              summary.event
                                .end_time
                            )}`
                          : ""}
                      </span>
                    )}

                    {summary.event
                      .venue && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin
                          size={15}
                        />
                        {
                          summary.event
                            .venue
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      loadData(false)
                    }
                    disabled={
                      refreshing
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                  >
                    <RefreshCw
                      size={15}
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
                    onClick={
                      handleEventPDF
                    }
                    disabled={
                      pdfLoading ||
                      filteredRows.length ===
                        0
                    }
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#12358f] px-4 text-sm font-semibold text-white hover:bg-[#0d2870] disabled:opacity-60"
                  >
                    <FileDown
                      size={15}
                    />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                icon={
                  <Users
                    size={20}
                  />
                }
                value={summary.total}
                label="Total"
              />

              <StatCard
                icon={
                  <UserCheck
                    size={20}
                  />
                }
                value={
                  summary.registered
                }
                label="Registered"
              />

              <StatCard
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                value={
                  summary.approved
                }
                label="Approved"
              />

              <StatCard
                icon={
                  <Clock3
                    size={20}
                  />
                }
                value={
                  summary.pending
                }
                label="Pending"
              />

              <StatCard
                icon={
                  <XCircle
                    size={20}
                  />
                }
                value={
                  summary.rejected
                }
                label="Rejected"
              />
            </div>

            {/* FILTERS */}
            <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Filter
                  size={17}
                  className="text-[#12358f]"
                />

                <h2 className="font-serif text-lg font-bold text-slate-950">
                  Registration Data
                </h2>
              </div>

              <div className="relative mb-4">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={
                    studentSearch
                  }
                  onChange={(event) =>
                    setStudentSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, roll number, volunteer ID, department..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <FilterSelect
                  label="Department"
                  value={
                    department
                  }
                  options={
                    departments
                  }
                  onChange={
                    setDepartment
                  }
                />

                <FilterSelect
                  label="Year"
                  value={year}
                  options={years}
                  onChange={setYear}
                />

                <FilterSelect
                  label="Section"
                  value={
                    section
                  }
                  options={
                    sections
                  }
                  onChange={
                    setSection
                  }
                />

                <FilterSelect
                  label="NSS Unit"
                  value={
                    nssUnit
                  }
                  options={units}
                  onChange={
                    setNssUnit
                  }
                />

                <FilterSelect
                  label="Status"
                  value={
                    registrationStatus
                  }
                  options={[
                    "Registered",
                    "Approved",
                    "Pending",
                    "Rejected",
                    "Cancelled",
                  ]}
                  onChange={
                    setRegistrationStatus
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {
                      filteredRows.length
                    }
                  </span>{" "}
                  of{" "}
                  {
                    selectedRows.length
                  }{" "}
                  registrations
                </p>

                <button
                  type="button"
                  onClick={
                    clearStudentFilters
                  }
                  className="text-xs font-semibold text-[#12358f] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </section>

            {/* TABLE */}
            <section>
              {filteredRows.length ===
              0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                  <Users
                    size={28}
                    className="mx-auto mb-4 text-slate-300"
                  />

                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    No registration data
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    No registered volunteers match your filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1050px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Volunteer
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
                            Registered
                          </th>

                          <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            View
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredRows.map(
                          (row) => (
                            <tr
                              key={
                                row
                                  .registration
                                  .id
                              }
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    volunteer={
                                      row.volunteer
                                    }
                                  />

                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {row
                                        .volunteer
                                        ?.full_name ||
                                        "Unknown Volunteer"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {row
                                        .volunteer
                                        ?.course ||
                                        "—"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-slate-800">
                                  {row
                                    .volunteer
                                    ?.roll_number ||
                                    "—"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {row
                                    .volunteer
                                    ?.volunteer_id ||
                                    "—"}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-700">
                                {row
                                  .volunteer
                                  ?.department ||
                                  "—"}
                              </td>

                              <td className="px-5 py-4">
                                <p className="text-sm text-slate-700">
                                  {row
                                    .volunteer
                                    ?.year ||
                                    "—"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  {row
                                    .volunteer
                                    ?.section
                                    ? `Section ${row.volunteer.section}`
                                    : "—"}
                                </p>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-700">
                                {row
                                  .volunteer
                                  ?.nss_unit ||
                                  "—"}
                              </td>

                              <td className="px-5 py-4 text-xs text-slate-500">
                                {formatDateTime(
                                  row
                                    .registration
                                    .registered_at
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                    row
                                      .registration
                                      .status
                                  )}`}
                                >
                                  {statusLabel(
                                    row
                                      .registration
                                      .status
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedRegistration(
                                      row
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-[#12358f] hover:text-[#12358f]"
                                >
                                  <Eye
                                    size={15}
                                  />
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
              )}
            </section>
          </div>
        </main>

        {/* DETAIL DRAWER */}
        {selectedRegistration && (
          <div className="fixed inset-0 z-[70]">
            <button
              type="button"
              aria-label="Close details"
              onClick={() =>
                setSelectedRegistration(
                  null
                )
              }
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            />

            <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Event Registration
                    </p>

                    <h2 className="mt-1 font-serif text-xl font-bold text-slate-950">
                      {selectedRegistration
                        .volunteer
                        ?.full_name ||
                        "Unknown Volunteer"}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRegistration(
                        null
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">

                {/* PROFILE */}
                <section className="rounded-2xl bg-[#102f8f] p-6 text-white">
                  <div className="flex items-center gap-4">
                    <Avatar
                      volunteer={
                        selectedRegistration.volunteer
                      }
                      large
                    />

                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-bold">
                        {selectedRegistration
                          .volunteer
                          ?.full_name ||
                          "Unknown Volunteer"}
                      </h3>

                      <p className="mt-1 text-sm text-white/70">
                        {selectedRegistration
                          .volunteer
                          ?.volunteer_id ||
                          selectedRegistration
                            .volunteer
                            ?.roll_number ||
                          "—"}
                      </p>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          selectedRegistration
                            .registration
                            .status
                        )}`}
                      >
                        {statusLabel(
                          selectedRegistration
                            .registration
                            .status
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {/* EVENT */}
                <section>
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                    <CalendarDays
                      size={18}
                      className="text-[#12358f]"
                    />
                    Event
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Event Name"
                      value={
                        selectedRegistration
                          .event
                          ?.title || "—"
                      }
                    />

                    <DetailBox
                      label="Event Date"
                      value={formatDate(
                        selectedRegistration
                          .event
                          ?.event_date
                      )}
                    />

                    <DetailBox
                      label="Start Time"
                      value={formatTime(
                        selectedRegistration
                          .event
                          ?.start_time
                      )}
                    />

                    <DetailBox
                      label="End Time"
                      value={formatTime(
                        selectedRegistration
                          .event
                          ?.end_time
                      )}
                    />

                    <DetailBox
                      label="Venue"
                      value={
                        selectedRegistration
                          .event
                          ?.venue || "—"
                      }
                    />

                    <DetailBox
                      label="Event Status"
                      value={
                        selectedRegistration
                          .event
                          ?.status || "—"
                      }
                    />
                  </div>
                </section>

                {/* VOLUNTEER */}
                <section>
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-950">
                    <Users
                      size={18}
                      className="text-[#12358f]"
                    />
                    Volunteer Information
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Full Name"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.full_name || "—"
                      }
                    />

                    <DetailBox
                      label="Volunteer ID"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.volunteer_id ||
                        "—"
                      }
                    />

                    <DetailBox
                      label="Roll Number"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.roll_number ||
                        "—"
                      }
                    />

                    <DetailBox
                      label="Department"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.department ||
                        "—"
                      }
                    />

                    <DetailBox
                      label="Course"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.course || "—"
                      }
                    />

                    <DetailBox
                      label="Year"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.year || "—"
                      }
                    />

                    <DetailBox
                      label="Section"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.section || "—"
                      }
                    />

                    <DetailBox
                      label="Academic Year"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.academic_year ||
                        "—"
                      }
                    />

                    <DetailBox
                      label="NSS Unit"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.nss_unit ||
                        "—"
                      }
                    />
                  </div>
                </section>

                {/* CONTACT */}
                <section>
                  <h3 className="mb-4 font-serif text-lg font-bold text-slate-950">
                    Contact Information
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Email"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.email || "—"
                      }
                    />

                    <DetailBox
                      label="Mobile"
                      value={
                        selectedRegistration
                          .volunteer
                          ?.mobile ||
                        selectedRegistration
                          .volunteer
                          ?.phone ||
                        "—"
                      }
                    />
                  </div>
                </section>

                {/* REGISTRATION */}
                <section>
                  <h3 className="mb-4 font-serif text-lg font-bold text-slate-950">
                    Registration Record
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailBox
                      label="Status"
                      value={statusLabel(
                        selectedRegistration
                          .registration
                          .status
                      )}
                    />

                    <DetailBox
                      label="Registered At"
                      value={formatDateTime(
                        selectedRegistration
                          .registration
                          .registered_at
                      )}
                    />

                    <DetailBox
                      label="Registration ID"
                      value={
                        selectedRegistration
                          .registration.id
                      }
                    />

                    <DetailBox
                      label="Last Updated"
                      value={formatDateTime(
                        selectedRegistration
                          .registration
                          .updated_at
                      )}
                    />
                  </div>
                </section>

                {/* PDF */}
                <button
                  type="button"
                  disabled={
                    pdfLoading
                  }
                  onClick={() =>
                    handleIndividualPDF(
                      selectedRegistration
                    )
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#12358f] text-sm font-semibold text-white transition hover:bg-[#0d2870] disabled:opacity-60"
                >
                  <Download
                    size={17}
                  />

                  {pdfLoading
                    ? "Generating PDF..."
                    : "Download Registration PDF"}
                </button>

                {/* VIEW ONLY NOTICE */}
                <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#12358f]"
                  />

                  <p className="text-xs leading-5 text-blue-800">
                    Program Officer access is
                    view-only. Registration
                    records cannot be created,
                    edited or deleted from this
                    portal.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </>
    );
  }

  /* =======================================================
     MAIN EVENT LIST
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs text-slate-400">
              Program Officer Portal
              <span className="mx-2">
                ›
              </span>
              Registrations
            </p>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-950">
              Event Registrations
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              View published event registration
              data and registered volunteer
              responses.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadData(false)
            }
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-semibold text-amber-800">
                Registration data warning
              </p>

              <p className="mt-1 text-xs text-amber-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={
              <CalendarDays
                size={20}
              />
            }
            value={
              overallStats.events
            }
            label="Published Events"
          />

          <StatCard
            icon={
              <Users size={20} />
            }
            value={
              overallStats.total
            }
            label="Total Registrations"
          />

          <StatCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            value={
              overallStats.approved
            }
            label="Approved"
          />

          <StatCard
            icon={
              <Clock3
                size={20}
              />
            }
            value={
              overallStats.pending
            }
            label="Pending"
          />
        </div>

        {/* SEARCH */}
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
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search event name, venue or description..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                Event Status
              </label>

              <select
                value={
                  eventStatus
                }
                onChange={(event) =>
                  setEventStatus(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#12358f] focus:bg-white focus:ring-2 focus:ring-[#12358f]/10"
              >
                <option value="">
                  All
                </option>

                <option value="published">
                  Published
                </option>

                <option value="active">
                  Active
                </option>

                <option value="upcoming">
                  Upcoming
                </option>

                <option value="ongoing">
                  Ongoing
                </option>

                <option value="open">
                  Open
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={
                clearEventFilters
              }
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
              Published Event Registrations
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Select an event to view its
              registration responses.
            </p>
          </div>

          {filteredEvents.length ===
          0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <CalendarDays
                  size={25}
                />
              </div>

              <h3 className="font-serif text-lg font-bold text-slate-900">
                No published registrations
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Published event registration data
                will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredEvents.map(
                (summary) => (
                  <article
                    key={
                      summary.event.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* EVENT INFO */}
                    <div className="border-b border-slate-100 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#12358f]">
                              <CalendarDays
                                size={17}
                              />
                            </span>

                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-[#12358f]">
                              {
                                summary
                                  .event
                                  .status
                              }
                            </span>
                          </div>

                          <h3 className="font-serif text-xl font-bold text-slate-950">
                            {
                              summary
                                .event
                                .title
                            }
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={13}
                              />
                              {formatDate(
                                summary
                                  .event
                                  .event_date
                              )}
                            </span>

                            {summary
                              .event
                              .start_time && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3
                                  size={13}
                                />
                                {formatTime(
                                  summary
                                    .event
                                    .start_time
                                )}
                              </span>
                            )}

                            {summary
                              .event
                              .venue && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin
                                  size={13}
                                />
                                {
                                  summary
                                    .event
                                    .venue
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-serif text-2xl font-bold text-slate-950">
                            {
                              summary.total
                            }
                          </p>

                          <p className="text-[10px] text-slate-400">
                            Registered
                          </p>
                        </div>
                      </div>

                      {summary.event
                        .description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                          {
                            summary
                              .event
                              .description
                          }
                        </p>
                      )}
                    </div>

                    {/* EVENT STATS */}
                    <div className="grid grid-cols-4 border-b border-slate-100">
                      <EventStat
                        value={
                          summary.registered
                        }
                        label="Registered"
                        type="registered"
                      />

                      <EventStat
                        value={
                          summary.approved
                        }
                        label="Approved"
                        type="approved"
                      />

                      <EventStat
                        value={
                          summary.pending
                        }
                        label="Pending"
                        type="pending"
                      />

                      <EventStat
                        value={
                          summary.rejected
                        }
                        label="Rejected"
                        type="rejected"
                      />
                    </div>

                    {/* ACTION */}
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Registration Responses
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {
                            summary.total
                          }{" "}
                          response
                          {summary.total ===
                          1
                            ? ""
                            : "s"}{" "}
                          available
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openEvent(
                            summary
                              .event
                              .id
                          )
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#12358f] px-4 text-xs font-semibold text-white hover:bg-[#0d2870]"
                      >
                        <Eye
                          size={15}
                        />
                        View Data
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}