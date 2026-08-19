"use client";

import {
  CalendarDays,
  GraduationCap,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Volunteer {
  full_name: string | null;
  volunteer_id: string | null;
  department: string | null;
  year: string | null;
  nss_unit: string | null;
  created_at: string | null;
  status: string | null;
}

export default function WelcomeBanner() {
  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
      ? "Good Afternoon"
      : "Good Evening";

  useEffect(() => {
    loadVolunteer();
  }, []);

  const loadVolunteer = async () => {
    try {
      /* Get currently logged-in user */
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

      /* Load volunteer belonging to this account */
      const { data, error } = await supabase
        .from("volunteers")
        .select(`
          full_name,
          volunteer_id,
          department,
          year,
          nss_unit,
          created_at,
          status
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

      setVolunteer(data);
    } catch (error) {
      console.error(
        "Welcome banner error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* Don't show fake volunteer information */
  if (loading) {
    return (
      <section className="mt-6 rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-xl">
        <p className="text-blue-100">
          Loading your profile...
        </p>
      </section>
    );
  }

  if (!volunteer) {
    return (
      <section className="mt-6 rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-xl">
        <p className="text-lg text-blue-100">
          👋 {greeting},
        </p>

        <h2 className="mt-1 text-3xl font-bold">
          Volunteer
        </h2>

        <p className="mt-2 text-blue-100">
          Unable to load your volunteer profile.
        </p>
      </section>
    );
  }

  const joinedDate = volunteer.created_at
    ? new Date(volunteer.created_at).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "numeric",
        }
      )
    : "—";

  return (
    <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F2B7B] to-[#1E40AF] p-8 text-white shadow-xl">

      <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">

        {/* LEFT */}

        <div className="flex-1">

          <p className="text-lg text-blue-100">
            👋 {greeting},
          </p>

          <h2 className="mt-1 text-4xl font-bold">
            {volunteer.full_name || "Volunteer"}
          </h2>

          <div className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur">
            NSS Volunteer
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            {/* Volunteer ID */}

            <div className="flex items-center gap-3">
              <IdCard size={20} />

              <span>
                {volunteer.volunteer_id || "Not assigned"}
              </span>
            </div>

            {/* Department / Year */}

            <div className="flex items-center gap-3">
              <GraduationCap size={20} />

              <span>
                {volunteer.department || "—"}
                {volunteer.year
                  ? ` • ${volunteer.year}`
                  : ""}
              </span>
            </div>

            {/* NSS Unit */}

            <div className="flex items-center gap-3">
              <ShieldCheck size={20} />

              <span>
                {volunteer.nss_unit
                  ? `Unit ${volunteer.nss_unit}`
                  : "NSS Unit —"}
              </span>
            </div>

            {/* Joined */}

            <div className="flex items-center gap-3">
              <CalendarDays size={20} />

              <span>
                Joined {joinedDate}
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="w-full max-w-sm rounded-3xl bg-white/10 p-6 backdrop-blur">

          <h3 className="text-xl font-bold">
            Profile Status
          </h3>

          <p className="mt-4 text-2xl font-semibold">
            {volunteer.status || "Approved"}
          </p>

          <p className="mt-2 text-blue-100">
            Your volunteer profile is active.
          </p>

          <div className="mt-8">

            <div className="mb-2 flex justify-between text-sm">
              <span>Profile</span>
              <span>Active</span>
            </div>

            <div className="h-3 rounded-full bg-white/20">
              <div className="h-3 w-full rounded-full bg-yellow-400" />
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}