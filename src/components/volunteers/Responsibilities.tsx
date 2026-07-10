import {
  CheckCircle2,
  CalendarCheck,
  HeartHandshake,
  ShieldCheck,
  Users,
  Award,
} from "lucide-react";

const responsibilities = [
  {
    icon: CalendarCheck,
    title: "Attend NSS Activities",
  },
  {
    icon: HeartHandshake,
    title: "Serve the Community",
  },
  {
    icon: Users,
    title: "Work as a Team",
  },
  {
    icon: ShieldCheck,
    title: "Maintain Discipline",
  },
  {
    icon: Award,
    title: "Represent the College",
  },
  {
    icon: CheckCircle2,
    title: "Complete Service Hours",
  },
];

export default function Responsibilities() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Roles & Responsibilities
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Every NSS volunteer contributes towards building a better society
            through dedication and service.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {responsibilities.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
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