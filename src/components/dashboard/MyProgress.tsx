"use client";

import {
  CheckCircle2,
  Lock,
  Clock3,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Volunteer {
  attendance_percentage: number | null;
  service_hours: number | null;
  certificates_count: number | null;
  status: string | null;
  approved_at: string | null;
}

export default function MyProgress() {
  const [volunteer, setVolunteer] =
    useState<Volunteer | null>(null);

  const [loading, setLoading] = useState(true);

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
          attendance_percentage,
          service_hours,
          certificates_count,
          status,
          approved_at
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Error loading volunteer progress:",
          error
        );
        return;
      }

      setVolunteer(data);
    } catch (error) {
      console.error(
        "My Progress error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          🎯 My NSS Journey
        </h2>

        <p className="mt-6 text-gray-500">
          Loading your progress...
        </p>
      </section>
    );
  }

  if (!volunteer) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          🎯 My NSS Journey
        </h2>

        <p className="mt-4 text-gray-500">
          Unable to load your progress.
        </p>
      </section>
    );
  }

  const attendance =
    volunteer.attendance_percentage ?? 0;

  const serviceHours =
    volunteer.service_hours ?? 0;

  const certificates =
    volunteer.certificates_count ?? 0;

  const approved =
    volunteer.status === "Approved";

  const progress = [
    {
      title: "NSS Volunteer Approval",
      status: approved
        ? "completed"
        : "locked",
      progress: approved
        ? "Application approved"
        : "Awaiting approval",
    },

    {
      title: "NSS Attendance",
      status:
        attendance >= 75
          ? "completed"
          : attendance > 0
          ? "in-progress"
          : "locked",
      progress:
        attendance > 0
          ? `${attendance}% attendance`
          : "No attendance recorded",
    },

    {
      title: "NSS Service Hours",
      status:
        serviceHours > 0
          ? "in-progress"
          : "locked",
      progress:
        serviceHours > 0
          ? `${serviceHours} service hours completed`
          : "No service hours recorded",
    },

    {
      title: "Certificates",
      status:
        certificates > 0
          ? "completed"
          : "locked",
      progress:
        certificates > 0
          ? `${certificates} certificate${
              certificates === 1 ? "" : "s"
            } earned`
          : "No certificates yet",
    },
  ];

  /*
   * Calculate an overall progress percentage
   * from the information currently available.
   */
  const approvalScore = approved ? 25 : 0;

  const attendanceScore =
    Math.min(attendance / 75, 1) * 25;

  const serviceScore =
    Math.min(serviceHours / 120, 1) * 25;

  const certificateScore =
    certificates > 0 ? 25 : 0;

  const overallProgress = Math.round(
    approvalScore +
      attendanceScore +
      serviceScore +
      certificateScore
  );

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-2xl font-bold text-[#0F2B7B]">
        🎯 My NSS Journey
      </h2>

      <p className="mt-2 text-gray-600">
        Track your milestones and achievements
        as an NSS Volunteer.
      </p>

      <div className="mt-8 space-y-5">

        {progress.map((item) => {

          let Icon = Lock;
          let color = "text-gray-400";

          if (item.status === "completed") {
            Icon = CheckCircle2;
            color = "text-green-600";
          }

          if (item.status === "in-progress") {
            Icon = Clock3;
            color = "text-yellow-500";
          }

          return (
            <div
              key={item.title}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >

              <div className="flex items-center gap-4">

                <Icon
                  className={color}
                  size={24}
                />

                <div>

                  <h3 className="font-semibold text-[#0F2B7B]">
                    {item.title}
                  </h3>

                  {item.progress && (
                    <p className="text-sm text-gray-500">
                      {item.progress}
                    </p>
                  )}

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="mt-8">

        <div className="mb-2 flex justify-between">

          <span className="font-medium">
            Overall Progress
          </span>

          <span className="font-bold">
            {overallProgress}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-gray-200">

          <div
            className="h-3 rounded-full bg-[#0F2B7B] transition-all"
            style={{
              width: `${overallProgress}%`,
            }}
          />

        </div>

      </div>

    </section>
  );
}