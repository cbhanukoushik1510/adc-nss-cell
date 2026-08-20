"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Award,
  UserRound,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  activity_time: string;
  created_at: string;
}

const iconMap: Record<string, typeof CheckCircle2> = {
  attendance: CheckCircle2,
  certificate: Award,
  event: CalendarDays,
  profile: UserRound,
};

const colorMap: Record<string, string> = {
  attendance: "bg-green-100 text-green-700",
  certificate: "bg-purple-100 text-purple-700",
  event: "bg-blue-100 text-blue-700",
  profile: "bg-orange-100 text-orange-700",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
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

      /* Load activities belonging to this volunteer */
      const {
        data,
        error: activitiesError,
      } = await supabase
        .from("volunteer_activities")
        .select(`
          id,
          type,
          title,
          description,
          activity_time,
          created_at
        `)
        .eq("volunteer_id", volunteer.id)
        .order("activity_time", {
          ascending: false,
        });

      if (activitiesError) {
        console.error(
          "Activities loading error:",
          activitiesError
        );

        setError("Unable to load your activities.");
        return;
      }

      setActivities((data || []) as Activity[]);
    } catch (error) {
      console.error(
        "Activities page error:",
        error
      );

      setError(
        "Something went wrong while loading your activities."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatType = (type: string) => {
    return type
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">

        {/* Page Header */}

        <div>
          <h1 className="text-3xl font-bold text-[#0F2B7B]">
            My Activities
          </h1>

          <p className="mt-2 text-gray-600">
            View your latest NSS activities and achievements.
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">

          <div className="mb-8 flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ClipboardList size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0F2B7B]">
                Activity History
              </h2>

              <p className="text-sm text-gray-500">
                Your NSS activity records
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
                  Loading activities...
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
                onClick={loadActivities}
                className="mt-4 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#183A96]"
              >
                Try Again
              </button>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            activities.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">

                <ClipboardList
                  className="mx-auto text-gray-400"
                  size={46}
                />

                <h3 className="mt-4 font-semibold text-gray-700">
                  No activities yet
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Your NSS activities will appear here
                  once they are recorded.
                </p>

              </div>
            )}

          {/* Activities */}

          {!loading &&
            !error &&
            activities.length > 0 && (
              <div className="space-y-5">

                {activities.map((activity) => {

                  const Icon =
                    iconMap[activity.type] ||
                    ClipboardList;

                  const color =
                    colorMap[activity.type] ||
                    "bg-gray-100 text-gray-700";

                  return (
                    <div
                      key={activity.id}
                      className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
                    >

                      <div className="flex items-start gap-4">

                        {/* Icon */}

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}
                        >
                          <Icon size={22} />
                        </div>

                        {/* Content */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <h3 className="text-lg font-bold text-[#0F2B7B]">
                              {activity.title}
                            </h3>

                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${color}`}
                            >
                              {formatType(activity.type)}
                            </span>

                          </div>

                          {activity.description && (
                            <p className="mt-2 leading-6 text-gray-600">
                              {activity.description}
                            </p>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">

                            <CalendarDays size={16} />

                            {formatDateTime(
                              activity.activity_time
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

      </section>
    </DashboardLayout>
  );
}