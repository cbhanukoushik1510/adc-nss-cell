import {
  CalendarDays,
  Award,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { volunteerStats } from "@/data/dashboard";

const iconMap = {
  attendance: CheckCircle2,
  clock: Clock3,
  calendar: CalendarDays,
  award: Award,
};

const colorMap = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function StatsCards() {
  return (
    <section className="mt-8">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {volunteerStats.map((card) => {

          const Icon =
            iconMap[card.icon as keyof typeof iconMap];

          const color =
            colorMap[card.color as keyof typeof colorMap];

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
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}
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