import { ClipboardList } from "lucide-react";

const forms = [
  "Volunteer Registration Form",
  "Leave Request Form",
  "Event Participation Form",
  "Certificate Request Form",
  "Feedback Form",
];

export default function Forms() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">

            Forms

          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {forms.map((form) => (

            <div
              key={form}
              className="rounded-3xl border bg-slate-50 p-8 shadow-md"
            >

              <ClipboardList
                size={40}
                className="mb-5 text-[#0F2B7B]"
              />

              <h3 className="text-xl font-bold text-[#0F2B7B]">

                {form}

              </h3>

              <p className="mt-3 text-gray-600">

                Form will be available soon.

              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}