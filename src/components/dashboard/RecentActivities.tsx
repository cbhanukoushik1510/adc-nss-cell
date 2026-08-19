"use client";

import {
  CalendarPlus,
  Award,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Activity {
  id: string;
  type: "attendance" | "certificate" | "event" | "profile";
  title: string;
  description: string | null;
  activity_time: string;
}

const iconMap = {
  attendance: CheckCircle2,
  certificate: Award,
  event: CalendarPlus,
  profile: UserRound,
};

const colorMap = {
  attendance: "bg-green-100 text-green-700",
  certificate: "bg-purple-100 text-purple-700",
  event: "bg-blue-100 text-blue-700",
  profile: "bg-orange-100 text-orange-700",
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      /* Get logged-in user */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "Unable to get logged-in user:",
          userError
        );

        setActivities([]);
        return;
      }

      /* Find the volunteer */
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
          "Error loading volunteer:",
          volunteerError
        );

        setActivities([]);
        return;
      }

      if (!volunteer) {
        console.error(
          "Volunteer profile not found."
        );

        setActivities([]);
        return;
      }

      /* Load this volunteer's activities */
      const {
        data,
        error,
      } = await supabase
        .from("volunteer_activities")
        .select(`
          id,
          type,
          title,
          description,
          activity_time
        `)
        .eq("volunteer_id", volunteer.id)
        .order("activity_time", {
          ascending: false,
        })
        .limit(5);

      if (error) {
        console.error(
          "Error loading activities:",
          error
        );

        setActivities([]);
        return;
      }

      setActivities(
        (data || []) as Activity[]
      );
    } catch (error) {
      console.error(
        "Recent activities error:",
        error
      );

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-8 shadow-lg">

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Recent Activities
          </h2>

          <p className="text-gray-500">
            Your latest NSS activities.
          </p>
        </div>

        <p className="text-gray-500">
          Loading activities...
        </p>

      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          Recent Activities
        </h2>

        <p className="text-gray-500">
          Your latest NSS activities.
        </p>

      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">

          <CheckCircle2 className="mx-auto h-10 w-10 text-gray-400" />

          <p className="mt-4 font-semibold text-gray-600">
            No recent activities
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Your NSS activities will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-6">

          {activities.map((activity) => {

            const Icon =
              iconMap[activity.type] ||
              CheckCircle2;

            const color =
              colorMap[activity.type] ||
              "bg-gray-100 text-gray-700";

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
              >

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}
                >
                  <Icon size={22} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-[#0F2B7B]">
                    {activity.title}
                  </h3>

                  <p className="mt-1 text-gray-600">
                    {activity.description ||
                      "No description available."}
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {formatTime(
                      activity.activity_time
                    )}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}