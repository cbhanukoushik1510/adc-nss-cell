import {
  CalendarDays,
  Clock3,
  Award,
  Trophy,
} from "lucide-react";

const stats = [
  {
    title: "Attendance",
    value: "96%",
    icon: CalendarDays,
  },
  {
    title: "Service Hours",
    value: "142",
    icon: Clock3,
  },
  {
    title: "Certificates",
    value: "6",
    icon: Award,
  },
  {
    title: "Achievements",
    value: "12",
    icon: Trophy,
  },
];

export default function ProfileStats() {
  return (
    <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => {

        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl bg-white p-6 shadow hover:shadow-xl transition"
          >

            <Icon
              className="mb-5 text-[#0F2B7B]"
              size={38}
            />

            <h2 className="text-4xl font-bold">
              {item.value}
            </h2>

            <p className="mt-2 text-gray-500">
              {item.title}
            </p>

          </div>
        );

      })}

    </section>
  );
}