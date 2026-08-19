"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
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

export default function RejectedApplicationDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const [application, setApplication] =
    useState<RejectedApplication | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (id) {
      loadRejectedApplication();
    }
  }, [id]);

  const loadRejectedApplication = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } =
        await supabase
          .from("volunteer_rejections")
          .select("*")
          .eq("id", id)
          .single();

      if (error) {
        console.error(
          "Rejected application load error:",
          error
        );

        setError(
          `Unable to load rejected application: ${error.message}`
        );

        return;
      }

      setApplication(data);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while loading the rejected application."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center shadow">

          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

          <p className="mt-4 text-gray-600">
            Loading rejected application...
          </p>

        </div>
      </main>
    );
  }

  /* ==========================================
     ERROR / NOT FOUND
  ========================================== */

  if (!application) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center shadow">

          <XCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-xl font-bold text-red-600">
            Rejected application not found
          </h1>

          {error && (
            <p className="mt-3 text-sm text-gray-600">
              {error}
            </p>
          )}

          <Link
            href="/admin/rejected-applications"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rejected Applications
          </Link>

        </div>
      </main>
    );
  }

  /* ==========================================
     COMPLETE SAVED APPLICATION
  ========================================== */

  const volunteer =
    application.volunteer_data || {};

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6">

          <Link
            href="/admin/rejected-applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rejected Applications
          </Link>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-[#0F2B7B]">
                Rejected Volunteer Application
              </h1>

              <p className="mt-1 text-gray-500">
                Complete application data saved at the time of rejection.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-100 px-5 py-2.5 text-sm font-bold text-red-700">
              <XCircle className="h-5 w-5" />
              Rejected
            </span>

          </div>

        </div>

        {/* REJECTION INFORMATION */}

        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">

          <h2 className="text-xl font-bold text-red-800">
            Rejection Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <Info
              label="Rejection Reason"
              value={application.rejection_reason}
            />

            <Info
              label="Rejected At"
              value={formatDate(application.rejected_at)}
            />

            <Info
              label="College Email"
              value={application.college_email}
            />

            <Info
              label="Rejected Record ID"
              value={application.id}
            />

          </div>

        </section>

        {/* PROFILE HEADER */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {volunteer.photo_url ? (
              <img
                src={volunteer.photo_url}
                alt={volunteer.full_name || "Volunteer"}
                className="h-32 w-32 rounded-2xl border object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-blue-100 text-4xl font-bold text-[#0F2B7B]">
                {volunteer.full_name
                  ?.charAt(0)
                  .toUpperCase() || "V"}
              </div>
            )}

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                {volunteer.full_name || "Unnamed Volunteer"}
              </h2>

              <p className="mt-2 text-gray-600">
                Roll Number: {volunteer.roll_number || "—"}
              </p>

              <p className="text-gray-600">
                {volunteer.department || "—"}

                {volunteer.course
                  ? ` • ${volunteer.course}`
                  : ""}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                College Email:{" "}
                {volunteer.college_email || "—"}
              </p>

            </div>

          </div>

        </section>

        {/* PERSONAL INFORMATION */}

        <InfoSection title="Personal Information">

          <Info label="Full Name" value={volunteer.full_name} />

          <Info label="Roll Number" value={volunteer.roll_number} />

          <Info
            label="Hall Ticket Number"
            value={volunteer.hall_ticket_number}
          />

          <Info
            label="Date of Birth"
            value={volunteer.date_of_birth}
          />

          <Info label="Gender" value={volunteer.gender} />

          <Info
            label="Blood Group"
            value={volunteer.blood_group}
          />

        </InfoSection>

        {/* ACADEMIC */}

        <InfoSection title="Academic Information">

          <Info
            label="Department"
            value={volunteer.department}
          />

          <Info
            label="Course"
            value={volunteer.course}
          />

          <Info label="Year" value={volunteer.year} />

          <Info
            label="Semester"
            value={volunteer.semester}
          />

          <Info
            label="Section"
            value={volunteer.section}
          />

          <Info
            label="Academic Year"
            value={volunteer.academic_year}
          />

          <Info
            label="College ID"
            value={volunteer.college_id}
          />

          <Info
            label="Admission Number"
            value={volunteer.admission_number}
          />

        </InfoSection>

        {/* CONTACT */}

        <InfoSection title="Contact Information">

          <Info
            label="College Email"
            value={volunteer.college_email}
          />

          <Info
            label="Personal Email"
            value={volunteer.personal_email}
          />

          <Info
            label="Mobile Number"
            value={volunteer.mobile_number}
          />

          <Info
            label="WhatsApp Number"
            value={volunteer.whatsapp_number}
          />

          <Info
            label="Emergency Contact"
            value={volunteer.emergency_contact_name}
          />

          <Info
            label="Emergency Number"
            value={volunteer.emergency_contact_number}
          />

          <Info label="City" value={volunteer.city} />

          <Info label="State" value={volunteer.state} />

          <Info
            label="Pincode"
            value={volunteer.pincode}
          />

          <div className="md:col-span-2">
            <Info
              label="Address"
              value={volunteer.address}
            />
          </div>

        </InfoSection>

        {/* NSS */}

        <InfoSection title="NSS Information">

          <Info
            label="NSS Unit"
            value={volunteer.nss_unit}
          />

          <Info
            label="Skills"
            value={volunteer.skills}
          />

          <Info
            label="Languages Known"
            value={volunteer.languages_known}
          />

          <Info
            label="Previous Volunteer Experience"
            value={volunteer.previous_volunteer_experience}
          />

          <Info
            label="Why Join NSS?"
            value={volunteer.why_join_nss}
          />

          <Info
            label="Availability"
            value={volunteer.availability}
          />

          <Info
            label="Areas of Interest"
            value={
              Array.isArray(volunteer.areas_of_interest)
                ? volunteer.areas_of_interest.join(", ")
                : volunteer.areas_of_interest
            }
          />

        </InfoSection>

        {/* MEDICAL */}

        <InfoSection title="Medical Information">

          <Info
            label="Height"
            value={volunteer.height}
          />

          <Info
            label="Weight"
            value={volunteer.weight}
          />

          <Info
            label="Medical Condition"
            value={volunteer.medical_condition}
          />

          <Info
            label="Allergies"
            value={volunteer.allergies}
          />

          <Info
            label="Regular Medication"
            value={volunteer.regular_medication}
          />

        </InfoSection>

        {/* DECLARATION */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-bold text-[#0F2B7B]">
            Declaration
          </h2>

          <div
            className={`rounded-xl p-4 font-semibold ${
              volunteer.declaration_accepted
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {volunteer.declaration_accepted
              ? "✓ Declaration accepted by volunteer"
              : "✕ Declaration not accepted"}
          </div>

        </section>

        {/* SYSTEM INFORMATION */}

        <InfoSection title="Application Information">

          <Info
            label="Application ID"
            value={volunteer.id}
          />

          <Info
            label="Application Status"
            value={volunteer.status}
          />

          <Info
            label="Verification Status"
            value={volunteer.verification_status}
          />

          <Info
            label="Role"
            value={volunteer.role}
          />

          <Info
            label="Created At"
            value={formatDate(volunteer.created_at)}
          />

          <Info
            label="Updated At"
            value={formatDate(volunteer.updated_at)}
          />

        </InfoSection>

        {/* BACK */}

        <div className="mt-8 pb-8">

          <Link
            href="/admin/rejected-applications"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B] px-6 py-3 font-semibold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rejected Applications
          </Link>

        </div>

      </div>

    </main>
  );
}

/* ==========================================
   INFO SECTION
========================================== */

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

      <h2 className="mb-5 text-xl font-bold text-[#0F2B7B]">
        {title}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {children}
      </div>

    </section>
  );
}

/* ==========================================
   INFO
========================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap break-words font-semibold text-gray-900">
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? String(value)
          : "—"}
      </p>

    </div>
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