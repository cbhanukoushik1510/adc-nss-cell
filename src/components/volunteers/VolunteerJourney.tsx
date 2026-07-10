import {
  UserPlus,
  BadgeCheck,
  CalendarDays,
  Award,
  ArrowDown,
} from "lucide-react";

const journey = [
  {
    icon: UserPlus,
    title: "Register",
  },
  {
    icon: BadgeCheck,
    title: "Get Approved",
  },
  {
    icon: CalendarDays,
    title: "Participate in Events",
  },
  {
    icon: Award,
    title: "Earn Certificate",
  },
];

export default function VolunteerJourney() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-6xl px-6 text-center">

        <h2 className="text-4xl font-bold text-[#0F2B7B]">

          Volunteer Journey

        </h2>

        <p className="mt-4 text-lg text-gray-600">

          Your journey from registration to becoming an active NSS volunteer.

        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-4">

          {journey.map((step, index) => {

            const Icon = step.icon;

            return (

              <div key={index} className="relative">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

                  <Icon size={34} />

                </div>

                <h3 className="mt-6 text-xl font-bold text-[#0F2B7B]">

                  {step.title}

                </h3>

                {index !== journey.length - 1 && (
                  <ArrowDown className="mx-auto mt-6 hidden md:block text-[#0F2B7B]" />
                )}

              </div>

            );

          })}

        </div>

      </div>

    </section>
  );
}