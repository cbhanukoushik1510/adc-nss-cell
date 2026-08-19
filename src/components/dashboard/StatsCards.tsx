"use client";

import {
  CheckCircle2,
  Clock3,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

interface Volunteer {
  attendance_percentage: number | null;
  service_hours: number | null;
  certificates_count: number | null;
  status: string | null;
}

export default function StatsCards() {
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
      } = await supabase.auth.getUser();

      if (!user) {
        setVolunteer(null);
        return;
      }

      const { data, error } =
        await supabase
          .from("volunteers")
          .select(
            `
              attendance_percentage,
              service_hours,
              certificates_count,
              status
            `
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Error loading volunteer stats:",
          error
        );

        setVolunteer(null);
        return;
      }

      setVolunteer(data);
    } catch (error) {
      console.error(
        "Volunteer stats error:",
        error
      );

      setVolunteer(null);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Attendance",
      value: volunteer?.attendance_percentage != null
        ? `${volunteer.attendance_percentage}%`
        : "0%",
      subtitle: "Overall attendance",
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Service Hours",
      value: volunteer?.service_hours != null
        ? String(volunteer.service_hours)
        : "0",
      subtitle: "NSS service hours completed",
      icon: Clock3,
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Certificates",
      value: volunteer?.certificates_count != null
        ? String(volunteer.certificates_count)
        : "0",
      subtitle: "Certificates earned",
      icon: Award,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Status",
      value: volunteer?.status || "Pending",
      subtitle: "Volunteer application status",
      icon: ShieldCheck,
      color: "bg-blue-100 text-blue-700",
    },
  ];

  if (loading) {
    return (
      <section className="mt-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-3xl bg-white shadow-lg"
            />
          ))}

        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((card) => {

          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-4xl font-bold text-[#0F2B7B]">
                    {card.value}
                  </h2>

                </div>

                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${card.color}`}
                >
                  <Icon size={30} />
                </div>

              </div>

              <p className="mt-6 text-sm font-medium text-gray-500">
                {card.subtitle}
              </p>

            </div>
          );
        })}

      </div>

    </section>
  );
}