import { BarChart3 } from "lucide-react";

const reports = [
  "Annual NSS Report",
  "Event Reports",
  "Special Camp Report",
  "Volunteer Service Report",
  "Activity Summary",
];

export default function Reports() {
  return (
    <section className="bg-slate-50 py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            Reports

          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {reports.map((report) => (

            <div
              key={report}
              className="rounded-3xl bg-white p-8 shadow-lg"
            >

              <BarChart3
                size={40}
                className="mb-5 text-[#0F2B7B]"
              />

              <h3 className="text-xl font-bold text-[#0F2B7B]">

                {report}

              </h3>

              <p className="mt-3 text-gray-600">

                Report will be published here.

              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}