import {
  Trophy,
  GraduationCap,
  Users,
  Briefcase,
  Award,
  HeartHandshake,
} from "lucide-react";

const benefits = [
  {
    icon: Trophy,
    title: "Leadership Skills",
  },
  {
    icon: GraduationCap,
    title: "Personality Development",
  },
  {
    icon: Users,
    title: "Teamwork",
  },
  {
    icon: Briefcase,
    title: "Better Resume",
  },
  {
    icon: Award,
    title: "NSS Certificate",
  },
  {
    icon: HeartHandshake,
    title: "Social Responsibility",
  },
];

export default function Benefits() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            Benefits of Being an NSS Volunteer

          </h2>

          <p className="mt-4 text-lg text-gray-600">

            NSS helps students grow academically, professionally and personally.

          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {benefits.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="rounded-3xl border bg-slate-50 p-8 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">

                  <Icon size={30} />

                </div>

                <h3 className="text-2xl font-bold text-[#0F2B7B]">

                  {item.title}

                </h3>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}