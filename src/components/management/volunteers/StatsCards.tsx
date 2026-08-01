import {
  Users,
  UserCheck,
  UserPlus,
  Clock3,
} from "lucide-react";

const stats = [
  {
    title: "Active Volunteers",
    value: "245",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    title: "Unit 1",
    value: "122",
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    title: "Unit 2",
    value: "123",
    icon: UserPlus,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    title: "Pending Approval",
    value: "18",
    icon: Clock3,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
];

export default function StatsCards() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((card) => {

        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-4xl font-bold text-[#0F2B7B]">
                  {card.value}
                </h2>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg}`}
              >
                <Icon
                  size={28}
                  className={card.color}
                />
              </div>

            </div>

          </div>
        );

      })}

    </section>
  );
}