"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  ExternalLink,
  FileText,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Certificate {
  id: string;
  title: string;
  description: string | null;
  certificate_number: string | null;
  issued_date: string;
  certificate_url: string | null;
  created_at: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    setError("");

    try {
      /* Get logged-in user */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to identify your account.");
        return;
      }

      /* Find volunteer profile */

      const {
        data: volunteer,
        error: volunteerError,
      } = await supabase
        .from("volunteers")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (volunteerError) {
        console.error(
          "Volunteer lookup error:",
          volunteerError
        );

        setError("Unable to load your volunteer profile.");
        return;
      }

      if (!volunteer) {
        setError("Volunteer profile not found.");
        return;
      }

      /* Load certificates belonging to this volunteer */

      const {
        data,
        error: certificateError,
      } = await supabase
        .from("certificates")
        .select(`
          id,
          title,
          description,
          certificate_number,
          issued_date,
          certificate_url,
          created_at
        `)
        .eq("volunteer_id", volunteer.id)
        .order("issued_date", {
          ascending: false,
        });

      if (certificateError) {
        console.error(
          "Certificate loading error:",
          certificateError
        );

        setError("Unable to load your certificates.");
        return;
      }

      setCertificates(
        (data || []) as Certificate[]
      );
    } catch (error) {
      console.error(
        "Certificates page error:",
        error
      );

      setError(
        "Something went wrong while loading your certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">

        {/* Page Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            My Certificates
          </h1>

          <p className="mt-2 text-gray-600">
            View the certificates you have earned as an NSS
            Volunteer.
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">

          <div className="mb-8 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Award size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0F2B7B]">
                Certificate History
              </h2>

              <p className="text-sm text-gray-500">
                Your official NSS certificates
              </p>
            </div>

          </div>

          {/* Loading */}

          {loading && (
            <div className="flex min-h-[250px] items-center justify-center">

              <div className="text-center">

                <RefreshCw
                  className="mx-auto animate-spin text-[#0F2B7B]"
                  size={32}
                />

                <p className="mt-3 text-gray-500">
                  Loading certificates...
                </p>

              </div>

            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

              <p className="font-semibold text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={loadCertificates}
                className="mt-4 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#183A96]"
              >
                Try Again
              </button>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            certificates.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">

                <Award
                  className="mx-auto text-gray-400"
                  size={48}
                />

                <h3 className="mt-4 font-semibold text-gray-700">
                  No certificates yet
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Certificates issued by the NSS administration
                  will appear here.
                </p>

              </div>
            )}

          {/* Certificates */}

          {!loading &&
            !error &&
            certificates.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">

                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="overflow-hidden rounded-2xl border transition hover:border-[#0F2B7B] hover:shadow-lg"
                  >

                    {/* Certificate Header */}

                    <div className="bg-[#0F2B7B] p-6 text-white">

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                          <Award size={26} />
                        </div>

                        <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                          Earned
                        </span>

                      </div>

                      <h3 className="mt-5 text-xl font-bold">
                        {certificate.title}
                      </h3>

                    </div>

                    {/* Certificate Details */}

                    <div className="p-6">

                      {certificate.description && (
                        <p className="leading-6 text-gray-600">
                          {certificate.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-3">

                        <div className="flex items-center gap-3 text-sm text-gray-600">

                          <CalendarDays
                            size={18}
                            className="text-[#0F2B7B]"
                          />

                          <span>
                            Issued:{" "}
                            <strong>
                              {formatDate(
                                certificate.issued_date
                              )}
                            </strong>
                          </span>

                        </div>

                        {certificate.certificate_number && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">

                            <FileText
                              size={18}
                              className="text-[#0F2B7B]"
                            />

                            <span className="break-all">
                              Certificate No:{" "}
                              <strong>
                                {
                                  certificate.certificate_number
                                }
                              </strong>
                            </span>

                          </div>
                        )}

                      </div>

                      {/* View Certificate */}

                      {certificate.certificate_url ? (
                        <a
                          href={certificate.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#183A96]"
                        >
                          View Certificate
                          <ExternalLink size={18} />
                        </a>
                      ) : (
                        <div className="mt-6 rounded-xl bg-gray-100 px-5 py-3 text-center text-sm font-medium text-gray-500">
                          Certificate file not uploaded yet
                        </div>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

        </div>

      </section>
    </DashboardLayout>
  );
}