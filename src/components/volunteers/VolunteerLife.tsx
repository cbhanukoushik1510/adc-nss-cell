import {
  HeartHandshake,
  Users,
  Trees,
  Sparkles,
} from "lucide-react";

const life = [
  {
    icon: HeartHandshake,
    title: "Community Service",
    desc: "Serve society through awareness campaigns, health camps and outreach programmes.",
  },
  {
    icon: Trees,
    title: "Environmental Care",
    desc: "Participate in plantation drives and environmental sustainability initiatives.",
  },
  {
    icon: Users,
    title: "Leadership",
    desc: "Develop leadership, communication and teamwork through practical experience.",
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    desc: "Build confidence, discipline and social responsibility while helping others.",
  },
];

export default function VolunteerLife() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Life as an NSS Volunteer
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Being an NSS volunteer is a journey of learning, serving, and
            becoming a responsible citizen.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {life.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
                  <Icon size={30} />
                </div>

                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {item.desc}
                </p>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}