import { Eye, Target } from "lucide-react";

export default function VisionMission() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Vision & Mission
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Building responsible citizens through education, leadership and
            community service.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-10 shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Eye size={32} />
            </div>

            <h3 className="text-3xl font-bold text-[#0F2B7B]">
              Vision
            </h3>

            <p className="mt-6 leading-8 text-gray-600">
              To create socially responsible youth committed to community
              development, environmental sustainability, and national
              integration through voluntary service.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-10 shadow-lg">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Target size={32} />
            </div>

            <h3 className="text-3xl font-bold text-[#0F2B7B]">
              Mission
            </h3>

            <ul className="mt-6 space-y-4 text-gray-600">
              <li>✅ Promote social responsibility.</li>
              <li>✅ Develop leadership qualities.</li>
              <li>✅ Encourage environmental awareness.</li>
              <li>✅ Organize community outreach activities.</li>
              <li>✅ Inspire students to serve society.</li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}