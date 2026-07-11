import { leadership } from "@/data/leadership";

import LeadershipCard from "./LeadershipCard";

export default function LeadershipTimeline() {
  return (
    <section className="py-20">

      <div className="mx-auto max-w-7xl px-6">

        {leadership.map((year) => (

          <div
            key={year.year}
            className="mb-20"
          >

            <h2 className="mb-10 text-center text-4xl font-bold text-[#0F2B7B]">

              {year.year}

            </h2>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {year.members.map((member)=>(

                <LeadershipCard
                  key={member.name}
                  member={member}
                />

              ))}

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}