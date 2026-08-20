"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Volunteer {
  id: string;

  auth_user_id?: string | null;

  full_name: string | null;
  roll_number: string | null;
  hall_ticket_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;

  department: string | null;
  course: string | null;
  year: string | null;
  semester: string | null;
  section: string | null;
  academic_year: string | null;
  college_id: string | null;
  admission_number: string | null;

  college_email: string | null;
  personal_email: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;

  emergency_contact_name: string | null;
  emergency_contact_number: string | null;

  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  nss_unit: string | null;
  skills: string | null;
  languages_known: string | null;
  previous_volunteer_experience: string | null;
  why_join_nss: string | null;
  areas_of_interest: string[] | null;
  availability: string | null;

  height: string | null;
  weight: string | null;
  medical_condition: string | null;
  allergies: string | null;
  regular_medication: string | null;

  declaration_accepted: boolean | null;

  photo_url: string | null;

  status: string | null;
  role: string | null;

  service_hours: number | null;
  attendance_percentage: number | null;
  certificates_count: number | null;

  verification_status: string | null;

  volunteer_id: string | null;

  created_at: string | null;
  updated_at: string | null;

  approved_at: string | null;
  approved_by: string | null;
}

/* =========================================================
   NSS ID GENERATOR
   =========================================================

   Supported roll numbers:

   1051-23-861-010
   105123861010

   After removing "-", both become:

   105123861010

   Position:
   1 0 5 1 2 3 8 6 1 0 1 0
           ----
            23

   Year = characters 5-6 = 23
   Last 3 digits = 010

   Example:

   ADC-NSS-23-BSC-010
========================================================= */

function generateNssId(
  rollNumber: string | null,
  department: string | null
): string {
  if (!rollNumber) {
    throw new Error(
      "Roll number is missing. Cannot generate NSS ID."
    );
  }

  /* -----------------------------------------------
     Remove spaces and hyphens

     1051-23-861-010
     becomes
     105123861010
  ------------------------------------------------ */

  const normalizedRollNumber = rollNumber
    .replace(/[\s-]/g, "")
    .trim();

  /* -----------------------------------------------
     Validate numeric roll number
  ------------------------------------------------ */

  if (!/^\d+$/.test(normalizedRollNumber)) {
    throw new Error(
      `Invalid roll number "${rollNumber}". Roll number must contain only numbers and hyphens.`
    );
  }

  /* -----------------------------------------------
     Minimum length

     We need:

     characters 5-6 = year
     last 3 = roll suffix
  ------------------------------------------------ */

  if (normalizedRollNumber.length < 7) {
    throw new Error(
      `Roll number "${rollNumber}" is too short to generate an NSS ID.`
    );
  }

  /* -----------------------------------------------
     GET NSS YEAR

     IMPORTANT:

     Do NOT use volunteer.year.

     The NSS year comes from the roll number.

     105123861010
       ^^
       positions 5-6

     JavaScript:
     substring(4, 6)
  ------------------------------------------------ */

  const nssYear = normalizedRollNumber.substring(
    4,
    6
  );

  /* -----------------------------------------------
     Validate extracted year

     Expected examples:
     23
     24
     25
     26
  ------------------------------------------------ */

  if (!/^\d{2}$/.test(nssYear)) {
    throw new Error(
      `Unable to determine the NSS year from roll number "${rollNumber}".`
    );
  }

  /* -----------------------------------------------
     GET LAST 3 DIGITS

     105123861010

     last 3 = 010
  ------------------------------------------------ */

  const rollSuffix =
    normalizedRollNumber.slice(-3);

  /* -----------------------------------------------
     DEPARTMENT CODE

     Examples:

     BBA
     BCA
     BCOM
     BSC

     We remove spaces, dots and hyphens.

     B.Sc -> BSC
     BCA -> BCA
     BBA -> BBA
     B.Com -> BCOM
  ------------------------------------------------ */

  if (!department?.trim()) {
    throw new Error(
      "Department is missing. Cannot generate NSS ID."
    );
  }

  const departmentCode = department
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();

  if (!departmentCode) {
    throw new Error(
      "Invalid department. Cannot generate NSS ID."
    );
  }

  /* -----------------------------------------------
     FINAL NSS ID

     Example:

     ADC-NSS-23-BSC-010
  ------------------------------------------------ */

  return `ADC-NSS-${nssYear}-${departmentCode}-${rollSuffix}`;
}

export default function VolunteerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [showRejectBox, setShowRejectBox] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

  /* =========================================================
     LOAD VOLUNTEER
  ========================================================= */

  useEffect(() => {
    if (id) {
      loadVolunteer();
    }
  }, [id]);

  const loadVolunteer = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const { data, error } =
        await supabase
          .from("volunteers")
          .select("*")
          .eq("id", id)
          .single();

      if (error) {
        console.error(
          "Error loading volunteer:",
          error
        );

        setMessage(
          `Unable to load volunteer application: ${error.message}`
        );

        setMessageType("error");
        setVolunteer(null);

        return;
      }

      setVolunteer(data as Volunteer);
    } catch (error) {
      console.error(
        "Volunteer loading error:",
        error
      );

      setMessage(
        "Something went wrong while loading the volunteer."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     APPROVE VOLUNTEER
  ========================================================= */

  const approveVolunteer = async () => {
    if (!volunteer || updating) {
      return;
    }

    /* -------------------------------------------------------
       Don't approve twice
    ------------------------------------------------------- */

    if (volunteer.status === "Approved") {
      setMessage(
        "This volunteer is already approved."
      );

      setMessageType("error");

      return;
    }

    /* -------------------------------------------------------
       Generate NSS ID

       IMPORTANT:

       This uses roll_number.

       It DOES NOT use volunteer.year.
    ------------------------------------------------------- */

    let generatedNssId = "";

    try {
      generatedNssId = generateNssId(
        volunteer.roll_number,
        volunteer.department
      );
    } catch (error) {
      console.error(
        "NSS ID generation error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate NSS ID."
      );

      setMessageType("error");

      return;
    }

    /* -------------------------------------------------------
       Show the admin exactly what will be assigned
    ------------------------------------------------------- */

    const confirmed = window.confirm(
      `Approve this volunteer?\n\nNSS ID that will be assigned:\n${generatedNssId}`
    );

    if (!confirmed) {
      return;
    }

    setUpdating(true);
    setMessage("");
    setMessageType("");

    try {
      /* =====================================================
         SAVE APPROVAL + NSS ID
      ===================================================== */

      const {
        data,
        error,
      } = await supabase
        .from("volunteers")
        .update({
          status: "Approved",

          /*
           * FINAL NSS ID
           *
           * Example:
           * ADC-NSS-23-BSC-010
           */
          volunteer_id: generatedNssId,

          approved_at: new Date().toISOString(),
        })
        .eq("id", volunteer.id)
        .select("*")
        .single();

      if (error) {
        console.error(
          "Approval update error:",
          error
        );

        setMessage(
          `Failed to approve application: ${error.message}`
        );

        setMessageType("error");

        return;
      }

      /* -----------------------------------------------------
         Update local volunteer state
      ----------------------------------------------------- */

      setVolunteer(data as Volunteer);

      setMessage(
        `Volunteer approved successfully. NSS ID assigned: ${generatedNssId}`
      );

      setMessageType("success");
    } catch (error) {
      console.error(
        "Approval exception:",
        error
      );

      setMessage(
        "Something went wrong while approving the application."
      );

      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     REJECT VOLUNTEER
  ========================================================= */

  const rejectVolunteer = async () => {
    if (!volunteer || updating) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setMessage(
        "Please enter a rejection reason before confirming the rejection."
      );

      setMessageType("error");

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject this application?\n\nReason:\n${reason}`
    );

    if (!confirmed) {
      return;
    }

    setUpdating(true);
    setMessage("");
    setMessageType("");

    try {
      const { data, error } =
        await supabase.functions.invoke(
          "reject-volunteer",
          {
            body: {
              volunteerId: volunteer.id,
              rejectionReason: reason,
            },
          }
        );

      console.log(
        "Reject volunteer response:",
        data
      );

      if (error) {
        console.error(
          "Reject volunteer function error:",
          error
        );

        setMessage(
          `Failed to reject application: ${error.message}`
        );

        setMessageType("error");

        return;
      }

      if (!data?.success) {
        setMessage(
          data?.error ||
            "The application could not be rejected."
        );

        setMessageType("error");

        return;
      }

      setMessage(
        "Application rejected successfully."
      );

      setMessageType("success");

      setRejectionReason("");
      setShowRejectBox(false);

      setTimeout(() => {
        router.replace("/admin/volunteers");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(
        "Rejection exception:",
        error
      );

      setMessage(
        "Something went wrong while rejecting the application."
      );

      setMessageType("error");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center shadow">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#0F2B7B]" />

          <p className="mt-4 text-gray-600">
            Loading volunteer application...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     NOT FOUND
  ========================================================= */

  if (!volunteer) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 md:p-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-10 text-center shadow">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-xl font-bold text-red-600">
            Volunteer application not found.
          </h1>

          {message && (
            <p className="mt-3 text-sm text-gray-600">
              {message}
            </p>
          )}

          <Link
            href="/admin/volunteers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white hover:bg-[#143a96]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Volunteers
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     STATUS
  ========================================================= */

  const currentStatus =
    volunteer.status || "Pending";

  const isPending =
    currentStatus === "Pending";

  const isApproved =
    currentStatus === "Approved";

  const isRejected =
    currentStatus === "Rejected";

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/admin/volunteers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Volunteers
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-[#0F2B7B]">
              Volunteer Application
            </h1>

            <p className="mt-1 text-gray-500">
              Review the complete volunteer profile before making a decision.
            </p>
          </div>

          <div>
            {isApproved && (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-5 py-2.5 text-sm font-bold text-green-700">
                <CheckCircle className="h-5 w-5" />
                Approved
              </span>
            )}

            {isRejected && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-2.5 text-sm font-bold text-red-700">
                <XCircle className="h-5 w-5" />
                Rejected
              </span>
            )}

            {isPending && (
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-5 py-2.5 text-sm font-bold text-yellow-700">
                <Clock className="h-5 w-5" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-5 ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {messageType === "success" ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              )}

              <p className="font-semibold">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">

            {volunteer.photo_url ? (
              <img
                src={volunteer.photo_url}
                alt={
                  volunteer.full_name ||
                  "Volunteer"
                }
                className="h-32 w-32 rounded-2xl border object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-blue-100 text-4xl font-bold text-[#0F2B7B]">
                {volunteer.full_name
                  ?.charAt(0)
                  .toUpperCase() || "V"}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {volunteer.full_name ||
                  "Unnamed Volunteer"}
              </h2>

              <p className="mt-2 text-gray-600">
                Roll Number:{" "}
                {volunteer.roll_number || "—"}
              </p>

              <p className="text-gray-600">
                {volunteer.department || "—"}

                {volunteer.course
                  ? ` • ${volunteer.course}`
                  : ""}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                College Email:{" "}
                {volunteer.college_email ||
                  "—"}
              </p>

              {/* -------------------------------------------
                  NSS ID

                  Pending:
                  Not Assigned

                  Approved:
                  Actual generated NSS ID
              ------------------------------------------- */}

              <p className="mt-2 text-sm font-semibold text-[#0F2B7B]">
                NSS ID:{" "}
                {volunteer.volunteer_id ||
                  "Not Assigned"}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <InfoSection title="Personal Information">
          <Info
            label="Full Name"
            value={volunteer.full_name}
          />

          <Info
            label="Roll Number"
            value={volunteer.roll_number}
          />

          <Info
            label="Hall Ticket Number"
            value={volunteer.hall_ticket_number}
          />

          <Info
            label="Date of Birth"
            value={volunteer.date_of_birth}
          />

          <Info
            label="Gender"
            value={volunteer.gender}
          />

          <Info
            label="Blood Group"
            value={volunteer.blood_group}
          />
        </InfoSection>

        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <InfoSection title="Academic Information">
          <Info
            label="Department"
            value={volunteer.department}
          />

          <Info
            label="Course"
            value={volunteer.course}
          />

          <Info
            label="Year"
            value={volunteer.year}
          />

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

        {/* =================================================
            CONTACT INFORMATION
        ================================================= */}

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

          <Info
            label="City"
            value={volunteer.city}
          />

          <Info
            label="State"
            value={volunteer.state}
          />

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

        {/* =================================================
            NSS INFORMATION
        ================================================= */}

        <InfoSection title="NSS Information">
          <Info
            label="NSS ID"
            value={volunteer.volunteer_id}
          />

          <Info
            label="NSS Unit"
            value={volunteer.nss_unit}
          />

          <Info
            label="Role"
            value={volunteer.role}
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
            value={
              volunteer.previous_volunteer_experience
            }
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
              volunteer.areas_of_interest?.join(
                ", "
              ) || null
            }
          />
        </InfoSection>

        {/* =================================================
            MEDICAL INFORMATION
        ================================================= */}

        <InfoSection title="Medical Information">
          <Info
            label="Blood Group"
            value={volunteer.blood_group}
          />

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

        {/* =================================================
            DECLARATION
        ================================================= */}

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

        {/* =================================================
            APPLICATION DECISION
        ================================================= */}

        {isPending && (
          <section className="mt-6 rounded-2xl border border-yellow-200 bg-white p-6 shadow-sm">

            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-6 w-6 shrink-0 text-yellow-600" />

              <div>
                <h2 className="text-xl font-bold text-[#0F2B7B]">
                  Application Decision
                </h2>

                <p className="mt-2 text-gray-600">
                  Review the submitted information before
                  approving or rejecting this volunteer.
                </p>
              </div>
            </div>

            {/* ---------------------------------------------
                NSS ID PREVIEW
            --------------------------------------------- */}

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">
                NSS ID that will be generated on approval
              </p>

              <p className="mt-2 text-2xl font-bold tracking-wide text-[#0F2B7B]">
                {(() => {
                  try {
                    return generateNssId(
                      volunteer.roll_number,
                      volunteer.department
                    );
                  } catch {
                    return "Unable to generate NSS ID";
                  }
                })()}
              </p>

              <p className="mt-2 text-xs text-blue-700">
                The NSS ID will be saved to the database
                only after the application is approved.
              </p>
            </div>

            {/* ---------------------------------------------
                BUTTONS
            --------------------------------------------- */}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row">

              <button
                type="button"
                disabled={updating}
                onClick={approveVolunteer}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle className="h-5 w-5" />

                {updating
                  ? "Processing..."
                  : "Approve Volunteer"}
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setRejectionReason("");
                  setShowRejectBox(true);
                  setMessage("");
                  setMessageType("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-5 w-5" />

                Reject Application
              </button>
            </div>

            {/* ---------------------------------------------
                REJECTION BOX
            --------------------------------------------- */}

            {showRejectBox && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                <h3 className="text-lg font-bold text-red-800">
                  Why are you rejecting this application?
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  Enter the rejection reason clearly.
                </p>

                <textarea
                  value={rejectionReason}
                  onChange={(e) =>
                    setRejectionReason(
                      e.target.value
                    )
                  }
                  placeholder="Enter rejection reason..."
                  rows={5}
                  disabled={updating}
                  className="mt-4 w-full rounded-xl border border-red-300 bg-white p-4 text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    disabled={
                      updating ||
                      !rejectionReason.trim()
                    }
                    onClick={rejectVolunteer}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />

                    {updating
                      ? "Rejecting..."
                      : "Confirm Rejection"}
                  </button>

                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => {
                      setShowRejectBox(false);
                      setRejectionReason("");
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* =================================================
            APPROVED
        ================================================= */}

        {isApproved && (
          <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">

            <div className="flex items-start gap-3">
              <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-green-600" />

              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Volunteer Profile Approved
                </h2>

                <p className="mt-2 text-green-700">
                  This volunteer has been approved.
                </p>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-sm text-gray-500">
                    NSS ID
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-wide text-[#0F2B7B]">
                    {volunteer.volunteer_id ||
                      "Not Assigned"}
                  </p>
                </div>

                <p className="mt-4 text-sm text-green-700">
                  Login email:{" "}
                  <strong>
                    {volunteer.college_email ||
                      "—"}
                  </strong>
                </p>

                <p className="mt-1 text-sm text-green-700">
                  The password remains private and is
                  never displayed to the administrator.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            REJECTED
        ================================================= */}

        {isRejected && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">
              <XCircle className="mt-1 h-6 w-6 shrink-0 text-red-600" />

              <div>
                <h2 className="text-xl font-bold text-red-800">
                  Application Rejected
                </h2>

                <p className="mt-2 leading-7 text-red-700">
                  This volunteer application has been
                  rejected.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mt-8 pb-8">
          <Link
            href="/admin/volunteers"
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F2B7B] px-6 py-3 font-semibold text-[#0F2B7B] transition hover:bg-[#0F2B7B] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Volunteers
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   INFO SECTION
========================================================= */

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

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap font-semibold text-gray-900">
        {value || "—"}
      </p>
    </div>
  );
}