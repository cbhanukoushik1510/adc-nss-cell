"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Award,
  Calendar,
  ExternalLink,
  Mail,
  RefreshCw,
  Search,
  User,
  AlertCircle,
  FileText,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

interface Volunteer {
  id: string;
  full_name: string | null;
  roll_number: string | null;
  college_email: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  volunteer_id: string | null;
}

interface Certificate {
  id: string;
  volunteer_id: string | null;
  title: string | null;
  description: string | null;
  certificate_number: string | null;
  issued_date: string | null;
  certificate_url: string | null;
  created_at: string | null;
  volunteer: Volunteer | null;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<
    Certificate[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = useCallback(
    (value: string | null) => {
      if (!value) return "—";

      const date = new Date(
        value.includes("T")
          ? value
          : `${value}T00:00:00`
      );

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
    []
  );

  // ============================================================
  // LOAD CERTIFICATES
  // ============================================================

  const loadCertificates = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /*
         * IMPORTANT
         *
         * We only request columns that were confirmed from
         * the certificates structure.
         *
         * DO NOT request:
         *   volunteers_id
         *   certed_by
         *
         * because those columns do not exist in your database.
         */

        const {
          data,
          error: certificatesError,
        } = await supabase
          .from("certificates")
          .select(`
            id,
            volunteer_id,
            title,
            description,
            certificate_number,
            issued_date,
            certificate_url,
            created_at,
            volunteer:volunteers (
              id,
              full_name,
              roll_number,
              college_email,
              department,
              course,
              year,
              volunteer_id
            )
          `)
          .order("created_at", {
            ascending: false,
          });

        if (certificatesError) {
          console.error(
            "Certificates loading error:",
            certificatesError
          );

          throw new Error(
            certificatesError.message ||
              "Unable to load certificates."
          );
        }

        const formattedCertificates: Certificate[] =
          (data || []).map(
            (certificate: any) => ({
              id: certificate.id,
              volunteer_id:
                certificate.volunteer_id ?? null,
              title:
                certificate.title ?? null,
              description:
                certificate.description ?? null,
              certificate_number:
                certificate.certificate_number ??
                null,
              issued_date:
                certificate.issued_date ?? null,
              certificate_url:
                certificate.certificate_url ??
                null,
              created_at:
                certificate.created_at ?? null,
              volunteer:
                Array.isArray(
                  certificate.volunteer
                )
                  ? certificate.volunteer[0] ||
                    null
                  : certificate.volunteer ||
                    null,
            })
          );

        setCertificates(
          formattedCertificates
        );
      } catch (err) {
        console.error(
          "Certificates loading error:",
          err
        );

        setCertificates([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load certificates."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredCertificates = useMemo(() => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return certificates;
    }

    return certificates.filter(
      (certificate) => {
        const volunteer =
          certificate.volunteer;

        return [
          certificate.title,
          certificate.description,
          certificate.certificate_number,
          certificate.volunteer_id,
          certificate.issued_date,

          volunteer?.full_name,
          volunteer?.roll_number,
          volunteer?.college_email,
          volunteer?.department,
          volunteer?.course,
          volunteer?.year,
          volunteer?.volunteer_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(text);
      }
    );
  }, [certificates, search]);

  // ============================================================
  // TOTAL
  // ============================================================

  const totalCertificates =
    certificates.length;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <AdminDashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0F2B7B]">
              <Award className="h-6 w-6" />
            </div>

            <div className="min-w-0">

              <h1 className="text-2xl font-bold text-[#0F2B7B] sm:text-3xl">
                Certificates
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View certificates issued to volunteers.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              loadCertificates(true)
            }
            disabled={refreshing}
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

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

              <div>

                <h2 className="font-bold text-red-800">
                  Unable to Load Certificates
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <section className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">
                <Award className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Total Certificates
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F2B7B]">
                  {totalCertificates}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <User className="h-5 w-5" />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  Displayed
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {
                    filteredCertificates.length
                  }
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">

          <div className="relative max-w-xl">

            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search certificate, volunteer, roll number..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-[#0F2B7B] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </section>

        {/* ======================================================
            CERTIFICATE TABLE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          <div className="border-b border-slate-200 p-5">

            <h2 className="text-xl font-bold text-[#0F2B7B]">
              Issued Certificates
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredCertificates.length} certificate
              {filteredCertificates.length === 1
                ? ""
                : "s"} found.
            </p>

          </div>

          {loading ? (
            <div className="p-14 text-center">

              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading certificates...
              </p>

            </div>
          ) : filteredCertificates.length ===
            0 ? (
            <div className="p-14 text-center">

              <Award className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 text-lg font-bold text-gray-800">
                No certificates found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {search
                  ? "No certificates match your search."
                  : "No certificates have been issued yet."}
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Certificate
                    </th>

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
                      Certificate Number
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Issued Date
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Certificate
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredCertificates.map(
                    (certificate) => {
                      const volunteer =
                        certificate.volunteer;

                      return (
                        <tr
                          key={
                            certificate.id
                          }
                          className="transition hover:bg-slate-50"
                        >

                          {/* CERTIFICATE TITLE */}

                          <td className="px-5 py-5">

                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0F2B7B]">

                                <FileText className="h-5 w-5" />

                              </div>

                              <div className="min-w-0">

                                <p className="font-bold text-gray-900">
                                  {certificate.title ||
                                    "Certificate"}
                                </p>

                                {certificate.description && (
                                  <p className="mt-1 max-w-[280px] truncate text-xs text-gray-500">
                                    {
                                      certificate.description
                                    }
                                  </p>
                                )}

                              </div>

                            </div>

                          </td>

                          {/* VOLUNTEER */}

                          <td className="px-5 py-5">

                            {volunteer ? (
                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-[#0F2B7B]">

                                  {(
                                    volunteer.full_name ||
                                    "V"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div className="min-w-0">

                                  <p className="font-bold text-gray-900">
                                    {
                                      volunteer.full_name ||
                                      "—"
                                    }
                                  </p>

                                  {volunteer.college_email && (
                                    <div className="mt-1 flex items-center gap-1.5">

                                      <Mail className="h-3.5 w-3.5 text-gray-400" />

                                      <span className="max-w-[220px] truncate text-xs text-gray-500">
                                        {
                                          volunteer.college_email
                                        }
                                      </span>

                                    </div>
                                  )}

                                </div>

                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Volunteer profile unavailable
                              </span>
                            )}

                          </td>

                          {/* ROLL NUMBER */}

                          <td className="px-5 py-5">

                            <span className="font-semibold text-gray-800">
                              {volunteer?.roll_number ||
                                "—"}
                            </span>

                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-5 py-5">

                            <div>

                              <p className="text-sm font-semibold text-gray-700">
                                {volunteer?.department ||
                                  "—"}
                              </p>

                              {volunteer?.course && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {
                                    volunteer.course
                                  }
                                  {volunteer.year
                                    ? ` • Year ${volunteer.year}`
                                    : ""}
                                </p>
                              )}

                            </div>

                          </td>

                          {/* CERTIFICATE NUMBER */}

                          <td className="px-5 py-5">

                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-gray-700">
                              {
                                certificate.certificate_number ||
                                "—"
                              }
                            </span>

                          </td>

                          {/* ISSUED DATE */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-2">

                              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />

                              <span className="text-sm font-semibold text-gray-700">
                                {formatDate(
                                  certificate.issued_date
                                )}
                              </span>

                            </div>

                          </td>

                          {/* OPEN CERTIFICATE */}

                          <td className="px-5 py-5">

                            {certificate.certificate_url ? (
                              <a
                                href={
                                  certificate.certificate_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#143a96]"
                              >

                                <ExternalLink className="h-4 w-4" />

                                Open

                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not available
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

      </div>
    </AdminDashboardLayout>
  );
}