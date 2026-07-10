import { Users, CalendarDays, Trees, HeartHandshake } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    title: "Volunteers",
  },
  {
    icon: CalendarDays,
    value: "120+",
    title: "Events",
  },
  {
    icon: Trees,
    value: "2500+",
    title: "Trees Planted",
  },
  {
    icon: HeartHandshake,
    value: "15000+",
    title: "Service Hours",
  },
];

export default function Statistics() {
  return (
    <section className="bg-[#0F2B7B] py-20 text-white">

      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur"
              >

                <Icon size={40} className="mx-auto mb-5 text-yellow-300" />

                <h3 className="text-5xl font-bold">
                  {item.value}
                </h3>

                <p className="mt-3 text-blue-100">
                  {item.title}
                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}