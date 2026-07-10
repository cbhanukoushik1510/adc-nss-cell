import { Users, CalendarDays, Clock3, Trophy } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Active Volunteers",
  },
  {
    icon: CalendarDays,
    value: "50+",
    label: "Events Conducted",
  },
  {
    icon: Clock3,
    value: "2500+",
    label: "Service Hours",
  },
  {
    icon: Trophy,
    value: "15+",
    label: "Awards",
  },
];

export default function Statistics() {
  return (
    <section className="bg-[#0F2B7B] py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-white">
            NSS At A Glance
          </h2>

          <p className="mt-3 text-blue-200">
            Our achievements through service and leadership.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-md transition hover:bg-white/20"
              >
                <Icon
                  className="mx-auto mb-5 text-white"
                  size={45}
                />

                <h3 className="text-5xl font-bold text-white">
                  {item.value}
                </h3>

                <p className="mt-3 text-blue-100">
                  {item.label}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}