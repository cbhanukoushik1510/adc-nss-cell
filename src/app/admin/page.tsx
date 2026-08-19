"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  LogOut,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ==========================================
   ACTIVE VOLUNTEER
========================================== */

interface Volunteer {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  department: string | null;
  course: string | null;
  college_email: string | null;
  mobile_number: string | null;
  status: string | null;
  photo_url: string | null;
  created_at: string | null;
}

/* ==========================================
   REJECTED VOLUNTEER
========================================== */

interface RejectedVolunteer {
  id: string;
  volunteer_id: string | null;

  full_name: string | null;
  roll_number: string | null;
  college_email: string | null;

  rejection_reason: string | null;

  rejected_by: string | null;

  created_at: string | null;

  volunteer_data?: {
    department?: string | null;
    course?: string | null;
    mobile_number?: string | null;
    photo_url?: string | null;
    created_at?: string | null;
  } | null;
}

type FilterType =
  | "All"
  | "Pending"
  | "Approved"
  | "Rejected";

export default function AdminPage() {
  const router = useRouter();

  /* ==========================================
     STATE
  ========================================== */

  const [volunteers, setVolunteers] =
    useState<Volunteer[]>([]);

  const [rejectedVolunteers, setRejectedVolunteers] =
    useState<RejectedVolunteer[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("Pending");

  const [error, setError] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  /* ==========================================
     LOGOUT
  ========================================== */

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    setLoggingOut(true);
    setError("");

    const {
      error: logoutError,
    } = await supabase.auth.signOut();

    if (logoutError) {
      console.error(
        "Logout error:",
        logoutError
      );

      setError(
        "Unable to logout. Please try again."
      );

      setLoggingOut(false);

      return;
    }

    router.replace("/login");
    router.refresh();
  };

  /* ==========================================
     LOAD VOLUNTEERS
  ========================================== */

  const loadVolunteers = async (
    showRefresh = false
  ) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      /* ======================================
         LOAD ACTIVE VOLUNTEERS
      ====================================== */

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
            college_email,
            mobile_number,
            status,
            photo_url,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (volunteerError) {
        console.error(
          "Failed to load volunteers:",
          volunteerError
        );

        setError(
          "Unable to load volunteer applications. Please try again."
        );

        setVolunteers([]);

        return;
      }

      /* ======================================
         LOAD REJECTION HISTORY
      ====================================== */

      const {
        data: rejectionData,
        error: rejectionError,
      } = await supabase
        .from("volunteer_rejections")
        .select(
          `
            id,
            volunteer_id,
            full_name,
            roll_number,
            college_email,
            rejection_reason,
            rejected_by,
            created_at,
            volunteer_data
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (rejectionError) {
        console.error(
          "Failed to load rejection history:",
          rejectionError
        );

        /*
         * We do NOT fail the whole dashboard.
         *
         * Active volunteers can still be displayed.
         */

        setRejectedVolunteers([]);

        setError(
          `Volunteer applications loaded, but rejected applications could not be loaded: ${rejectionError.message}`
        );
      } else {
        setRejectedVolunteers(
          rejectionData || []
        );
      }

      setVolunteers(
        volunteerData || []
      );
    } catch (err) {
      console.error(
        "Admin volunteer loading error:",
        err
      );

      setError(
        "Something went wrong while loading volunteers."
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
    loadVolunteers();
  }, []);

  /* ==========================================
     STATISTICS
  ========================================== */

  const pendingCount =
    volunteers.filter(
      (volunteer) =>
        volunteer.status === "Pending"
    ).length;

  const approvedCount =
    volunteers.filter(
      (volunteer) =>
        volunteer.status === "Approved"
    ).length;

  const rejectedCount =
    rejectedVolunteers.length;

  const totalCount =
    volunteers.length +
    rejectedVolunteers.length;

  /* ==========================================
     DATE FORMAT
  ========================================== */

  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
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

  const statusBadge = (
    status: string | null
  ) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </span>
        );

      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-bold text-yellow-700">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  /* ==========================================
     FILTERED ACTIVE VOLUNTEERS
  ========================================== */

  const filteredVolunteers = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    /*
     * Rejected applications are handled
     * separately below.
     */

    if (filter === "Rejected") {
      return [];
    }

    return volunteers.filter(
      (volunteer) => {
        const matchesFilter =
          filter === "All" ||
          volunteer.status === filter;

        if (!matchesFilter) {
          return false;
        }

        if (!searchText) {
          return true;
        }

        return Boolean(
          volunteer.full_name
            ?.toLowerCase()
            .includes(searchText) ||
            volunteer.roll_number
              ?.toLowerCase()
              .includes(searchText) ||
            volunteer.college_email
              ?.toLowerCase()
              .includes(searchText) ||
            volunteer.department
              ?.toLowerCase()
              .includes(searchText) ||
            volunteer.course
              ?.toLowerCase()
              .includes(searchText)
        );
      }
    );
  }, [
    volunteers,
    search,
    filter,
  ]);

  /* ==========================================
     FILTERED REJECTED VOLUNTEERS
  ========================================== */

  const filteredRejectedVolunteers =
    useMemo(() => {
      if (filter !== "Rejected") {
        return [];
      }

      const searchText =
        search.trim().toLowerCase();

      if (!searchText) {
        return rejectedVolunteers;
      }

      return rejectedVolunteers.filter(
        (volunteer) => {
          return Boolean(
            volunteer.full_name
              ?.toLowerCase()
              .includes(searchText) ||
              volunteer.roll_number
                ?.toLowerCase()
                .includes(searchText) ||
              volunteer.college_email
                ?.toLowerCase()
                .includes(searchText) ||
              volunteer.rejection_reason
                ?.toLowerCase()
                .includes(searchText) ||
              volunteer.volunteer_data?.department
                ?.toLowerCase()
                .includes(searchText) ||
              volunteer.volunteer_data?.course
                ?.toLowerCase()
                .includes(searchText)
          );
        }
      );
    }, [
      rejectedVolunteers,
      search,
      filter,
    ]);

  /* ==========================================
     ALL FILTERED COUNT
  ========================================== */

  const filteredCount =
    filter === "Rejected"
      ? filteredRejectedVolunteers.length
      : filteredVolunteers.length;

  /* ==========================================
     PAGE
  ========================================== */

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="mx-auto max-w-7xl">

        {/* =================================
            HEADER
        ================================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-[#0F2B7B]">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage NSS volunteer applications,
              verification and profile acceptance.
            </p>

          </div>

          {/* Header Buttons */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                loadVolunteers(true)
              }
              disabled={
                refreshing ||
                loggingOut
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#143a96] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                className={`h-5 w-5 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}

            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <LogOut className="h-5 w-5" />

              {loggingOut
                ? "Logging out..."
                : "Logout"}

            </button>

          </div>

        </div>

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

            <p className="font-semibold">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadVolunteers(true)
              }
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>

          </div>
        )}

        {/* =================================
            STATISTICS
        ================================= */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Total Volunteers
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#0F2B7B]">
                  {totalCount}
                </h2>

              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-[#0F2B7B]">
                <Users className="h-6 w-6" />
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Pending
                </p>

                <h2 className="mt-2 text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </h2>

              </div>

              <div className="rounded-xl bg-yellow-100 p-3 text-yellow-700">
                <Clock className="h-6 w-6" />
              </div>

            </div>

          </div>

          {/* APPROVED */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Approved
                </p>

                <h2 className="mt-2 text-3xl font-bold text-green-600">
                  {approvedCount}
                </h2>

              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
              </div>

            </div>

          </div>

          {/* REJECTED */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Rejected
                </p>

                <h2 className="mt-2 text-3xl font-bold text-red-600">
                  {rejectedCount}
                </h2>

              </div>

              <div className="rounded-xl bg-red-100 p-3 text-red-700">
                <XCircle className="h-6 w-6" />
              </div>

            </div>

          </div>

        </div>

        {/* =================================
            VOLUNTEERS SECTION
        ================================= */}

        <section className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="border-b p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-2xl font-bold text-[#0F2B7B]">
                  Volunteer Applications
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review applications and manage volunteer profile acceptance.
                </p>

              </div>

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-sm">

                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search volunteers..."
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-[#0F2B7B] focus:ring-2 focus:ring-blue-100"
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
              ).map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-[#0F2B7B] text-white"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                  }`}
                >

                  {item}

                  <span className="ml-2">
                    {item === "Pending"
                      ? pendingCount
                      : item === "Approved"
                        ? approvedCount
                        : item === "Rejected"
                          ? rejectedCount
                          : totalCount}
                  </span>

                </button>

              ))}

            </div>

          </div>

          {/* =================================
              LOADING
          ================================= */}

          {loading ? (

            <div className="p-12 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-gray-500">
                Loading volunteer applications...
              </p>

            </div>

          ) : filteredCount === 0 ? (

            /* =================================
               EMPTY
            ================================= */

            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">

                {filter === "Rejected" ? (
                  <XCircle className="h-8 w-8 text-gray-400" />
                ) : (
                  <Users className="h-8 w-8 text-gray-400" />
                )}

              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-800">
                No volunteers found
              </h3>

              <p className="mt-2 text-sm text-gray-500">

                {search
                  ? "No applications match your search."
                  : `There are no ${filter.toLowerCase()} volunteer applications.`}

              </p>

            </div>

          ) : filter === "Rejected" ? (

            /* =================================
               REJECTED LIST
            ================================= */

            <div className="divide-y">

              {filteredRejectedVolunteers.map(
                (volunteer) => {

                  const volunteerData =
                    volunteer.volunteer_data;

                  return (
                    <div
                      key={volunteer.id}
                      className="p-6 transition hover:bg-red-50/40"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

                        {/* =================================
                            PROFILE
                        ================================= */}

                        <div className="flex min-w-0 flex-1 items-start gap-4">

                          {volunteerData?.photo_url ? (
                            <img
                              src={
                                volunteerData.photo_url
                              }
                              alt={
                                volunteer.full_name ||
                                "Volunteer"
                              }
                              className="h-16 w-16 shrink-0 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">
                              {volunteer.full_name
                                ?.charAt(0)
                                .toUpperCase() ||
                                "V"}
                            </div>
                          )}

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="font-bold text-gray-900">
                                {volunteer.full_name ||
                                  "Unnamed Volunteer"}
                              </h3>

                              {statusBadge(
                                "Rejected"
                              )}

                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              Roll No:{" "}
                              {volunteer.roll_number ||
                                "—"}
                            </p>

                            <p className="text-sm text-gray-500">

                              {volunteerData?.department ||
                                "—"}

                              {volunteerData?.course
                                ? ` • ${volunteerData.course}`
                                : ""}

                            </p>

                          </div>

                        </div>

                        {/* =================================
                            CONTACT
                        ================================= */}

                        <div className="min-w-[220px] text-sm text-gray-600">

                          <p className="truncate">
                            {volunteer.college_email ||
                              "No email"}
                          </p>

                          <p className="mt-1">
                            {volunteerData?.mobile_number ||
                              "No mobile"}
                          </p>

                        </div>

                        {/* =================================
                            REJECTION REASON
                        ================================= */}

                        <div className="w-full lg:max-w-md">

                          <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                            Rejection Reason
                          </p>

                          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4">

                            <p className="whitespace-pre-wrap text-sm leading-6 text-red-800">
                              {volunteer.rejection_reason ||
                                "No rejection reason recorded."}
                            </p>

                          </div>

                          <p className="mt-2 text-xs text-gray-400">

                            Rejected:{" "}
                            {formatDate(
                              volunteer.created_at
                            )}

                          </p>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            /* =================================
               ACTIVE VOLUNTEER LIST
            ================================= */

            <div className="divide-y">

              {filteredVolunteers.map(
                (volunteer) => (

                  <div
                    key={volunteer.id}
                    className="p-6 transition hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                      {/* VOLUNTEER */}

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        {volunteer.photo_url ? (
                          <img
                            src={
                              volunteer.photo_url
                            }
                            alt={
                              volunteer.full_name ||
                              "Volunteer"
                            }
                            className="h-16 w-16 shrink-0 rounded-full border object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#0F2B7B]">
                            {volunteer.full_name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "V"}
                          </div>
                        )}

                        <div className="min-w-0">

                          <h3 className="truncate font-bold text-gray-900">
                            {volunteer.full_name ||
                              "Unnamed Volunteer"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Roll No:{" "}
                            {volunteer.roll_number ||
                              "—"}
                          </p>

                          <p className="text-sm text-gray-500">

                            {volunteer.department ||
                              "—"}

                            {volunteer.course
                              ? ` • ${volunteer.course}`
                              : ""}

                          </p>

                        </div>

                      </div>

                      {/* CONTACT */}

                      <div className="min-w-[220px] text-sm text-gray-600">

                        <p className="truncate">
                          {volunteer.college_email ||
                            "No email"}
                        </p>

                        <p className="mt-1">
                          {volunteer.mobile_number ||
                            "No mobile"}
                        </p>

                      </div>

                      {/* DATE + STATUS */}

                      <div className="flex min-w-[130px] flex-col gap-2">

                        {statusBadge(
                          volunteer.status
                        )}

                        <p className="text-xs text-gray-400">

                          Applied:{" "}

                          {formatDate(
                            volunteer.created_at
                          )}

                        </p>

                      </div>

                      {/* VIEW */}

                      <Link
                        href={`/admin/volunteers/${volunteer.id}`}
                        className="rounded-xl bg-[#0F2B7B] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#143a96]"
                      >
                        Review Application
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}