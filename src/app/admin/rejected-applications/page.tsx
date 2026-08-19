"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  XCircle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface RejectedApplication {
  id: string;
  volunteer_id: string | null;
  college_email: string;
  full_name: string | null;
  roll_number: string | null;
  rejection_reason: string;
  rejected_at: string;
  rejected_by: string | null;
  volunteer_data: Record<string, any> | null;
  created_at: string;
}

export default function RejectedApplicationsPage() {
  const [applications, setApplications] = useState<
    RejectedApplication[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRejectedApplications();
  }, []);

  const loadRejectedApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("volunteer_rejections")
        .select("*")
        .order("rejected_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Rejected applications error:",
          error
        );

        setError(
          `Unable to load rejected applications: ${error.message}`
        );

        return;
      }

      setApplications(data || []);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while loading rejected applications."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#0F2B7B]">
              Rejected Applications
            </h1>

            <p className="mt-1 text-gray-500">
              View applications that were rejected and
              review their complete saved information.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRejectedApplications}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F2B7B] bg-white px-5 py-3 font-semibold text-[#0F2B7B] hover:bg-[#0F2B7B] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">

              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-bold">
                  Unable to load rejected applications
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

            <p className="mt-4 text-gray-600">
              Loading rejected applications...
            </p>

          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading &&
          !error &&
          applications.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

              <XCircle className="mx-auto h-12 w-12 text-gray-400" />

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                No rejected applications
              </h2>

              <p className="mt-2 text-gray-500">
                Rejected applications will appear here.
              </p>

            </div>
          )}

        {/* ==========================================
            APPLICATIONS
        ========================================== */}

        {!loading &&
          applications.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead className="bg-[#0F2B7B] text-white">

                    <tr>

                      <th className="px-5 py-4 text-left text-sm font-bold">
                        Name
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-bold">
                        Roll Number
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-bold">
                        College Email
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-bold">
                        Rejection Reason
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-bold">
                        Rejected At
                      </th>

                      <th className="px-5 py-4 text-center text-sm font-bold">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-200">

                    {applications.map(
                      (application) => (
                        <tr
                          key={application.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* NAME */}

                          <td className="px-5 py-5">

                            <p className="font-bold text-gray-900">
                              {application.full_name ||
                                application
                                  .volunteer_data
                                  ?.full_name ||
                                "Unnamed"}
                            </p>

                          </td>

                          {/* ROLL NUMBER */}

                          <td className="px-5 py-5 text-gray-700">

                            {application.roll_number ||
                              application
                                .volunteer_data
                                ?.roll_number ||
                              "—"}

                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-5 text-gray-700">

                            {application.college_email ||
                              application
                                .volunteer_data
                                ?.college_email ||
                              "—"}

                          </td>

                          {/* REASON */}

                          <td className="max-w-xs px-5 py-5">

                            <p
                              className="line-clamp-2 text-sm text-gray-700"
                              title={
                                application.rejection_reason
                              }
                            >
                              {application.rejection_reason}
                            </p>

                          </td>

                          {/* DATE */}

                          <td className="px-5 py-5 text-sm text-gray-600">

                            {formatDate(
                              application.rejected_at
                            )}

                          </td>

                          {/* VIEW */}

                          <td className="px-5 py-5 text-center">

                            <Link
                              href={`/admin/rejected-applications/${application.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#143a96]"
                            >

                              <Eye className="h-4 w-4" />

                              View Application

                            </Link>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        {/* ==========================================
            FOOTER
        ========================================== */}

        {!loading &&
          applications.length > 0 && (
            <div className="mt-5 text-sm text-gray-500">
              Total rejected applications:{" "}
              <strong className="text-gray-800">
                {applications.length}
              </strong>
            </div>
          )}

      </div>
    </main>
  );
}

/* ==========================================
   DATE FORMAT
========================================== */

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}