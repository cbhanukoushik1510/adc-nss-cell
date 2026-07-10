import { BadgeCheck } from "lucide-react";

const badges = [
  "Best Volunteer",
  "Blood Donation Camp",
  "Leadership Award",
  "Green Campus Champion",
];

export default function Achievements() {
  return (
    <section className="mt-8 rounded-2xl bg-white p-8 shadow">

      <h2 className="text-3xl font-bold text-[#0F2B7B]">
        Achievements & Badges
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        {badges.map((badge) => (

          <div
            key={badge}
            className="flex items-center gap-3 rounded-xl border p-4 hover:bg-blue-50"
          >

            <BadgeCheck className="text-green-600" />

            <span>{badge}</span>

          </div>

        ))}

      </div>

    </section>
  );
}