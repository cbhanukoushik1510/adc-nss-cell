"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Clock,
  XCircle,
  RefreshCw,
  ArrowRight,
  ClipboardList,
  CalendarDays,
  Award,
  Megaphone,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

/* =========================================================
   TYPES
========================================================= */

interface Volunteer {
  id: string;
  volunteer_id: string | null;
  full_name: string;
  roll_number: string | null;
  department: string | null;
  course: string | null;
  status: string | null;
  photo_url: string | null;
  created_at: string | null;
}

interface Rejection {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  created_at: string | null;
}

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (
  status: string | null | undefined
) => {
  return status?.trim().toLowerCase() || "pending";
};

const formatDate = (
  value: string | null
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (
  value: string | null
) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  valueClass: string;
  href?: string;
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-slate-50 opacity-60 blur-2xl" />

      <div className="relative flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p
            className={`mt-3 text-3xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      {href && (
        <div className="relative mt-5 flex items-center gap-1 text-xs font-semibold text-[#0F2B7B]">
          View details
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </div>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B] transition group-hover:bg-[#0F2B7B] group-hover:text-white">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]" />
    </Link>
  );
}

/* =========================================================
   STATUS ROW
========================================================= */

function StatusRow({
  label,
  count,
  total,
  icon,
  barClass,
  iconClass,
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  barClass: string;
  iconClass: string;
}) {
  const percentage =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <div className="space-y-3">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </div>

          <span className="text-sm font-semibold text-slate-700">
            {label}
          </span>

        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-slate-800">
            {count}
          </span>

          <span className="ml-2 text-xs text-slate-400">
            {percentage}%
          </span>
        </div>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminDashboardPage() {

  const [volunteers, setVolunteers] =
    useState<Volunteer[]>([]);

  const [rejections, setRejections] =
    useState<Rejection[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard = async (
    refresh = false
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {

      /* ================================================
         VOLUNTEERS
      ================================================= */

      const {
        data: volunteerData,
        error: volunteerError,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          volunteer_id,
          full_name,
          roll_number,
          department,
          course,
          status,
          photo_url,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (volunteerError) {
        throw new Error(
          volunteerError.message
        );
      }

      /* ================================================
         REJECTIONS
      ================================================= */

      const {
        data: rejectionData,
        error: rejectionError,
      } = await supabase
        .from("volunteer_rejections")
        .select(`
          id,
          full_name,
          roll_number,
          rejection_reason,
          rejected_at,
          created_at
        `)
        .order("rejected_at", {
          ascending: false,
        });

      if (rejectionError) {
        throw new Error(
          rejectionError.message
        );
      }

      setVolunteers(
        (volunteerData ||
          []) as Volunteer[]
      );

      setRejections(
        (rejectionData ||
          []) as Rejection[]
      );

    } catch (err) {

      console.error(
        "Admin dashboard error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
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
    loadDashboard();
  }, []);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {

    let pending = 0;
    let approved = 0;

    volunteers.forEach(
      (volunteer) => {

        const status =
          normalizeStatus(
            volunteer.status
          );

        if (status === "approved") {
          approved++;
        } else if (
          status !== "rejected"
        ) {
          pending++;
        }
      }
    );

    return {
      total:
        volunteers.length +
        rejections.length,

      active:
        volunteers.length,

      pending,

      approved,

      rejected:
        rejections.length,
    };

  }, [
    volunteers,
    rejections,
  ]);

  /* =======================================================
     RECENT APPLICATIONS
  ======================================================= */

  const recentApplications =
    useMemo(() => {

      const active = volunteers.map(
        (volunteer) => ({
          id: volunteer.id,
          name:
            volunteer.full_name ||
            "Unnamed Volunteer",
          roll:
            volunteer.roll_number ||
            "—",
          department:
            volunteer.department ||
            "Department not specified",
          status:
            normalizeStatus(
              volunteer.status
            ),
          date:
            volunteer.created_at,
          photo:
            volunteer.photo_url,
          rejected: false,
        })
      );

      const rejected =
        rejections.map(
          (rejection) => ({
            id:
              `rejected-${rejection.id}`,
            name:
              rejection.full_name ||
              "Unnamed Volunteer",
            roll:
              rejection.roll_number ||
              "—",
            department:
              "Application Rejected",
            status: "rejected",
            date:
              rejection.rejected_at ||
              rejection.created_at,
            photo: null,
            rejected: true,
          })
        );

      return [
        ...active,
        ...rejected,
      ]
        .sort((a, b) => {
          const aTime =
            new Date(
              a.date || 0
            ).getTime();

          const bTime =
            new Date(
              b.date || 0
            ).getTime();

          return bTime - aTime;
        })
        .slice(0, 6);

    }, [
      volunteers,
      rejections,
    ]);

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const statusBadge = (
    status: string
  ) => {

    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-bold text-yellow-700">
        <Clock className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <AdminDashboardLayout>

      <div className="mx-auto w-full max-w-7xl space-y-7">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-[#0F2B7B] px-6 py-7 text-white shadow-lg sm:px-8">

          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 right-32 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                <Activity className="h-3.5 w-3.5" />
                NSS Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Monitor volunteer applications,
                approved volunteers, events and
                NSS activities from one place.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0F2B7B] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">

              <p className="font-bold">
                Dashboard data could not be loaded.
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadDashboard(true)
                }
                className="mt-3 text-sm font-bold underline"
              >
                Try again
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            MAIN STATS
        ================================================= */}

        {loading ? (

          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 shadow-sm">

            <div className="text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-slate-500">
                Loading dashboard...
              </p>

            </div>

          </div>

        ) : (

          <>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Applications"
                value={counts.total}
                description="All submitted applications"
                icon={
                  <Users className="h-6 w-6" />
                }
                iconClass="bg-blue-50 text-[#0F2B7B]"
                valueClass="text-[#0F2B7B]"
                href="/admin/volunteers"
              />

              <StatCard
                title="Pending Applications"
                value={counts.pending}
                description="Waiting for admin review"
                icon={
                  <Clock className="h-6 w-6" />
                }
                iconClass="bg-yellow-50 text-yellow-700"
                valueClass="text-yellow-600"
                href="/admin/volunteers"
              />

              <StatCard
                title="Approved Volunteers"
                value={counts.approved}
                description="Currently approved"
                icon={
                  <UserCheck className="h-6 w-6" />
                }
                iconClass="bg-green-50 text-green-700"
                valueClass="text-green-600"
                href="/admin/volunteers"
              />

              <StatCard
                title="Rejected Applications"
                value={counts.rejected}
                description="Applications rejected"
                icon={
                  <XCircle className="h-6 w-6" />
                }
                iconClass="bg-red-50 text-red-700"
                valueClass="text-red-600"
                href="/admin/volunteers"
              />

            </div>

            {/* =================================================
                SECOND ROW
            ================================================= */}

            <div className="grid gap-6 xl:grid-cols-3">

              {/* ===============================================
                  APPLICATION OVERVIEW
              =============================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                <div className="flex items-start justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0F2B7B]">
                        <TrendingUp className="h-5 w-5" />
                      </div>

                      <h2 className="text-lg font-bold text-slate-800">
                        Application Overview
                      </h2>

                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Current application distribution.
                    </p>

                  </div>

                  <Link
                    href="/admin/volunteers"
                    className="hidden items-center gap-1 text-sm font-semibold text-[#0F2B7B] hover:underline sm:flex"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>

                <div className="mt-7 space-y-6">

                  <StatusRow
                    label="Approved"
                    count={counts.approved}
                    total={counts.total}
                    icon={
                      <CheckCircle2 className="h-4 w-4" />
                    }
                    iconClass="bg-green-50 text-green-700"
                    barClass="bg-green-500"
                  />

                  <StatusRow
                    label="Pending"
                    count={counts.pending}
                    total={counts.total}
                    icon={
                      <Clock className="h-4 w-4" />
                    }
                    iconClass="bg-yellow-50 text-yellow-700"
                    barClass="bg-yellow-500"
                  />

                  <StatusRow
                    label="Rejected"
                    count={counts.rejected}
                    total={counts.total}
                    icon={
                      <XCircle className="h-4 w-4" />
                    }
                    iconClass="bg-red-50 text-red-700"
                    barClass="bg-red-500"
                  />

                </div>

              </section>

              {/* ===============================================
                  QUICK ACTIONS
              =============================================== */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0F2B7B]">
                      <ClipboardList className="h-5 w-5" />
                    </div>

                    <h2 className="text-lg font-bold text-slate-800">
                      Quick Actions
                    </h2>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Quickly access common admin tasks.
                  </p>

                </div>

                <div className="mt-5 space-y-3">

                  <QuickAction
                    title="Review Applications"
                    description="Review pending and rejected applications"
                    icon={
                      <ClipboardList className="h-5 w-5" />
                    }
                    href="/admin/volunteers"
                  />

                  <QuickAction
                    title="Manage Volunteers"
                    description="View approved volunteer profiles"
                    icon={
                      <Users className="h-5 w-5" />
                    }
                    href="/admin/volunteers"
                  />

                  <QuickAction
                    title="Manage Events"
                    description="Create and manage NSS events"
                    icon={
                      <CalendarDays className="h-5 w-5" />
                    }
                    href="/admin/events"
                  />

                  <QuickAction
                    title="Certificates"
                    description="Manage volunteer certificates"
                    icon={
                      <Award className="h-5 w-5" />
                    }
                    href="/admin/certificates"
                  />

                </div>

              </section>

            </div>

            {/* =================================================
                RECENT APPLICATIONS
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Recent Applications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest volunteer application activity.
                  </p>

                </div>

                <Link
                  href="/admin/volunteers"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F2B7B] hover:underline"
                >
                  View all applications
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

              {recentApplications.length === 0 ? (

                <div className="p-12 text-center">

                  <Users className="mx-auto h-10 w-10 text-slate-300" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No applications yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    New volunteer applications will appear here.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {recentApplications.map(
                    (application) => (

                      <div
                        key={application.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="flex min-w-0 items-center gap-4">

                          {application.photo ? (

                            <img
                              src={
                                application.photo
                              }
                              alt={
                                application.name
                              }
                              className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover"
                            />

                          ) : (

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0F2B7B]">
                              {application.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                          )}

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <p className="truncate font-bold text-slate-800">
                                {application.name}
                              </p>

                              {statusBadge(
                                application.status
                              )}

                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              Roll No:{" "}
                              {application.roll}
                              {" • "}
                              {application.department}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-5 sm:justify-end">

                          <div className="text-right">

                            <p className="text-xs text-slate-400">
                              {formatDate(
                                application.date
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatTime(
                                application.date
                              )}
                            </p>

                          </div>

                          <Link
                            href={
                              application.rejected
                                ? `/admin/volunteers`
                                : `/admin/volunteers/${application.id}`
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#0F2B7B] hover:text-white"
                          >
                            View
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

            {/* =================================================
                ADMIN MODULES
            ================================================= */}

            <section>

              <div className="mb-4">

                <h2 className="text-lg font-bold text-slate-800">
                  Administration
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage the different parts of the NSS portal.
                </p>

              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Link
                  href="/admin/events"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <CalendarDays className="h-6 w-6 text-[#0F2B7B]" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    Events
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Manage NSS events and schedules.
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]" />

                </Link>

                <Link
                  href="/admin/attendance"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <ClipboardList className="h-6 w-6 text-[#0F2B7B]" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    Attendance
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Track volunteer attendance.
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]" />

                </Link>

                <Link
                  href="/admin/certificates"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <Award className="h-6 w-6 text-[#0F2B7B]" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    Certificates
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Manage NSS certificates.
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]" />

                </Link>

                <Link
                  href="/admin/announcements"
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >

                  <Megaphone className="h-6 w-6 text-[#0F2B7B]" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    Announcements
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Publish NSS announcements.
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#0F2B7B]" />

                </Link>

              </div>

            </section>

          </>
        )}

      </div>

    </AdminDashboardLayout>
  );
}