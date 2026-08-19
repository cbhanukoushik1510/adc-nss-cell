import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { quickAccess } from "@/data/quickAccess";

const colorMap = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
  yellow: "bg-yellow-100 text-yellow-700",
  pink: "bg-pink-100 text-pink-700",
};

export default function QuickAccess() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F2B7B]">
          Quick Access
        </h2>

        <p className="mt-1 text-gray-500">
          Quickly access your NSS services and resources.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">

        {quickAccess.map((item) => {
          const Icon = item.icon;

          const color =
            colorMap[
              item.color as keyof typeof colorMap
            ] || colorMap.blue;

          return (
            <Link
              key={item.title}
              href={item.href}
              aria-label={`Open ${item.title}`}
              className="group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#0F2B7B] hover:shadow-lg"
            >

              {/* Icon */}

              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${color} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={28} />
              </div>

              {/* Arrow */}

              <div className="absolute right-5 top-5 text-gray-300 transition-colors group-hover:text-[#0F2B7B]">
                <ArrowUpRight size={20} />
              </div>

              {/* Title */}

              <h3 className="font-semibold text-[#0F2B7B]">
                {item.title}
              </h3>

             

            </Link>
          );
        })}

      </div>

    </section>
  );
}