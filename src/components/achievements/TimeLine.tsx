import {
  CalendarDays,
  Trophy,
} from "lucide-react";

const timeline = [
  {
    year: "2023",
    achievement: "Community Awareness Campaigns",
  },
  {
    year: "2024",
    achievement: "Environmental & Plantation Drives",
  },
  {
    year: "2025",
    achievement: "Health Camps & Blood Donation",
  },
  {
    year: "2026",
    achievement: "Leadership Development & Social Impact",
  },
];

export default function Timeline() {
  return (
    <section className="bg-white py-20">

      <div className="mx-auto max-w-5xl px-6">

        <div className="mb-14 text-center">

          <h2 className="text-4xl font-bold text-[#0F2B7B]">
            Achievement Timeline
          </h2>

          <p className="mt-4 text-lg text-gray-600">
            A journey of service, leadership and community development.
          </p>

        </div>

        <div className="space-y-8">

          {timeline.map((item) => (

            <div
              key={item.year}
              className="flex items-center gap-6 rounded-3xl bg-slate-50 p-8 shadow-md"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2B7B] text-white">

                <CalendarDays size={28} />

              </div>

              <div className="flex-1">

                <h3 className="text-2xl font-bold text-[#0F2B7B]">
                  {item.year}
                </h3>

                <p className="mt-2 text-gray-600">
                  {item.achievement}
                </p>

              </div>

              <Trophy className="text-yellow-500" size={30} />

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}