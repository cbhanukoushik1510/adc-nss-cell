import { Eye, Target } from "lucide-react";

export default function VisionMission() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Vision & Mission
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            Empowering youth to become responsible citizens through voluntary
            service, leadership, and community engagement.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">

          {/* Vision */}

          <div className="rounded-3xl bg-slate-50 p-10 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Eye size={34} />
            </div>

            <h3 className="mb-5 text-3xl font-bold text-[#0F2B7B]">
              Our Vision
            </h3>

            <p className="leading-8 text-gray-600">
              To develop socially responsible, compassionate, and committed
              youth who actively contribute towards nation-building through
              voluntary service, leadership, environmental awareness, and
              community development.
            </p>

          </div>

          {/* Mission */}

          <div className="rounded-3xl bg-slate-50 p-10 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F2B7B] text-white">
              <Target size={34} />
            </div>

            <h3 className="mb-5 text-3xl font-bold text-[#0F2B7B]">
              Our Mission
            </h3>

            <ul className="space-y-4 text-gray-600">

              <li>✅ Promote community service and social responsibility.</li>

              <li>✅ Develop leadership and teamwork skills.</li>

              <li>✅ Encourage environmental conservation.</li>

              <li>✅ Organize awareness campaigns and special camps.</li>

              <li>✅ Build responsible citizens committed to national development.</li>

            </ul>

          </div>

        </div>

      </div>
    </section>
  );
}