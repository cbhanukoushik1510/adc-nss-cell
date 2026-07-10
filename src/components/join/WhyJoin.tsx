import {
  HeartHandshake,
  Leaf,
  Trophy,
  Users,
  BadgeCheck,
  Lightbulb,
} from "lucide-react";

const benefits = [
  {
    icon: HeartHandshake,
    title: "Community Service",
    description:
      "Serve society by participating in meaningful social and community service activities.",
  },
  {
    icon: Leaf,
    title: "Environmental Protection",
    description:
      "Take part in plantation drives, cleanliness campaigns, and environmental awareness programs.",
  },
  {
    icon: Trophy,
    title: "Leadership Skills",
    description:
      "Develop confidence, leadership, communication, and organizational skills.",
  },
  {
    icon: Users,
    title: "Teamwork",
    description:
      "Work with passionate volunteers and build lifelong friendships through collaboration.",
  },
  {
    icon: BadgeCheck,
    title: "Certificates & Recognition",
    description:
      "Earn certificates, awards, appreciation letters, and recognition for your service.",
  },
  {
    icon: Lightbulb,
    title: "Personality Development",
    description:
      "Improve problem-solving, public speaking, discipline, and social responsibility.",
  },
];

export default function WhyJoin() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Why Join NSS?
          </h2>

          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            The National Service Scheme offers students an opportunity to
            contribute to society while developing valuable life skills,
            leadership qualities, and a sense of responsibility.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="rounded-3xl border border-gray-100 bg-slate-50 p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
                  <Icon size={32} />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-[#0F2B7B]">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}