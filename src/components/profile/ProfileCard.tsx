"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  GraduationCap,
  IdCard,
  Pencil,
  RefreshCw,
  User,
  MapPin,
  HeartPulse,
  ShieldCheck,
  Briefcase,
  CalendarDays,
  Languages,
  Clock3,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

interface Volunteer {
  id: string;
  auth_user_id: string | null;

  /* Personal */
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  photo_url: string | null;

  /* Academic */
  roll_number: string | null;
  hall_ticket_number: string | null;
  department: string | null;
  course: string | null;
  year: string | null;
  semester: string | null;
  section: string | null;
  academic_year: string | null;
  college_id: string | null;
  admission_number: string | null;

  /* Contact */
  college_email: string | null;
  personal_email: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  /* Emergency */
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;

  /* NSS */
  volunteer_id: string | null;
  nss_unit: string | null;
  role: string | null;
  status: string | null;
  approved_at: string | null;

  /* Volunteer */
  skills: string | null;
  languages_known: string | null;
  previous_volunteer_experience: string | null;
  why_join_nss: string | null;
  areas_of_interest: string[] | null;
  availability: string | null;
}

export default function ProfileCard() {
  const router = useRouter();

  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadVolunteer();
  }, []);

  const loadVolunteer = async () => {
    setLoading(true);
    setError("");

    try {
      /* ========================================
         1. CURRENT AUTH USER
      ======================================== */

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Could not get logged-in user:",
          userError
        );

        router.replace("/login");
        return;
      }

      /* ========================================
         2. LOAD VOLUNTEER
      ======================================== */

      const {
        data,
        error: volunteerError,
      } = await supabase
        .from("volunteers")
        .select(`
          id,
          auth_user_id,

          full_name,
          date_of_birth,
          gender,
          blood_group,
          photo_url,

          roll_number,
          hall_ticket_number,
          department,
          course,
          year,
          semester,
          section,
          academic_year,
          college_id,
          admission_number,

          college_email,
          personal_email,
          mobile_number,
          whatsapp_number,
          address,
          city,
          state,
          pincode,

          emergency_contact_name,
          emergency_contact_number,

          volunteer_id,
          nss_unit,
          role,
          status,
          approved_at,

          skills,
          languages_known,
          previous_volunteer_experience,
          why_join_nss,
          areas_of_interest,
          availability
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (volunteerError) {
        console.error(
          "Volunteer profile loading error:",
          volunteerError
        );

        setError(
          "Unable to load your volunteer profile."
        );

        return;
      }

      if (!data) {
        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      /* ========================================
         3. APPROVAL CHECK
      ======================================== */

      if (data.status !== "Approved") {
        console.warn(
          "Volunteer is not approved:",
          data.status
        );

        await supabase.auth.signOut();

        router.replace("/login");
        return;
      }

      setVolunteer(data as Volunteer);

    } catch (error) {
      console.error(
        "Unexpected profile error:",
        error
      );

      setError(
        "Something went wrong while loading your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
     LOGOUT
  ========================================== */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  };

  /* ==========================================
     EDIT PROFILE
  ========================================== */

  const handleEditProfile = () => {
    alert("Edit Profile feature coming soon!");
  };

  /* ==========================================
     HELPERS
  ========================================== */

  const display = (
    value: string | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      value.trim() === ""
    ) {
      return "Not provided";
    }

    return value;
  };

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return "Not provided";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatApprovedDate = (
    value: string | null
  ) => {
    if (!value) return "Not available";

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* ==========================================
     REUSABLE DETAIL ITEM
  ========================================== */

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">

        <Icon
          size={20}
          className="mt-1 shrink-0 text-blue-700"
        />

        <div className="min-w-0">

          <p className="text-sm text-gray-500">
            {label}
          </p>

          <p className="mt-1 break-words font-semibold text-gray-800">
            {value}
          </p>

        </div>

      </div>
    </div>
  );

  /* ==========================================
     SECTION HEADER
  ========================================== */

  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: any;
    title: string;
  }) => (
    <div className="mb-5 flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
        <Icon
          size={21}
          className="text-[#0F2B7B]"
        />
      </div>

      <h2 className="text-xl font-bold text-[#0F2B7B]">
        {title}
      </h2>

    </div>
  );

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {
    return (
      <section className="mt-6 rounded-3xl bg-white p-8 shadow-lg">

        <div className="flex min-h-[300px] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              className="mx-auto animate-spin text-[#0F2B7B]"
              size={32}
            />

            <p className="mt-3 text-gray-500">
              Loading your profile...
            </p>

          </div>

        </div>

      </section>
    );
  }

  /* ==========================================
     ERROR
  ========================================== */

  if (error || !volunteer) {
    return (
      <section className="mt-6 rounded-3xl bg-white p-8 shadow-lg">

        <div className="text-center">

          <p className="font-semibold text-red-600">
            {error || "Volunteer profile not found."}
          </p>

          <button
            type="button"
            onClick={loadVolunteer}
            className="mt-4 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white hover:bg-[#183A96]"
          >
            Try Again
          </button>

        </div>

      </section>
    );
  }

  /* ==========================================
     PROFILE
  ========================================== */

  return (
    <section className="mt-6 space-y-8">

      {/* ======================================
          PROFILE HEADER
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">

          {/* PHOTO */}

          <div className="flex flex-col items-center">

            {volunteer.photo_url ? (
              <img
                src={volunteer.photo_url}
                alt={
                  volunteer.full_name ||
                  "Volunteer"
                }
                className="h-[160px] w-[160px] rounded-full border-4 border-blue-100 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-[160px] w-[160px] items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50 text-6xl font-bold text-[#0F2B7B] shadow-lg">
                {volunteer.full_name
                  ?.charAt(0)
                  .toUpperCase() || "V"}
              </div>
            )}

            <h2 className="mt-4 text-center text-2xl font-bold text-[#0F2B7B]">
              {display(volunteer.full_name)}
            </h2>

            <p className="text-gray-500">
              {display(volunteer.role) !==
              "Not provided"
                ? volunteer.role
                : "NSS Volunteer"}
            </p>

            <span className="mt-3 rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
              {display(volunteer.status)}
            </span>

          </div>

          {/* BASIC DETAILS */}

          <div className="flex-1">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <h1 className="text-3xl font-bold text-[#0F2B7B]">
                  Volunteer Profile
                </h1>

                <p className="mt-2 text-gray-500">
                  Complete NSS volunteer information
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 px-5 py-3">

                <p className="text-xs font-medium text-gray-500">
                  NSS Volunteer ID
                </p>

                <p className="mt-1 font-bold text-[#0F2B7B]">
                  {display(volunteer.volunteer_id)}
                </p>

              </div>

            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              <DetailItem
                icon={IdCard}
                label="Roll Number"
                value={display(
                  volunteer.roll_number
                )}
              />

              <DetailItem
                icon={GraduationCap}
                label="Department"
                value={`${display(
                  volunteer.department
                )}${
                  volunteer.course
                    ? ` • ${volunteer.course}`
                    : ""
                }${
                  volunteer.year
                    ? ` • ${volunteer.year}`
                    : ""
                }`}
              />

              <DetailItem
                icon={Mail}
                label="College Email"
                value={display(
                  volunteer.college_email
                )}
              />

              <DetailItem
                icon={Phone}
                label="Mobile Number"
                value={display(
                  volunteer.mobile_number
                )}
              />

            </div>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-wrap gap-4 border-t pt-6">

          <button
            type="button"
            onClick={handleEditProfile}
            className="flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-6 py-3 font-semibold text-white transition hover:bg-[#183A96]"
          >
            <Pencil size={18} />
            Edit Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-300 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
          >
            Logout
          </button>

        </div>

      </div>

      {/* ======================================
          PERSONAL INFORMATION
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={User}
          title="Personal Information"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            icon={User}
            label="Full Name"
            value={display(
              volunteer.full_name
            )}
          />

          <DetailItem
            icon={CalendarDays}
            label="Date of Birth"
            value={formatDate(
              volunteer.date_of_birth
            )}
          />

          <DetailItem
            icon={User}
            label="Gender"
            value={display(
              volunteer.gender
            )}
          />

          <DetailItem
            icon={HeartPulse}
            label="Blood Group"
            value={display(
              volunteer.blood_group
            )}
          />

        </div>

      </div>

      {/* ======================================
          ACADEMIC INFORMATION
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={GraduationCap}
          title="Academic Information"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            icon={IdCard}
            label="Roll Number"
            value={display(
              volunteer.roll_number
            )}
          />

          <DetailItem
            icon={IdCard}
            label="Hall Ticket Number"
            value={display(
              volunteer.hall_ticket_number
            )}
          />

          <DetailItem
            icon={GraduationCap}
            label="Department"
            value={display(
              volunteer.department
            )}
          />

          <DetailItem
            icon={GraduationCap}
            label="Course"
            value={display(
              volunteer.course
            )}
          />

          <DetailItem
            icon={GraduationCap}
            label="Year"
            value={display(
              volunteer.year
            )}
          />

          <DetailItem
            icon={GraduationCap}
            label="Semester"
            value={display(
              volunteer.semester
            )}
          />

          <DetailItem
            icon={GraduationCap}
            label="Section"
            value={display(
              volunteer.section
            )}
          />

          <DetailItem
            icon={CalendarDays}
            label="Academic Year"
            value={display(
              volunteer.academic_year
            )}
          />

          <DetailItem
            icon={IdCard}
            label="College ID"
            value={display(
              volunteer.college_id
            )}
          />

          <DetailItem
            icon={IdCard}
            label="Admission Number"
            value={display(
              volunteer.admission_number
            )}
          />

        </div>

      </div>

      {/* ======================================
          CONTACT INFORMATION
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={MapPin}
          title="Contact Information"
        />

        <div className="grid gap-5 md:grid-cols-2">

          <DetailItem
            icon={Mail}
            label="College Email"
            value={display(
              volunteer.college_email
            )}
          />

          <DetailItem
            icon={Mail}
            label="Personal Email"
            value={display(
              volunteer.personal_email
            )}
          />

          <DetailItem
            icon={Phone}
            label="Mobile Number"
            value={display(
              volunteer.mobile_number
            )}
          />

          <DetailItem
            icon={Phone}
            label="WhatsApp Number"
            value={display(
              volunteer.whatsapp_number
            )}
          />

          <DetailItem
            icon={MapPin}
            label="Address"
            value={display(
              volunteer.address
            )}
          />

          <DetailItem
            icon={MapPin}
            label="City"
            value={display(
              volunteer.city
            )}
          />

          <DetailItem
            icon={MapPin}
            label="State"
            value={display(
              volunteer.state
            )}
          />

          <DetailItem
            icon={MapPin}
            label="Pincode"
            value={display(
              volunteer.pincode
            )}
          />

        </div>

      </div>

      {/* ======================================
          EMERGENCY CONTACT
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={HeartPulse}
          title="Emergency Contact"
        />

        <div className="grid gap-5 md:grid-cols-2">

          <DetailItem
            icon={User}
            label="Contact Name"
            value={display(
              volunteer.emergency_contact_name
            )}
          />

          <DetailItem
            icon={Phone}
            label="Contact Number"
            value={display(
              volunteer.emergency_contact_number
            )}
          />

        </div>

      </div>

      {/* ======================================
          NSS INFORMATION
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={ShieldCheck}
          title="NSS Information"
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            icon={IdCard}
            label="Volunteer ID"
            value={display(
              volunteer.volunteer_id
            )}
          />

          <DetailItem
            icon={ShieldCheck}
            label="NSS Unit"
            value={
              volunteer.nss_unit
                ? `Unit ${volunteer.nss_unit}`
                : "Not assigned"
            }
          />

          <DetailItem
            icon={ShieldCheck}
            label="Role"
            value={display(
              volunteer.role
            )}
          />

          <DetailItem
            icon={ShieldCheck}
            label="Status"
            value={display(
              volunteer.status
            )}
          />

          <DetailItem
            icon={CalendarDays}
            label="Approved Date"
            value={formatApprovedDate(
              volunteer.approved_at
            )}
          />

        </div>

      </div>

      {/* ======================================
          VOLUNTEER INFORMATION
      ====================================== */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <SectionHeader
          icon={Briefcase}
          title="Volunteer Information"
        />

        <div className="grid gap-5 md:grid-cols-2">

          <DetailItem
            icon={Briefcase}
            label="Skills"
            value={display(
              volunteer.skills
            )}
          />

          <DetailItem
            icon={Languages}
            label="Languages Known"
            value={display(
              volunteer.languages_known
            )}
          />

          <DetailItem
            icon={Briefcase}
            label="Previous Volunteer Experience"
            value={display(
              volunteer.previous_volunteer_experience
            )}
          />

          <DetailItem
            icon={Briefcase}
            label="Why Join NSS"
            value={display(
              volunteer.why_join_nss
            )}
          />

          <DetailItem
            icon={Clock3}
            label="Availability"
            value={display(
              volunteer.availability
            )}
          />

          <DetailItem
            icon={Briefcase}
            label="Areas of Interest"
            value={
              volunteer.areas_of_interest &&
              volunteer.areas_of_interest.length > 0
                ? volunteer.areas_of_interest.join(
                    ", "
                  )
                : "Not provided"
            }
          />

        </div>

      </div>

    </section>
  );
}