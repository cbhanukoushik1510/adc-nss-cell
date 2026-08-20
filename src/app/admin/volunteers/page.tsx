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
  UserCheck,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Award,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   VOLUNTEER TYPE
========================================================= */

interface Volunteer {
  id: string;
  volunteer_id: string | null;

  full_name: string;
  roll_number: string | null;
  hall_ticket_number: string | null;

  department: string | null;
  course: string | null;
  year: string | null;
  semester: string | null;
  section: string | null;
  academic_year: string | null;

  college_email: string | null;
  personal_email: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;

  photo_url: string | null;

  gender: string | null;
  blood_group: string | null;
  date_of_birth: string | null;

  city: string | null;
  state: string | null;

  nss_unit: string | null;
  role: string | null;

  status: string | null;
  verification_status: string | null;

  service_hours: number | null;
  attendance_percentage: number | null;
  certificates_count: number | null;

  created_at: string | null;
  updated_at: string | null;
}

type FilterType =
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected";

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (
  status: string | null | undefined
): FilterType => {
  const value = status
    ?.trim()
    .toLowerCase();

  switch (value) {
    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    case "pending":
      return "Pending";

    default:
      return "Pending";
  }
};

const formatDate = (
  value: string | null
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

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

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: FilterType;
}) {
  if (status === "Approved") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }

  if (status === "Rejected") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  count,
  icon,
  iconClass,
  numberClass,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  iconClass: string;
  numberClass: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${numberClass}`}
          >
            {count}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] =
    useState<Volunteer[]>([]);

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

  /* =======================================================
     LOAD VOLUNTEERS
  ======================================================= */

  const loadVolunteers = async (
    refresh = false
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const {
        data,
        error: volunteerError,
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
          personal_email,
          mobile_number,
          whatsapp_number,
          photo_url,
          gender,
          blood_group,
          date_of_birth,
          city,
          state,
          nss_unit,
          role,
          status,
          verification_status,
          service_hours,
          attendance_percentage,
          certificates_count,
          created_at,
          updated_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (volunteerError) {
        console.error(
          "Volunteer loading error:",
          volunteerError
        );

        throw new Error(
          volunteerError.message
        );
      }

      setVolunteers(
        (data || []) as Volunteer[]
      );
    } catch (err) {
      console.error(
        "Admin volunteers error:",
        err
      );

      setVolunteers([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load volunteers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadVolunteers();
  }, []);

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalCount =
    volunteers.length;

  const pendingCount =
    volunteers.filter(
      (volunteer) =>
        normalizeStatus(
          volunteer.status
        ) === "Pending"
    ).length;

  const approvedCount =
    volunteers.filter(
      (volunteer) =>
        normalizeStatus(
          volunteer.status
        ) === "Approved"
    ).length;

  const rejectedCount =
    volunteers.filter(
      (volunteer) =>
        normalizeStatus(
          volunteer.status
        ) === "Rejected"
    ).length;

  /* =======================================================
     FILTER + SEARCH
  ======================================================= */

  const filteredVolunteers =
    useMemo(() => {
      const searchText =
        search
          .trim()
          .toLowerCase();

      return volunteers.filter(
        (volunteer) => {
          const status =
            normalizeStatus(
              volunteer.status
            );

          /* STATUS FILTER */

          if (
            filter !== "All" &&
            status !== filter
          ) {
            return false;
          }

          /* SEARCH */

          if (!searchText) {
            return true;
          }

          const searchableText = [
            volunteer.full_name,
            volunteer.volunteer_id,
            volunteer.roll_number,
            volunteer.hall_ticket_number,
            volunteer.college_email,
            volunteer.personal_email,
            volunteer.mobile_number,
            volunteer.whatsapp_number,
            volunteer.department,
            volunteer.course,
            volunteer.year,
            volunteer.semester,
            volunteer.section,
            volunteer.academic_year,
            volunteer.city,
            volunteer.state,
            volunteer.nss_unit,
            volunteer.role,
            volunteer.status,
            volunteer.verification_status,
          ]
            .filter(
              (
                value
              ): value is string =>
                Boolean(value)
            )
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchText
          );
        }
      );
    }, [
      volunteers,
      search,
      filter,
    ]);

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
            <h1 className="text-3xl font-bold tracking-tight text-[#0F2B7B]">
              Volunteer Management
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Manage and view all registered
              volunteer profiles.
            </p>
          </div>

          <div className="flex w-full gap-3 lg:w-auto">

            {/* SEARCH */}

            <div className="relative w-full lg:w-[420px]">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search name, NSS ID, roll number, email..."
                className="h-14 w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadVolunteers(true)
              }
              disabled={refreshing}
              title="Refresh volunteers"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

            <p className="font-semibold">
              Unable to load volunteers.
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadVolunteers(true)
              }
              className="mt-3 text-sm font-bold underline"
            >
              Try again
            </button>

          </div>
        )}

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Volunteers"
            count={totalCount}
            icon={
              <Users className="h-6 w-6" />
            }
            iconClass="bg-blue-100 text-[#0F2B7B]"
            numberClass="text-[#0F2B7B]"
          />

          <StatCard
            title="Pending"
            count={pendingCount}
            icon={
              <Clock className="h-6 w-6" />
            }
            iconClass="bg-yellow-100 text-yellow-700"
            numberClass="text-yellow-600"
          />

          <StatCard
            title="Approved Volunteers"
            count={approvedCount}
            icon={
              <UserCheck className="h-6 w-6" />
            }
            iconClass="bg-green-100 text-green-700"
            numberClass="text-green-600"
          />

          <StatCard
            title="Rejected"
            count={rejectedCount}
            icon={
              <XCircle className="h-6 w-6" />
            }
            iconClass="bg-red-100 text-red-700"
            numberClass="text-red-600"
          />

        </div>

        {/* =================================================
            MANAGEMENT SECTION
        ================================================= */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          {/* HEADER */}

          <div className="border-b border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Volunteer Management
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  View pending, approved and
                  rejected volunteer records.
                </p>

              </div>

              {/* FILTERS */}

              <div className="flex flex-wrap gap-2">

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

                  const active =
                    filter === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFilter(item)
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        active
                          ? "bg-[#0F2B7B] text-white shadow-sm"
                          : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>
                        {item}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}

              </div>

            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="p-14 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading volunteers...
              </p>

            </div>
          ) : filteredVolunteers.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="p-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No volunteers found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "No volunteers match your search."
                  : `There are no ${filter.toLowerCase()} volunteers.`}
              </p>

              {(search ||
                filter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                  }}
                  className="mt-5 rounded-xl bg-[#0F2B7B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#143a96]"
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (

            /* =================================================
               VOLUNTEER LIST
            ================================================= */

            <div className="divide-y divide-slate-200">

              {filteredVolunteers.map(
                (volunteer) => {

                  const status =
                    normalizeStatus(
                      volunteer.status
                    );

                  return (
                    <article
                      key={volunteer.id}
                      className="p-5 transition hover:bg-slate-50 sm:p-6"
                    >

                      {/* =================================================
                          MAIN GRID
                      ================================================= */}

                      <div className="grid gap-6 lg:grid-cols-[minmax(280px,1.4fr)_minmax(190px,1fr)_minmax(220px,1.1fr)_auto] lg:items-center">

                        {/* =================================================
                            PROFILE
                        ================================================= */}

                        <div className="flex min-w-0 items-start gap-4">

                          {volunteer.photo_url ? (
                            <img
                              src={
                                volunteer.photo_url
                              }
                              alt={
                                volunteer.full_name ||
                                "Volunteer"
                              }
                              className="h-16 w-16 shrink-0 rounded-2xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-[#0F2B7B]">
                              {(
                                volunteer.full_name ||
                                "V"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="break-words text-base font-bold text-gray-900">
                                {volunteer.full_name ||
                                  "Unnamed Volunteer"}
                              </h3>

                              <StatusBadge
                                status={
                                  status
                                }
                              />

                            </div>

                            {/* ROLL NUMBER */}

                            <p className="mt-2 text-sm text-gray-500">

                              <span className="font-medium text-gray-700">
                                Roll No:
                              </span>{" "}

                              {volunteer.roll_number ||
                                "—"}

                            </p>

                            {/* NSS ID */}

                            <p className="mt-1 text-sm text-gray-500">

                              <span className="font-medium text-gray-700">
                                NSS ID:
                              </span>{" "}

                              <span className="font-semibold text-[#0F2B7B]">
                                {volunteer.volunteer_id ||
                                  "Not generated"}
                              </span>

                            </p>

                          </div>
                        </div>

                        {/* =================================================
                            ACADEMIC
                        ================================================= */}

                        <div className="min-w-0 rounded-xl bg-slate-50 p-4 lg:bg-transparent lg:p-0">

                          <div className="flex items-start gap-3">

                            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[#0F2B7B]" />

                            <div className="min-w-0">

                              <p className="break-words font-semibold text-gray-800">
                                {volunteer.department ||
                                  "Department not specified"}
                              </p>

                              <p className="mt-1 break-words text-sm text-gray-500">
                                {volunteer.course ||
                                  "Course not specified"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">

                                Year:{" "}

                                {volunteer.year ||
                                  "—"}

                                {volunteer.section
                                  ? ` • Section ${volunteer.section}`
                                  : ""}

                              </p>

                              {volunteer.semester && (
                                <p className="mt-1 text-sm text-gray-500">
                                  Semester:{" "}
                                  {
                                    volunteer.semester
                                  }
                                </p>
                              )}

                            </div>

                          </div>
                        </div>

                        {/* =================================================
                            CONTACT
                        ================================================= */}

                        <div className="min-w-0 rounded-xl bg-slate-50 p-4 lg:bg-transparent lg:p-0">

                          <div className="space-y-2 text-sm">

                            {/* EMAIL */}

                            <div className="flex min-w-0 items-start gap-2">

                              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                              <span
                                title={
                                  volunteer.college_email ||
                                  ""
                                }
                                className="min-w-0 truncate text-gray-600"
                              >
                                {volunteer.college_email ||
                                  "Email not available"}
                              </span>

                            </div>

                            {/* PHONE */}

                            <div className="flex items-center gap-2">

                              <Phone className="h-4 w-4 shrink-0 text-gray-400" />

                              <span className="text-gray-600">
                                {volunteer.mobile_number ||
                                  "Phone not available"}
                              </span>

                            </div>

                            {/* LOCATION */}

                            <div className="flex min-w-0 items-start gap-2">

                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                              <span className="min-w-0 truncate text-gray-600">

                                {volunteer.city ||
                                  "City not specified"}

                                {volunteer.state
                                  ? `, ${volunteer.state}`
                                  : ""}

                              </span>

                            </div>

                          </div>
                        </div>

                        {/* =================================================
                            ACTION
                        ================================================= */}

                        <div className="flex lg:justify-end">

                          <Link
                            href={`/admin/volunteers/${volunteer.id}`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0F2B7B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#143a96] sm:w-auto"
                          >
                            View Profile
                          </Link>

                        </div>

                      </div>

                      {/* =================================================
                          SECONDARY STATS
                      ================================================= */}

                      <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* SERVICE HOURS */}

                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0F2B7B]">
                            <Clock className="h-4 w-4" />
                          </div>

                          <div>

                            <p className="text-xs text-gray-500">
                              Service Hours
                            </p>

                            <p className="font-bold text-[#0F2B7B]">
                              {volunteer.service_hours ??
                                0}
                            </p>

                          </div>
                        </div>

                        {/* ATTENDANCE */}

                        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-green-700">
                            <UserCheck className="h-4 w-4" />
                          </div>

                          <div>

                            <p className="text-xs text-gray-500">
                              Attendance
                            </p>

                            <p className="font-bold text-green-700">
                              {volunteer.attendance_percentage ??
                                0}
                              %
                            </p>

                          </div>
                        </div>

                        {/* CERTIFICATES */}

                        <div className="flex items-center gap-3 rounded-xl bg-purple-50 px-4 py-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-purple-700">
                            <Award className="h-4 w-4" />
                          </div>

                          <div>

                            <p className="text-xs text-gray-500">
                              Certificates
                            </p>

                            <p className="font-bold text-purple-700">
                              {volunteer.certificates_count ??
                                0}
                            </p>

                          </div>
                        </div>

                        {/* REGISTERED */}

                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-gray-600">
                            <Users className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-xs text-gray-500">
                              Registered
                            </p>

                            <p className="truncate font-bold text-gray-700">
                              {formatDate(
                                volunteer.created_at
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          ADDITIONAL DETAILS
                      ================================================= */}

                      {(volunteer.role ||
                        volunteer.nss_unit ||
                        volunteer.academic_year ||
                        volunteer.verification_status) && (

                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">

                          {volunteer.role && (
                            <span>
                              Role:{" "}
                              <strong className="font-semibold text-gray-500">
                                {
                                  volunteer.role
                                }
                              </strong>
                            </span>
                          )}

                          {volunteer.nss_unit && (
                            <span>
                              NSS Unit:{" "}
                              <strong className="font-semibold text-gray-500">
                                {
                                  volunteer.nss_unit
                                }
                              </strong>
                            </span>
                          )}

                          {volunteer.academic_year && (
                            <span>
                              Academic Year:{" "}
                              <strong className="font-semibold text-gray-500">
                                {
                                  volunteer.academic_year
                                }
                              </strong>
                            </span>
                          )}

                          {volunteer.verification_status && (
                            <span>
                              Verification:{" "}
                              <strong className="font-semibold text-gray-500">
                                {
                                  volunteer.verification_status
                                }
                              </strong>
                            </span>
                          )}

                        </div>
                      )}

                    </article>
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