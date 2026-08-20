"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Users,
  XCircle,
  Eye,
  UserCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* ==========================================
   ACTIVE APPLICATION
========================================== */

interface Application {
  id: string;
  volunteer_id: string | null;

  full_name: string | null;
  roll_number: string | null;
  hall_ticket_number: string | null;

  department: string | null;
  course: string | null;
  year: string | null;
  semester: string | null;
  section: string | null;
  academic_year: string | null;

  college_email: string | null;
  mobile_number: string | null;

  photo_url: string | null;

  status: string | null;
  verification_status: string | null;

  created_at: string | null;
  updated_at: string | null;
}

/* ==========================================
   REJECTED APPLICATION
========================================== */

interface RejectedApplication {
  id: string;

  volunteer_id: string | null;

  full_name: string | null;
  roll_number: string | null;
  college_email: string | null;

  rejection_reason: string | null;
  rejected_by: string | null;

  created_at: string | null;

  volunteer_data?: Record<string, any> | null;
}

/* ==========================================
   FILTER
========================================== */

type FilterType =
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected";

/* ==========================================
   PAGE
========================================== */

export default function AdminApplicationsPage() {
  /* ==========================================
     STATE
  ========================================== */

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [rejectedApplications, setRejectedApplications] =
    useState<RejectedApplication[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("All");

  const [error, setError] =
    useState("");

  /* ==========================================
     LOAD DATA
  ========================================== */

  const loadApplications = async (
    refresh = false
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      /* ======================================
         LOAD ACTIVE APPLICATIONS
         Pending + Approved
         ====================================== */

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          volunteer_id,
          full_name,
          roll_number,
          hall_ticket_number,
          department,
          course,
          year,
          semester,
          section,
          academic_year,
          college_email,
          mobile_number,
          photo_url,
          status,
          verification_status,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (applicationError) {
        console.error(
          "Applications loading error:",
          applicationError
        );

        setError(
          `Unable to load applications: ${applicationError.message}`
        );

        setApplications([]);

        return;
      }

      /* ======================================
         LOAD REJECTED APPLICATIONS

         IMPORTANT:
         Rejected volunteers are removed from
         the volunteers table.

         Their records are stored in:
         volunteer_rejections
         ====================================== */

      const {
        data: rejectedData,
        error: rejectedError,
      } = await supabase
        .from("volunteer_rejections")
        .select(`
          id,
          volunteer_id,
          full_name,
          roll_number,
          college_email,
          rejection_reason,
          rejected_by,
          created_at,
          volunteer_data
        `)
        .order("created_at", {
          ascending: false,
        });

      if (rejectedError) {
        console.error(
          "Rejected applications loading error:",
          rejectedError
        );

        /*
         * Do not destroy the active application list
         * if rejection history has a problem.
         */

        setRejectedApplications([]);

        setError(
          `Applications loaded, but rejected applications could not be loaded: ${rejectedError.message}`
        );
      } else {
        setRejectedApplications(
          (rejectedData || []) as RejectedApplication[]
        );
      }

      setApplications(
        (applicationData || []) as Application[]
      );
    } catch (err) {
      console.error(
        "Admin applications error:",
        err
      );

      setError(
        "Something went wrong while loading applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ==========================================
     INITIAL LOAD
  ========================================== */

  useEffect(() => {
    loadApplications();
  }, []);

  /* ==========================================
     COUNTS
  ========================================== */

  const pendingCount =
    applications.filter(
      (application) =>
        application.status === "Pending" ||
        !application.status
    ).length;

  const approvedCount =
    applications.filter(
      (application) =>
        application.status === "Approved"
    ).length;

  /*
   * Rejected count MUST come from
   * volunteer_rejections.
   */

  const rejectedCount =
    rejectedApplications.length;

  /*
   * Total means:
   * active applications
   * +
   * rejected applications
   */

  const totalCount =
    applications.length +
    rejectedApplications.length;

  /* ==========================================
     SEARCH TEXT
  ========================================== */

  const searchText =
    search.trim().toLowerCase();

  /* ==========================================
     FILTER ACTIVE APPLICATIONS
  ========================================== */

  const filteredApplications =
    useMemo(() => {
      /*
       * Rejected applications are rendered
       * separately because they are stored in
       * volunteer_rejections.
       */

      if (filter === "Rejected") {
        return [];
      }

      return applications.filter(
        (application) => {
          const currentStatus =
            application.status ||
            "Pending";

          const matchesFilter =
            filter === "All" ||
            currentStatus === filter;

          if (!matchesFilter) {
            return false;
          }

          if (!searchText) {
            return true;
          }

          return Boolean(
            application.full_name
              ?.toLowerCase()
              .includes(searchText) ||

            application.volunteer_id
              ?.toLowerCase()
              .includes(searchText) ||

            application.roll_number
              ?.toLowerCase()
              .includes(searchText) ||

            application.college_email
              ?.toLowerCase()
              .includes(searchText) ||

            application.department
              ?.toLowerCase()
              .includes(searchText) ||

            application.course
              ?.toLowerCase()
              .includes(searchText)
          );
        }
      );
    }, [
      applications,
      filter,
      searchText,
    ]);

  /* ==========================================
     FILTER REJECTED APPLICATIONS
  ========================================== */

  const filteredRejectedApplications =
    useMemo(() => {
      if (filter !== "Rejected") {
        return [];
      }

      if (!searchText) {
        return rejectedApplications;
      }

      return rejectedApplications.filter(
        (application) => {
          const volunteerData =
            application.volunteer_data;

          return Boolean(
            application.full_name
              ?.toLowerCase()
              .includes(searchText) ||

            application.volunteer_id
              ?.toLowerCase()
              .includes(searchText) ||

            application.roll_number
              ?.toLowerCase()
              .includes(searchText) ||

            application.college_email
              ?.toLowerCase()
              .includes(searchText) ||

            application.rejection_reason
              ?.toLowerCase()
              .includes(searchText) ||

            String(
              volunteerData?.department || ""
            )
              .toLowerCase()
              .includes(searchText) ||

            String(
              volunteerData?.course || ""
            )
              .toLowerCase()
              .includes(searchText)
          );
        }
      );
    }, [
      rejectedApplications,
      filter,
      searchText,
    ]);

  /* ==========================================
     CURRENT LIST COUNT
  ========================================== */

  const visibleCount =
    filter === "Rejected"
      ? filteredRejectedApplications.length
      : filteredApplications.length;

  /* ==========================================
     DATE FORMAT
  ========================================== */

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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

  /* ==========================================
     STATUS BADGE
  ========================================== */

  const StatusBadge = ({
    status,
  }: {
    status: string | null;
  }) => {
    const currentStatus =
      status || "Pending";

    if (
      currentStatus === "Approved"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
          <CheckCircle className="h-4 w-4" />
          Approved
        </span>
      );
    }

    if (
      currentStatus === "Rejected"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
          <XCircle className="h-4 w-4" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
        <Clock className="h-4 w-4" />
        Pending
      </span>
    );
  };

  /* ==========================================
     PAGE
  ========================================== */

  return (
    <AdminDashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-[#0F2B7B]">
              Applications
            </h1>

            <p className="mt-2 text-gray-600">
              Review and manage all NSS volunteer
              applications.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadApplications(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={
                refreshing
                  ? "h-5 w-5 animate-spin"
                  : "h-5 w-5"
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ====================================
            ERROR
        ==================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

            <p className="font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadApplications(true)
              }
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>

          </div>
        )}

        {/* ====================================
            STATISTICS
        ==================================== */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="All Applications"
            count={totalCount}
            icon={
              <Users className="h-6 w-6" />
            }
            iconClass="bg-blue-100 text-[#0F2B7B]"
            countClass="text-[#0F2B7B]"
          />

          <StatCard
            title="Pending"
            count={pendingCount}
            icon={
              <Clock className="h-6 w-6" />
            }
            iconClass="bg-yellow-100 text-yellow-700"
            countClass="text-yellow-600"
          />

          <StatCard
            title="Approved"
            count={approvedCount}
            icon={
              <UserCheck className="h-6 w-6" />
            }
            iconClass="bg-green-100 text-green-700"
            countClass="text-green-600"
          />

          <StatCard
            title="Rejected"
            count={rejectedCount}
            icon={
              <XCircle className="h-6 w-6" />
            }
            iconClass="bg-red-100 text-red-700"
            countClass="text-red-600"
          />

        </div>

        {/* ====================================
            APPLICATION MANAGEMENT
        ==================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-[#0F2B7B]">
                  Application Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View pending, approved and rejected
                  NSS applications.
                </p>
              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-md">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, ID, roll number, email..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* FILTERS */}

            <div className="mt-6 flex flex-wrap gap-2">

              {(
                [
                  "All",
                  "Pending",
                  "Approved",
                  "Rejected",
                ] as FilterType[]
              ).map((item) => {

                const count =
                  item === "All"
                    ? totalCount
                    : item === "Pending"
                    ? pendingCount
                    : item === "Approved"
                    ? approvedCount
                    : rejectedCount;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      filter === item
                        ? "bg-[#0F2B7B] text-white"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                    }`}
                  >
                    {item}

                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        filter === item
                          ? "bg-white/20 text-white"
                          : "bg-white text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

            </div>

          </div>

          {/* ====================================
              LOADING
          ==================================== */}

          {loading ? (

            <div className="p-12 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-gray-500">
                Loading applications...
              </p>

            </div>

          ) : visibleCount === 0 ? (

            /* ==================================
               EMPTY
            ================================== */

            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                {filter === "Rejected" ? (
                  <XCircle className="h-8 w-8 text-gray-400" />
                ) : (
                  <Users className="h-8 w-8 text-gray-400" />
                )}

              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No applications found
              </h3>

              <p className="mt-2 text-sm text-gray-500">

                {search
                  ? "No applications match your search."
                  : filter === "Rejected"
                  ? "There are no rejected applications."
                  : `There are no ${filter.toLowerCase()} applications.`}

              </p>

            </div>

          ) : filter === "Rejected" ? (

            /* ==================================
               REJECTED APPLICATIONS
            ================================== */

            <div className="divide-y">

              {filteredRejectedApplications.map(
                (application) => {

                  const volunteerData =
                    application.volunteer_data;

                  return (
                    <div
                      key={application.id}
                      className="p-6 transition hover:bg-red-50/40"
                    >

                      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

                        {/* PROFILE */}

                        <div className="flex min-w-0 flex-1 items-start gap-4">

                          {volunteerData?.photo_url ? (
                            <img
                              src={
                                volunteerData.photo_url
                              }
                              alt={
                                application.full_name ||
                                "Volunteer"
                              }
                              className="h-16 w-16 shrink-0 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
                              {application.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "V"}
                            </div>
                          )}

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-gray-900">
                                {application.full_name ||
                                  "Unnamed Volunteer"}
                              </h3>

                              <StatusBadge
                                status="Rejected"
                              />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              Roll No:{" "}
                              {application.roll_number ||
                                "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              NSS ID:{" "}
                              {application.volunteer_id ||
                                "Not assigned"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {volunteerData?.department ||
                                "—"}

                              {volunteerData?.course
                                ? ` • ${volunteerData.course}`
                                : ""}
                            </p>

                          </div>

                        </div>

                        {/* CONTACT */}

                        <div className="min-w-[230px] text-sm text-gray-600">

                          <p className="truncate">
                            {application.college_email ||
                              "No email"}
                          </p>

                          <p className="mt-1">
                            {volunteerData?.mobile_number ||
                              "No mobile"}
                          </p>

                          <p className="mt-1">
                            Rejected:{" "}
                            {formatDate(
                              application.created_at
                            )}
                          </p>

                        </div>

                        {/* REJECTION REASON */}

                        <div className="w-full xl:max-w-md">

                          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                            Rejection Reason
                          </p>

                          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4">

                            <p className="whitespace-pre-wrap text-sm leading-6 text-red-800">
                              {application.rejection_reason ||
                                "No rejection reason recorded."}
                            </p>

                          </div>

                          {application.rejected_by && (
                            <p className="mt-2 text-xs text-gray-400">
                              Rejected by:{" "}
                              {application.rejected_by}
                            </p>
                          )}

                        </div>

                        {/* VIEW */}

                        <div className="flex shrink-0">

                          <Link
                            href={`/admin/rejected-applications/${application.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                          >
                            <Eye className="h-5 w-5" />
                            View Application
                          </Link>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            /* ==================================
               PENDING + APPROVED APPLICATIONS
            ================================== */

            <div className="divide-y">

              {filteredApplications.map(
                (application) => {

                  const currentStatus =
                    application.status ||
                    "Pending";

                  return (
                    <div
                      key={application.id}
                      className="p-6 transition hover:bg-slate-50"
                    >

                      <div className="flex flex-col gap-6 xl:flex-row xl:items-center">

                        {/* PROFILE */}

                        <div className="flex min-w-0 flex-1 items-center gap-4">

                          {application.photo_url ? (
                            <img
                              src={
                                application.photo_url
                              }
                              alt={
                                application.full_name ||
                                "Volunteer"
                              }
                              className="h-16 w-16 shrink-0 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#0F2B7B]">
                              {application.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "V"}
                            </div>
                          )}

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-gray-900">
                                {application.full_name ||
                                  "Unnamed Volunteer"}
                              </h3>

                              <StatusBadge
                                status={
                                  application.status
                                }
                              />

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              Roll No:{" "}
                              {application.roll_number ||
                                "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              NSS ID:{" "}
                              {application.volunteer_id ||
                                "Not assigned"}
                            </p>

                          </div>

                        </div>

                        {/* ACADEMIC */}

                        <div className="min-w-[220px] text-sm">

                          <p className="font-semibold text-gray-800">
                            {application.department ||
                              "Department not specified"}
                          </p>

                          <p className="mt-1 text-gray-500">
                            {application.course ||
                              "Course not specified"}
                          </p>

                          <p className="mt-1 text-gray-500">
                            Year:{" "}
                            {application.year ||
                              "—"}

                            {application.section
                              ? ` • Section ${application.section}`
                              : ""}
                          </p>

                        </div>

                        {/* CONTACT */}

                        <div className="min-w-[240px] text-sm text-gray-600">

                          <p className="truncate">
                            {application.college_email ||
                              "No email"}
                          </p>

                          <p className="mt-1">
                            {application.mobile_number ||
                              "No mobile"}
                          </p>

                          <p className="mt-1">
                            Applied:{" "}
                            {formatDate(
                              application.created_at
                            )}
                          </p>

                        </div>

                        {/* VIEW */}

                        <div className="flex shrink-0">

                          <Link
                            href={`/admin/volunteers/${application.id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#143a96]"
                          >
                            <Eye className="h-5 w-5" />

                            View Application
                          </Link>

                        </div>

                      </div>

                      {/* EXTRA */}

                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">

                        {application.hall_ticket_number && (
                          <span>
                            Hall Ticket:{" "}
                            {application.hall_ticket_number}
                          </span>
                        )}

                        {application.academic_year && (
                          <span>
                            Academic Year:{" "}
                            {application.academic_year}
                          </span>
                        )}

                        {application.verification_status && (
                          <span>
                            Verification:{" "}
                            {application.verification_status}
                          </span>
                        )}

                        {currentStatus ===
                          "Approved" && (
                          <span className="font-semibold text-green-600">
                            Approved Volunteer
                          </span>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>
    </AdminDashboardLayout>
  );
}

/* ==========================================
   STAT CARD
========================================== */

function StatCard({
  title,
  count,
  icon,
  iconClass,
  countClass,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  iconClass: string;
  countClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${countClass}`}
          >
            {count}
          </p>

        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}