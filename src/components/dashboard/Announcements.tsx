import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { announcements } from "@/data/announcements";

const badgeColors = {
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
};

export default function Announcements() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <Bell className="text-[#0F2B7B]" />

          <h2 className="text-2xl font-bold text-[#0F2B7B]">
            Announcements
          </h2>

        </div>

        <Link
          href="/dashboard/announcements"
          className="text-sm font-semibold text-[#0F2B7B]"
        >
          View All →
        </Link>

      </div>

      <div className="space-y-5">

        {announcements.map((item) => (

          <div
            key={item.id}
            className="rounded-2xl border p-5 transition hover:border-[#0F2B7B] hover:shadow-md"
          >

            <div className="flex items-center justify-between">

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  badgeColors[item.color as keyof typeof badgeColors]
                }`}
              >
                {item.category}
              </span>

              <span className="text-sm text-gray-500">
                {item.date}
              </span>

            </div>

            <h3 className="mt-4 text-lg font-bold text-[#0F2B7B]">
              {item.title}
            </h3>

            <p className="mt-2 text-gray-600">
              {item.description}
            </p>

            <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B7B] hover:underline">

              Read More

              <ArrowRight size={16} />

            </button>

          </div>

        ))}

      </div>

    </section>
  );
}