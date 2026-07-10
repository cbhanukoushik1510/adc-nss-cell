import { Download, FileText } from "lucide-react";

const files = [
  "NSS Manual",
  "Volunteer Handbook",
  "Code of Conduct",
  "Academic Calendar",
  "Volunteer Guidelines",
  "Orientation Handbook",
];

export default function Downloads() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Downloads
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Essential documents for NSS volunteers.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {files.map((file) => (

            <div
              key={file}
              className="rounded-3xl bg-slate-50 p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl"
            >

              <FileText className="mb-5 text-[#0F2B7B]" size={40} />

              <h3 className="text-2xl font-bold text-[#0F2B7B]">

                {file}

              </h3>

              <p className="mt-3 text-gray-600">

                Available Soon

              </p>

              <button
                disabled
                className="mt-6 flex items-center gap-2 rounded-xl bg-gray-300 px-5 py-3 font-semibold text-gray-600"
              >
                <Download size={18} />
                Download
              </button>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}