import {
  UserCheck,
  Users,
  ShieldCheck,
  Star,
} from "lucide-react";

const committee = [
  {
    icon: UserCheck,
    title: "Programme Officer",
    desc: "Provides leadership, guidance and overall coordination of NSS activities.",
  },
  {
    icon: ShieldCheck,
    title: "Faculty Coordinators",
    desc: "Assist in planning, organizing and monitoring NSS programmes.",
  },
  {
    icon: Users,
    title: "Student Coordinators",
    desc: "Lead volunteers, coordinate events and manage team communication.",
  },
  {
    icon: Star,
    title: "NSS Volunteers",
    desc: "Actively participate in community service, awareness campaigns and special camps.",
  },
];

export default function NSSCommittee() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            NSS Committee
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Our dedicated committee works together to organize impactful
            community service programmes and guide volunteers.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {committee.map((item, index) => {

            const Icon = item.icon;

            return (

              <div
                key={index}
                className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
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