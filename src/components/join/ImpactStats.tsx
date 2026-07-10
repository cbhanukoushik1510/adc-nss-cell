import {
  Users,
  CalendarDays,
  Clock3,
  Award,
  Trees,
  HeartHandshake,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    title: "Active Volunteers",
  },
  {
    icon: CalendarDays,
    value: "120+",
    title: "Community Events",
  },
  {
    icon: Clock3,
    value: "15,000+",
    title: "Service Hours",
  },
  {
    icon: Award,
    value: "30+",
    title: "Awards Won",
  },
  {
    icon: Trees,
    value: "2,500+",
    title: "Trees Planted",
  },
  {
    icon: HeartHandshake,
    value: "10,000+",
    title: "Lives Impacted",
  },
];

export default function ImpactStats() {
  return (
    <section className="bg-[#0F2B7B] py-20 text-white">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold">

            Our Impact

          </h2>

          <p className="mt-4 text-lg text-blue-100">

            Every volunteer contributes to creating meaningful change in society.

          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {stats.map((stat, index) => {

            const Icon = stat.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white/10 p-8 text-center backdrop-blur transition hover:bg-white/20"
              >

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-[#0F2B7B]">

                  <Icon size={32} />

                </div>

                <h3 className="text-5xl font-bold">

                  {stat.value}

                </h3>

                <p className="mt-3 text-lg text-blue-100">

                  {stat.title}

                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}