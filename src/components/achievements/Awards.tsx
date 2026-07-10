import { Award } from "lucide-react";

const awards = [
  "Best NSS Unit",
  "Outstanding Volunteer Award",
  "Community Service Excellence",
  "Environmental Awareness Recognition",
  "Special Camp Appreciation",
  "Social Impact Award",
];

export default function Awards() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Awards & Recognition
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Honouring the achievements and dedication of our NSS Unit.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {awards.map((award) => (

            <div
              key={award}
              className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
            >

              <Award size={40} className="mb-5 text-[#0F2B7B]" />

              <h3 className="text-xl font-bold text-[#0F2B7B]">
                {award}
              </h3>

              <p className="mt-3 text-gray-600">
                Details will be updated soon.
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}