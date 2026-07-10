import {
  CalendarPlus,
  Award,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import { activities } from "@/data/activities";

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

      <div className="space-y-6">

        {activities.map((activity) => {

          const Icon =
            iconMap[activity.type as keyof typeof iconMap];

          const color =
            colorMap[activity.type as keyof typeof colorMap];

          return (

            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
            >

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}
              >
                <Icon size={22} />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-[#0F2B7B]">
                  {activity.title}
                </h3>

                <p className="mt-1 text-gray-600">
                  {activity.description}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  {activity.time}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}