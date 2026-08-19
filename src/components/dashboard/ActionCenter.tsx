"use client";

import {
  UserCircle,
  Award,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Volunteer {
  full_name: string | null;
  status: string | null;
  declaration_accepted: boolean | null;
  certificates_count: number | null;
  profileCompletion: number;
}

export default function ActionCenter() {
  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadVolunteer();
  }, []);

  const loadVolunteer = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Unable to get logged-in user:",
          userError
        );
        return;
      }

      const { data, error } = await supabase
        .from("volunteers")
        .select(`
          full_name,
          status,
          declaration_accepted,
          certificates_count,
          roll_number,
          hall_ticket_number,
          date_of_birth,
          gender,
          blood_group,
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
          skills,
          languages_known,
          previous_volunteer_experience,
          why_join_nss,
          areas_of_interest,
          availability
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading volunteer:",
          error
        );
        return;
      }

      if (!data) {
        return;
      }

      /* Calculate profile completion */
      const fields = [
        data.full_name,
        data.roll_number,
        data.hall_ticket_number,
        data.date_of_birth,
        data.gender,
        data.blood_group,
        data.department,
        data.course,
        data.year,
        data.semester,
        data.section,
        data.academic_year,
        data.college_id,
        data.admission_number,
        data.college_email,
        data.personal_email,
        data.mobile_number,
        data.whatsapp_number,
        data.address,
        data.city,
        data.state,
        data.pincode,
        data.emergency_contact_name,
        data.emergency_contact_number,
        data.skills,
        data.languages_known,
        data.previous_volunteer_experience,
        data.why_join_nss,
        data.areas_of_interest,
        data.availability,
      ];

      const completedFields =
        fields.filter((field) => {
          if (Array.isArray(field)) {
            return field.length > 0;
          }

          return (
            field !== null &&
            field !== undefined &&
            String(field).trim() !== ""
          );
        }).length;

      const profileCompletion = Math.round(
        (completedFields / fields.length) * 100
      );

      setVolunteer({
        full_name: data.full_name,
        status: data.status,
        declaration_accepted:
          data.declaration_accepted,
        certificates_count:
          data.certificates_count,
        profileCompletion,
      });
    } catch (error) {
      console.error(
        "Action Center error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          🎯 Action Center
        </h2>

        <p className="mt-3 text-gray-500">
          Loading your latest information...
        </p>
      </section>
    );
  }

  if (!volunteer) {
    return (
      <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          🎯 Action Center
        </h2>

        <p className="mt-3 text-gray-500">
          Unable to load your volunteer information.
        </p>
      </section>
    );
  }

  const actions = [];

  /* Profile completion */

  if (volunteer.profileCompletion < 100) {
    actions.push({
      icon: UserCircle,
      title: "Complete Your Profile",
      description: `Your profile is ${volunteer.profileCompletion}% complete.`,
      color: "text-yellow-500",
      button: "View Profile",
    });
  }

  /* Certificate */

  if (
    (volunteer.certificates_count ?? 0) > 0
  ) {
    actions.push({
      icon: Award,
      title: "Certificates Available",
      description: `You have ${volunteer.certificates_count} certificate${
        volunteer.certificates_count === 1
          ? ""
          : "s"
      } available.`,
      color: "text-green-500",
      button: "View Certificates",
    });
  }

  /* Account status */

  actions.push({
    icon: ShieldCheck,
    title: "Volunteer Account",
    description:
      volunteer.status === "Approved"
        ? "Your volunteer profile is approved and active."
        : `Current status: ${
            volunteer.status || "Unknown"
          }`,
    color:
      volunteer.status === "Approved"
        ? "text-green-500"
        : "text-blue-500",
    button: "View Profile",
  });

  /* Declaration */

  if (!volunteer.declaration_accepted) {
    actions.push({
      icon: ShieldCheck,
      title: "Declaration Required",
      description:
        "Your volunteer declaration has not been accepted.",
      color: "text-red-500",
      button: "Review",
    });
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8">

        <h2 className="text-3xl font-bold text-[#0F2B7B]">
          🎯 Action Center
        </h2>

        <p className="mt-2 text-gray-600">
          Stay updated with your latest NSS activities
          and important tasks.
        </p>

      </div>

      <div className="space-y-5">

        {actions.length === 0 ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="font-semibold text-green-700">
              You&apos;re all caught up! 🎉
            </p>

            <p className="mt-1 text-sm text-green-600">
              There are currently no pending actions.
            </p>
          </div>
        ) : (
          actions.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex flex-col justify-between gap-5 rounded-2xl border p-6 transition hover:border-[#0F2B7B] hover:shadow-lg lg:flex-row lg:items-center"
              >

                <div className="flex items-start gap-5">

                  <div
                    className={`${item.color} mt-1`}
                  >
                    <Icon size={30} />
                  </div>

                  <div>

                    <h3 className="text-xl font-semibold text-[#0F2B7B]">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {item.description}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#1E40AF]"
                >
                  {item.button}

                  <ArrowRight size={18} />
                </button>

              </div>
            );
          })
        )}

      </div>

    </section>
  );
}