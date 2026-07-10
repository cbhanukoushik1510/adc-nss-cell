import {
  Award,
  Users,
  HeartHandshake,
  Trees,
  Briefcase,
  Trophy,
  Megaphone,
  GraduationCap,
} from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "NSS Certificate",
    description: "Official NSS certificates recognizing your service.",
  },
  {
    icon: Users,
    title: "Leadership Skills",
    description: "Develop leadership, teamwork and decision-making abilities.",
  },
  {
    icon: HeartHandshake,
    title: "Community Service",
    description: "Serve society through impactful social initiatives.",
  },
  {
    icon: Trees,
    title: "Environmental Awareness",
    description: "Participate in plantation drives and sustainability programs.",
  },
  {
    icon: Briefcase,
    title: "Career Advantage",
    description: "Strengthen your resume for placements and higher studies.",
  },
  {
    icon: Trophy,
    title: "Recognition",
    description: "Receive awards and appreciation for outstanding service.",
  },
  {
    icon: Megaphone,
    title: "Communication Skills",
    description: "Improve public speaking and confidence through activities.",
  },
  {
    icon: GraduationCap,
    title: "Personality Development",
    description: "Grow as a responsible, confident and disciplined citizen.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Benefits of Joining NSS
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            NSS offers opportunities that shape your career, personality,
            and contribution to society.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {benefits.map((benefit, index) => {

            const Icon = benefit.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
              >

                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">

                  <Icon size={32} />

                </div>

                <h3 className="text-xl font-bold text-[#0F2B7B]">

                  {benefit.title}

                </h3>

                <p className="mt-4 leading-7 text-gray-600">

                  {benefit.description}

                </p>

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}