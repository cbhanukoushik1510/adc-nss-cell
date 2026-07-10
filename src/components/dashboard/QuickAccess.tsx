import Link from "next/link";
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
      <h2 className="text-2xl font-bold text-[#0F2B7B]">Quick Access</h2>

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3">
        {quickAccess.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-2xl border p-6 hover:shadow-lg transition block"
            >
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  colorMap[item.color as keyof typeof colorMap]
                }`}
              >
                <Icon size={28} />
              </div>

              <h3 className="font-semibold">{item.title}</h3>

              <p className="text-sm text-gray-500">{item.href}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}