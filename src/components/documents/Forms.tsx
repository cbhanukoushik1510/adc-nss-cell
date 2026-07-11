import { ClipboardList, Eye, Download } from "lucide-react";

const forms = [
  {
    title: "NSS Volunteer Nomination Form",
    description:
      "Official nomination form for students who wish to join the National Service Scheme (NSS).",
    view: "https://drive.google.com/file/d/1PJ2G3q9L-Q9xIBHClx8n0DApmAzApS73/view?usp=sharing",
    download:
      "https://drive.google.com/uc?export=download&id=1PJ2G3q9L-Q9xIBHClx8n0DApmAzApS73",
  },
  {
    title: "NSS Coordinator Nomination Form",
    description:
      "Official nomination form for students applying for NSS Coordinator positions.",
    view: "https://drive.google.com/file/d/15sNaK2lJqYaevLJFLcv-cZDCnZsr-mLG/view?usp=sharing",
    download:
      "https://drive.google.com/uc?export=download&id=15sNaK2lJqYaevLJFLcv-cZDCnZsr-mLG",
  },
];

export default function Forms() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Official Forms
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Download and access official NSS forms issued by Aurora's Degree &
            PG College - NSS Cell
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {forms.map((form) => (
            <div
              key={form.title}
              className="rounded-3xl border border-gray-200 bg-slate-50 p-8 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <ClipboardList
                size={42}
                className="mb-5 text-[#0F2B7B]"
              />

              <h3 className="text-2xl font-bold text-[#0F2B7B]">
                {form.title}
              </h3>

              <p className="mt-4 text-gray-600">
                {form.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={form.view}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B7B] px-5 py-3 font-semibold text-white transition hover:bg-[#173c9d]"
                >
                  <Eye size={18} />
                  View Form
                </a>

                <a
                  href={form.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}