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
} from "lucide-react";

import { supabase } from "@/lib/supabase";

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

type FilterType = "All" | "Pending" | "Approved" | "Rejected";

export default function AdminPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("Pending");

  const [error, setError] = useState("");

  /* --------------------------------
     Load Volunteers
  -------------------------------- */

  const loadVolunteers = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const { data, error } = await supabase
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

      if (error) {
        console.error(
          "Failed to load volunteers:",
          error
        );

        setError(
          "Unable to load volunteer applications. Please try again."
        );

        setVolunteers([]);
        return;
      }

      setVolunteers(data || []);
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

  /* --------------------------------
     Initial Load
  -------------------------------- */

  useEffect(() => {
    loadVolunteers();
  }, []);

  /* --------------------------------
     Statistics
  -------------------------------- */

  const pendingCount = volunteers.filter(
    (volunteer) =>
      volunteer.status === "Pending"
  ).length;

  const approvedCount = volunteers.filter(
    (volunteer) =>
      volunteer.status === "Approved"
  ).length;

  const rejectedCount = volunteers.filter(
    (volunteer) =>
      volunteer.status === "Rejected"
  ).length;

  /* --------------------------------
     Search + Filter
  -------------------------------- */

  const filteredVolunteers = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return volunteers.filter((volunteer) => {
      const matchesFilter =
        filter === "All" ||
        volunteer.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      return (
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
    });
  }, [volunteers, search, filter]);

  /* --------------------------------
     Date Formatting
  -------------------------------- */

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

  /* --------------------------------
     Status Badge
  -------------------------------- */

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

          <button
            type="button"
            onClick={() => loadVolunteers(true)}
            disabled={refreshing}
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
              : "Refresh Applications"}
          </button>

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

          {/* Total */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Volunteers
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#0F2B7B]">
                  {volunteers.length}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 text-[#0F2B7B]">
                <Users className="h-6 w-6" />
              </div>

            </div>
          </div>

          {/* Pending */}

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

          {/* Approved */}

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

          {/* Rejected */}

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

          {/* Section Header */}

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

              {/* Search */}

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

            {/* Filters */}

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

                  {item === "Pending" && (
                    <span className="ml-2">
                      {pendingCount}
                    </span>
                  )}

                  {item === "Approved" && (
                    <span className="ml-2">
                      {approvedCount}
                    </span>
                  )}

                  {item === "Rejected" && (
                    <span className="ml-2">
                      {rejectedCount}
                    </span>
                  )}

                  {item === "All" && (
                    <span className="ml-2">
                      {volunteers.length}
                    </span>
                  )}
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
          ) : filteredVolunteers.length === 0 ? (

            /* =================================
               EMPTY
            ================================= */

            <div className="p-12 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-gray-400" />
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
          ) : (

            /* =================================
               VOLUNTEER LIST
            ================================= */

            <div className="divide-y">

              {filteredVolunteers.map(
                (volunteer) => (

                  <div
                    key={volunteer.id}
                    className="p-6 transition hover:bg-slate-50"
                  >

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                      {/* Volunteer */}

                      <div className="flex min-w-0 flex-1 items-center gap-4">

                        {volunteer.photo_url ? (
                          <img
                            src={volunteer.photo_url}
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

                      {/* Contact */}

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

                      {/* Date + Status */}

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

                      {/* View */}

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