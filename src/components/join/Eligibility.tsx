import { CheckCircle2, ClipboardCheck } from "lucide-react";

const eligibility = [
  "Must be a student of Aurora's Degree & PG College.",
  "Should have a passion for community service.",
  "Must be willing to participate in NSS activities.",
  "Should maintain discipline and teamwork.",
  "Must follow NSS rules and college guidelines.",
  "Should be committed to social responsibility.",
];

const responsibilities = [
  "Participate actively in NSS events and camps.",
  "Maintain punctuality and regular attendance.",
  "Respect volunteers, faculty, and the community.",
  "Promote cleanliness and environmental awareness.",
  "Represent the college with dignity and discipline.",
  "Complete assigned community service activities.",
];

export default function Eligibility() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Eligibility & Responsibilities
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Before joining the National Service Scheme, every volunteer
            should understand the eligibility criteria and responsibilities.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Eligibility */}

          <div className="rounded-3xl bg-white p-8 shadow-lg">

            <div className="mb-6 flex items-center gap-3">
              <CheckCircle2
                className="text-green-600"
                size={34}
              />

              <h3 className="text-3xl font-bold text-[#0F2B7B]">
                Eligibility
              </h3>
            </div>

            <div className="space-y-5">

              {eligibility.map((item, index) => (

                <div
                  key={index}
                  className="flex gap-3"
                >
                  <CheckCircle2
                    className="mt-1 text-green-600"
                    size={20}
                  />

                  <p className="text-gray-700">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* Responsibilities */}

          <div className="rounded-3xl bg-white p-8 shadow-lg">

            <div className="mb-6 flex items-center gap-3">

              <ClipboardCheck
                className="text-blue-700"
                size={34}
              />

              <h3 className="text-3xl font-bold text-[#0F2B7B]">
                Responsibilities
              </h3>

            </div>

            <div className="space-y-5">

              {responsibilities.map((item, index) => (

                <div
                  key={index}
                  className="flex gap-3"
                >
                  <CheckCircle2
                    className="mt-1 text-blue-700"
                    size={20}
                  />

                  <p className="text-gray-700">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}